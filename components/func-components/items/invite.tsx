import React, { useState, useCallback, useEffect } from 'react';
import { FaCopy } from 'react-icons/fa';

//invite data:
//cid, email, full_name, nickname, notes, self_invited,created (datetime),visited (datetime),account_created (datetime),subscribed (datetime),canceled (datetime)
// email, full_name, nickname, notes - editable
// self_invited - boolean
// created, visited, account_created, subscribed, canceled - datetime
// cid - uuid

interface InviteProps {
    cid: string;
    email?: string; // Make email optional
    full_name: string;
    nickname: string;
    notes: string;
    self_invited: boolean;
    created: string;
    visited: string | null;
    account_created: string | null;
    subscribed: string | null;
    canceled: string | null;
    tag: string; // Add tag field
    onUpdate: (updatedData: Partial<InviteProps>) => void;
}

const Invite: React.FC<InviteProps> = ({
    cid,
    email,
    full_name,
    nickname,
    notes,
    self_invited,
    created,
    visited,
    account_created,
    subscribed,
    canceled,
    tag, // Add tag to destructuring
    onUpdate
}) => {
    const [editedData, setEditedData] = useState({
        cid,
        email,
        full_name,
        nickname,
        notes,
        tag // Add tag to editedData
    });
    const [editingField, setEditingField] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);

    // Add this useEffect hook
    useEffect(() => {
        setEditedData({
            cid,
            email,
            full_name,
            nickname,
            notes,
            tag // Add tag to useEffect
        });
    }, [cid, email, full_name, nickname, notes, tag]);

    const getBgColor = () => {
        if (canceled) return 'bg-red-100 dark:bg-red-900';
        if (subscribed) return 'bg-green-100 dark:bg-green-900';
        if (account_created) return 'bg-blue-100 dark:bg-blue-900';
        if (visited) return 'bg-yellow-100 dark:bg-yellow-900';
        return 'bg-gray-100 dark:bg-gray-800';
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
        });
    };

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setEditedData(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleUpdate = useCallback(() => {
        onUpdate(editedData);
        setEditingField(null);
    }, [editedData, onUpdate]);

    const handleCancel = useCallback(() => {
        setEditedData({ cid, email, full_name, nickname, notes, tag });
        setEditingField(null);
    }, [cid, email, full_name, nickname, notes, tag]);

    const handleFieldClick = useCallback((e: React.MouseEvent, fieldName: string) => {
        e.stopPropagation();
        setEditingField(fieldName);
    }, []);

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(cid);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const renderEditableField = (name: string, value: string, type: string = 'text') => {
        return editingField === name ? (
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleInputChange}
                onBlur={() => setEditingField(null)}
                autoFocus
                className="bg-transparent border border-blue-500 rounded px-1 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
                onClick={(e) => e.stopPropagation()}
            />
        ) : (
            <span
                className="cursor-pointer hover:text-blue-500"
                onClick={(e) => handleFieldClick(e, name)}
            >
                {value}
            </span>
        );
    };

    return (
        <div
            className={`p-4 mb-4 rounded-lg shadow-md ${getBgColor()} text-gray-800 dark:text-gray-200 cursor-pointer w-full max-w-sm md:max-w-3xl mx-auto`}
            onClick={() => setEditingField(null)}
        >
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                    {editingField === 'full_name' ? (
                        <input
                            type="text"
                            name="full_name"
                            value={editedData.full_name}
                            onChange={handleInputChange}
                            onBlur={() => setEditingField(null)}
                            autoFocus
                            className="bg-transparent border border-blue-500 rounded px-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <span
                            className="cursor-pointer hover:text-blue-500"
                            onClick={(e) => handleFieldClick(e, 'full_name')}
                        >
                            {editedData.full_name}
                        </span>
                    )}
                </h3>
                <div className="flex items-center">
                    <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">{cid}</span>
                    <button
                        onClick={copyToClipboard}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none"
                        title="Copy CID to clipboard"
                    >
                        <FaCopy />
                    </button>
                    {copySuccess && <span className="text-green-500 ml-2">Copied!</span>}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div>
                    <p className="flex items-center mb-2"><strong className="w-28">Email:</strong> <span className="flex-grow">{renderEditableField('email', editedData.email || '', 'email')}</span></p>
                    <p className="flex items-center mb-2"><strong className="w-28">Nickname:</strong> <span className="flex-grow">{renderEditableField('nickname', editedData.nickname)}</span></p>
                    <p className="flex items-center mb-2"><strong className="w-28">Self Invited:</strong> <span className="flex-grow">{self_invited ? 'Yes' : 'No'}</span></p>
                    <p className="flex items-center mb-2"><strong className="w-28">Tag:</strong> <span className="flex-grow">{renderEditableField('tag', editedData.tag)}</span></p>
                </div>
                <div>
                    <p className="mb-2"><strong className="w-28 inline-block">Created:</strong> {formatDate(created)}</p>
                    <p className="mb-2"><strong className="w-28 inline-block">Visited:</strong> {formatDate(visited)}</p>
                    <p className="mb-2"><strong className="w-28 inline-block">Account Created:</strong> {formatDate(account_created)}</p>
                    <p className="mb-2"><strong className="w-28 inline-block">Subscribed:</strong> {formatDate(subscribed)}</p>
                    <p className="mb-2"><strong className="w-28 inline-block">Canceled:</strong> {formatDate(canceled)}</p>
                </div>
            </div>
            <div className="mt-4">
                <strong className="block mb-2">Notes:</strong>
                {editingField === 'notes' ? (
                    <textarea
                        name="notes"
                        value={editedData.notes}
                        onChange={handleInputChange}
                        onBlur={() => setEditingField(null)}
                        autoFocus
                        className="w-full p-2 text-sm text-gray-700 dark:text-gray-300 bg-transparent border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <p
                        className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer hover:text-blue-500"
                        onClick={(e) => handleFieldClick(e, 'notes')}
                    >
                        {editedData.notes}
                    </p>
                )}
            </div>
        </div>
    );
};

export default Invite;

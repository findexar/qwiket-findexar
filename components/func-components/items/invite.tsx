import React, { useState, useCallback } from 'react';
import { FaCopy } from 'react-icons/fa';

//invite data:
//cid, email, full_name, nickname, notes, self_invited,created (datetime),visited (datetime),account_created (datetime),subscribed (datetime),canceled (datetime)
// email, full_name, nickname, notes - editable
// self_invited - boolean
// created, visited, account_created, subscribed, canceled - datetime
// cid - uuid

interface InviteProps {
    cid: string;
    email: string;
    full_name: string;
    nickname: string;
    notes: string;
    self_invited: boolean;
    created: string;
    visited: string | null;
    account_created: string | null;
    subscribed: string | null;
    canceled: string | null;
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
    onUpdate
}) => {
    const [editedData, setEditedData] = useState({
        cid,
        email,
        full_name,
        nickname,
        notes
    });
    const [isEditing, setIsEditing] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

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
        setIsEditing(false);
    }, [editedData, onUpdate]);

    const handleCancel = useCallback(() => {
        setEditedData({ cid, email, full_name, nickname, notes });
        setIsEditing(false);
    }, [email, full_name, nickname, notes]);

    const handleComponentClick = useCallback(() => {
        if (!isEditing) {
            setIsEditing(true);
        }
    }, [isEditing]);

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
        return isEditing ? (
            <input
                type={type}
                name={name}
                value={value}
                onChange={handleInputChange}
                className="ml-2 bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500"
            />
        ) : (
            <span className="ml-2">{value}</span>
        );
    };

    return (
        <div
            className={`p-4 mb-4 rounded-lg shadow-md ${getBgColor()} text-gray-800 dark:text-gray-200 cursor-pointer`}
            onClick={handleComponentClick}
        >
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold">
                    {isEditing ? (
                        <input
                            type="text"
                            name="full_name"
                            value={editedData.full_name}
                            onChange={handleInputChange}
                            className="bg-transparent border-b border-gray-300 dark:border-gray-700 focus:outline-none focus:border-blue-500"
                        />
                    ) : (
                        editedData.full_name
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
            <div className="grid grid-cols-2 gap-2">
                <div>
                    <p><strong>Email:</strong> {renderEditableField('email', editedData.email, 'email')}</p>
                    <p><strong>Nickname:</strong> {renderEditableField('nickname', editedData.nickname)}</p>
                    <p><strong>Self Invited:</strong> {self_invited ? 'Yes' : 'No'}</p>
                </div>
                <div>
                    <p><strong>Created:</strong> {formatDate(created)}</p>
                    <p><strong>Visited:</strong> {formatDate(visited)}</p>
                    <p><strong>Account Created:</strong> {formatDate(account_created)}</p>
                    <p><strong>Subscribed:</strong> {formatDate(subscribed)}</p>
                    <p><strong>Canceled:</strong> {formatDate(canceled)}</p>
                </div>
            </div>
            <div className="mt-2">
                <strong>Notes:</strong>
                {isEditing ? (
                    <textarea
                        name="notes"
                        value={editedData.notes}
                        onChange={handleInputChange}
                        className="w-full mt-1 p-2 text-sm text-gray-700 dark:text-gray-300 bg-transparent border rounded focus:outline-none focus:border-blue-500"
                        rows={3}
                    />
                ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-300">{editedData.notes}</p>
                )}
            </div>
            {isEditing && (
                <div className="mt-4 flex space-x-2">
                    <button
                        onClick={handleUpdate}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        Update
                    </button>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Cancel
                    </button>
                </div>
            )}
        </div>
    );
};

export default Invite;
import { UserDocument } from "@/lib/types/chat";
import { useState, useEffect, useCallback } from "react";
import { useAppContext } from "@lib/context";
import { fetchUserDocuments, saveChatDocuments, deleteUploadedDocument, actionUserDocuments, actionSaveUploadedDocument } from "@/lib/fetchers/chat";
import useSWR from 'swr';
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import { FetchUserDocumentsKey } from "@/lib/keys";

interface CreatorModeProps {
    chatUUId: string | null;
    onSelectedDocumentsChange: (documents: UserDocument[]) => void;
    selectedDocuments: UserDocument[];
}

const CreatorMode: React.FC<CreatorModeProps> = ({ chatUUId, onSelectedDocumentsChange, selectedDocuments }) => {
    const { fallback, prompt, promptUUId, mode, isMobile, noUser, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, params, tp, league, pagetype, teamid, player, teamName, setTeamName, athleteUUId, userAccount, userAccountMutate, user, utm_content } = useAppContext();

    const [styleDocuments, setStyleDocuments] = useState<UserDocument[]>([]);
    const [dataDocuments, setDataDocuments] = useState<UserDocument[]>([]);
    const [uploader, setUploader] = useState<boolean>(false);

    const [editingDocument, setEditingDocument] = useState<{ [key: string]: UserDocument }>({});
    // Fetch user documents with fallback
    const key: FetchUserDocumentsKey = { type: 'fetch-user-documents', chatUUId: chatUUId || '' };
    const { data: userDocuments, mutate } = useSWR(key, actionUserDocuments, fallback);
    console.log(`userDocuments: ${JSON.stringify(userDocuments)}`);
    const handleEdit = (uuid: string, field: keyof UserDocument, value: string) => {
        setEditingDocument(prev => ({
            ...prev,
            [uuid]: {
                ...prev[uuid],
                [field]: value
            }
        }));
    };

    const handleUpdate = async (uuid: string) => {
        if (editingDocument[uuid]) {
            try {
                await actionSaveUploadedDocument(editingDocument[uuid], chatUUId || "");
                mutate();
                setEditingDocument(prev => {
                    const { [uuid]: _, ...rest } = prev;
                    return rest;
                });
            } catch (error) {
                console.error("Error updating document:", error);
            }
        }
    };

    const toggleSelectDocument = async (uuid: string, type: 'STYLE' | 'DATA') => {
        const documents = type === 'STYLE' ? styleDocuments : dataDocuments;
        const updatedDocuments = documents.map(doc =>
            doc.uuid === uuid ? { ...doc, selected: !doc.selected } : doc
        );

        if (type === 'STYLE') {
            setStyleDocuments(updatedDocuments);
        } else {
            setDataDocuments(updatedDocuments);
        }

        const allSelectedDocuments = [...updatedDocuments.filter(doc => doc.selected),
        ...(type === 'STYLE' ? dataDocuments : styleDocuments).filter(doc => doc.selected)];

        onSelectedDocumentsChange(allSelectedDocuments);

        if (chatUUId) {
            await saveChatDocuments(chatUUId, allSelectedDocuments.map(doc => doc.uuid).join(','));
            mutate();
        }
    };

    const deleteDocument = async (uuid: string, type: 'STYLE' | 'DATA') => {
        try {
            // await deleteUploadedDocument(uuid);
            // const updatedDocuments = userDocuments.filter(doc => doc.uuid !== uuid);
            // mutate(updatedDocuments, false);
        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    const handleFileUploadSuccess = useCallback((type: 'STYLE' | 'DATA', event: any) => {
        console.log(` handleFileUploadSuccess event: ${JSON.stringify(event)}`);
        const uuid = event.uuid;
        let document: UserDocument = { uuid, type, name: event.name, title: '', description: '', selected: true };
        actionSaveUploadedDocument(document, chatUUId || "").then(() => {
            if (chatUUId) {
                mutate();
            }
            if (chatUUId === "") {
                const updatedSelectedDocuments = [...selectedDocuments, document];
                onSelectedDocumentsChange(updatedSelectedDocuments);
            }
        });
    }, [mutate, selectedDocuments, onSelectedDocumentsChange, chatUUId]);

    const renderDocumentList = (documents: UserDocument[], type: 'STYLE' | 'DATA') => (
        documents.map(doc => {
            const isEditing = !!editingDocument[doc.uuid];
            const currentDoc = isEditing ? editingDocument[doc.uuid] : doc;

            return (
                <div key={doc.uuid} className="mb-4 p-4 border rounded dark:border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <input
                            type="checkbox"
                            checked={currentDoc.selected}
                            onChange={() => toggleSelectDocument(doc.uuid, type)}
                            className="mr-2"
                        />
                        <span className="font-semibold dark:text-gray-200">{currentDoc.name}</span>
                        <button
                            onClick={() => deleteDocument(doc.uuid, type)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                            Delete
                        </button>
                    </div>
                    <input
                        type="text"
                        value={currentDoc.title}
                        onChange={(e) => handleEdit(doc.uuid, 'title', e.target.value)}
                        className="w-full mb-2 p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                        placeholder="Title"
                        onFocus={() => !isEditing && setEditingDocument(prev => ({ ...prev, [doc.uuid]: { ...doc } }))}
                    />
                    <textarea
                        value={currentDoc.description}
                        onChange={(e) => handleEdit(doc.uuid, 'description', e.target.value)}
                        className="w-full mb-2 p-2 border rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 dark:border-gray-600"
                        placeholder="Description"
                        rows={3}
                        onFocus={() => !isEditing && setEditingDocument(prev => ({ ...prev, [doc.uuid]: { ...doc } }))}
                    />
                    {isEditing && (
                        <button
                            onClick={() => handleUpdate(doc.uuid)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                        >
                            Update
                        </button>
                    )}
                </div>
            );
        })
    );

    useEffect(() => {
        if (userDocuments) {
            const updateDocuments = (docs: UserDocument[]) => {
                return docs.map(doc => ({
                    ...doc,
                    selected: chatUUId === "" ? selectedDocuments.some(sd => sd.uuid === doc.uuid) : doc.selected
                }));
            };

            setStyleDocuments(updateDocuments(userDocuments.filter((doc: UserDocument) => doc.type === 'STYLE')));
            setDataDocuments(updateDocuments(userDocuments.filter((doc: UserDocument) => doc.type === 'DATA')));
        }
    }, [userDocuments, selectedDocuments, chatUUId]);

    return (
        <div className="creator-mode">
            <section>
                <h2 className="text-lg font-semibold mb-2">Style Documents</h2>
                {styleDocuments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No style documents available. Upload one to get started.</p>
                ) : (
                    renderDocumentList(styleDocuments, 'STYLE')
                )}
                <div className="flex justify-end mt-2">
                    <FileUploaderRegular sourceList={'local,url,dropbox,gdrive,onedrive'} onFileUploadSuccess={(event: any) => handleFileUploadSuccess('STYLE', event)} pubkey={process.env.NEXT_PUBLIC_CDNKEY || ''} />
                </div>
            </section>

            <section>
                <h2 className="text-lg font-semibold mb-2">Additional Context Documents</h2>
                {dataDocuments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400">No context data documents available. Upload one to get started.</p>
                ) : (
                    dataDocuments.map(doc => (
                        <div key={doc.uuid} className="flex items-center justify-between mb-2">
                            <div>
                                <input
                                    type="checkbox"
                                    checked={doc.selected}
                                    onChange={() => toggleSelectDocument(doc.uuid, 'DATA')}
                                    className="mr-2"
                                />
                                <span>{doc.title}</span>
                            </div>
                            <button
                                onClick={() => deleteDocument(doc.uuid, 'DATA')}
                                className="text-red-500 hover:text-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    ))
                )}
                <div className="flex justify-end mt-2">
                    <FileUploaderRegular sourceList={'local,url,dropbox,gdrive,onedrive'} onFileUploadSuccess={(event: any) => handleFileUploadSuccess('DATA', event)} pubkey={process.env.NEXT_PUBLIC_CDNKEY || ''} />
                </div>
            </section>

        </div>
    );
};

export default CreatorMode;

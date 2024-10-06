import { UserDocument } from "@/lib/types/chat";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "@lib/context";
import { fetchUserDocuments, saveChatDocuments, deleteUploadedDocument, actionUserDocuments, actionSaveUploadedDocument, actionDeleteUploadedDocument } from "@/lib/fetchers/chat";
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
    const [hasChanges, setHasChanges] = useState<{ [key: string]: boolean }>({});
    const editingRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (editingRef.current && !editingRef.current.contains(event.target as Node)) {
                handleStopEditing();
            }
        };

        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleStopEditing();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscKey);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscKey);
        };
    }, []);

    // Fetch user documents with fallback
    const key: FetchUserDocumentsKey = { type: 'fetch-user-documents', chatUUId: chatUUId || '' };
    const { data: userDocuments, mutate } = useSWR(key, actionUserDocuments, fallback);
    console.log(`userDocuments: ${JSON.stringify(userDocuments)}`);

    console.log(`selectedDocuments: ${JSON.stringify(selectedDocuments)}`);

    const handleEdit = (uuid: string, field: keyof UserDocument, value: string) => {
        setEditingDocument(prev => ({
            ...prev,
            [uuid]: {
                ...prev[uuid],
                [field]: value
            }
        }));
        setHasChanges(prev => ({ ...prev, [uuid]: true }));
    };

    const handleStopEditing = () => {
        setTimeout(() => {
            setEditingDocument(prevEditing => {
                const newEditing = { ...prevEditing };
                Object.keys(newEditing).forEach(uuid => {
                    if (hasChanges[uuid]) {
                        if (window.confirm("You have unsaved changes. Are you sure you want to discard them?")) {
                            delete newEditing[uuid];
                            setHasChanges(prev => {
                                const newHasChanges = { ...prev };
                                delete newHasChanges[uuid];
                                return newHasChanges;
                            });
                        }
                    } else {
                        delete newEditing[uuid];
                    }
                });
                return newEditing;
            });
        }, 100);
    };

    const discardChanges = (uuid: string) => {
        setEditingDocument(prev => {
            const { [uuid]: _, ...rest } = prev;
            return rest;
        });
        setHasChanges(prev => {
            const { [uuid]: _, ...rest } = prev;
            return rest;
        });
    };

    const handleUpdate = async (uuid: string) => {
        if (editingDocument[uuid]) {
            const updatedDocument = editingDocument[uuid];

            // Update local state
            const updateLocalDocuments = (documents: UserDocument[]) =>
                documents.map(doc => doc.uuid === uuid ? { ...doc, ...updatedDocument } : doc);

            setStyleDocuments(prev => updateLocalDocuments(prev));
            setDataDocuments(prev => updateLocalDocuments(prev));

            // Clear the editing state and hasChanges flag for this document
            setEditingDocument(prev => {
                const { [uuid]: _, ...rest } = prev;
                return rest;
            });
            setHasChanges(prev => {
                const { [uuid]: _, ...rest } = prev;
                return rest;
            });

            if (chatUUId && chatUUId !== "_new") {
                try {
                    await actionSaveUploadedDocument(updatedDocument, chatUUId);
                    mutate();
                } catch (error) {
                    console.error("Error updating document:", error);
                }
            } else {
                // Update locally when chatUUId is not set
                const updatedDocuments = selectedDocuments.map(doc =>
                    doc.uuid === uuid ? { ...doc, ...updatedDocument } : doc
                );
                onSelectedDocumentsChange(updatedDocuments);
            }
        }
    };

    const toggleSelectDocument = async (uuid: string, type: 'STYLE' | 'DATA') => {
        console.log(`toggleSelectDocument uuid: ${uuid}, type: ${type}`);
        const documents = type === 'STYLE' ? styleDocuments : dataDocuments;
        const updatedDocuments = documents.map(doc =>
            doc.uuid === uuid ? { ...doc, selected: doc.selected === 1 ? 0 : 1 } : doc
        );

        if (type === 'STYLE') {
            setStyleDocuments(updatedDocuments);
        } else {
            setDataDocuments(updatedDocuments);
        }

        const allSelectedDocuments = [...updatedDocuments.filter(doc => doc.selected === 1),
        ...(type === 'STYLE' ? dataDocuments : styleDocuments).filter(doc => doc.selected === 1)];
        console.log(`allSelectedDocuments: ${JSON.stringify(allSelectedDocuments)}`);
        onSelectedDocumentsChange(allSelectedDocuments);

        if (chatUUId && chatUUId !== "_new") {
            await saveChatDocuments(chatUUId, allSelectedDocuments.map(doc => doc.uuid).join(','));
            mutate();
        }
    };

    const deleteDocument = async (uuid: string, type: 'STYLE' | 'DATA') => {
        try {
            console.log(`deleteDocument uuid: ${uuid}`);
            const updatedDocuments = userDocuments?.filter(doc => doc.uuid !== uuid);
            if (updatedDocuments && chatUUId && chatUUId !== "_new") {
                mutate(updatedDocuments, false);
            }
            if (!chatUUId || chatUUId === "_new") {
                const updatedSelectedDocuments = selectedDocuments.filter(doc => doc.uuid !== uuid);
                onSelectedDocumentsChange(updatedSelectedDocuments);
            }
            await actionDeleteUploadedDocument(uuid);

        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    const handleFileUploadSuccess = useCallback((type: 'STYLE' | 'DATA', event: any) => {
        console.log(` handleFileUploadSuccess event: ${JSON.stringify(event)}`);
        const uuid = event.uuid;
        let document: UserDocument = { uuid, type, name: event.name, title: '', description: '', selected: 1 };
        actionSaveUploadedDocument(document, chatUUId && chatUUId !== "_new" ? chatUUId : "").then(() => {
            if (chatUUId && chatUUId !== "_new") {
                mutate();
            }
            if (!chatUUId || chatUUId === "_new") {
                const updatedSelectedDocuments = [...selectedDocuments, document];
                console.log(`handleFileUploadSuccess=>updatedSelectedDocuments: ${JSON.stringify(updatedSelectedDocuments)}`);
                onSelectedDocumentsChange(updatedSelectedDocuments);
            }
        });
    }, [mutate, selectedDocuments, onSelectedDocumentsChange, chatUUId]);

    const renderDocumentList = (documents: UserDocument[], type: 'STYLE' | 'DATA') => (
        documents.map(doc => {
            const isEditing = !!editingDocument[doc.uuid];
            const currentDoc = isEditing ? editingDocument[doc.uuid] : doc;

            return (
                <div key={doc.uuid} className={`mb-4 p-4 border rounded ${isEditing ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'} dark:border-gray-700`} ref={isEditing ? editingRef : null}>
                    <div className="flex items-center justify-between mb-2">
                        <input
                            type="checkbox"
                            checked={currentDoc.selected === 1}
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
                        onFocus={() => !isEditing && setEditingDocument(prev => ({ ...prev, [doc.uuid]: { ...doc } }))}
                        onBlur={() => setTimeout(handleStopEditing, 100)}
                        className={`w-full mb-2 p-2 border rounded ${isEditing ? 'bg-white' : 'bg-gray-100'} dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600`}
                        placeholder="Title"
                        readOnly={!isEditing}
                    />
                    <textarea
                        value={currentDoc.description}
                        onChange={(e) => handleEdit(doc.uuid, 'description', e.target.value)}
                        onFocus={() => !isEditing && setEditingDocument(prev => ({ ...prev, [doc.uuid]: { ...doc } }))}
                        onBlur={() => setTimeout(handleStopEditing, 100)}
                        className={`w-full mb-2 p-2 border rounded ${isEditing ? 'bg-white' : 'bg-gray-100'} dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600`}
                        placeholder="Description"
                        rows={3}
                        readOnly={!isEditing}
                    />
                    {isEditing && hasChanges[doc.uuid] && (
                        <div className="flex justify-end space-x-2 mt-2">
                            <button
                                onClick={() => discardChanges(doc.uuid)}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleUpdate(doc.uuid)}
                                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                            >
                                Update
                            </button>
                        </div>
                    )}
                </div>
            );
        })
    );

    useEffect(() => {
        console.log(`useEffect=>userDocuments: ${JSON.stringify(userDocuments)}`);
        console.log(`useEffect=>selectedDocuments: ${JSON.stringify(selectedDocuments)}`);

        const updateDocuments = (type: 'STYLE' | 'DATA') => {
            // Start with all selectedDocuments of the given type
            const updatedDocs = selectedDocuments.filter(doc => doc.type === type);

            // If userDocuments exist, add those that aren't already in selectedDocuments
            if (userDocuments && userDocuments.length > 0) {
                const selectedDocsMap = new Map(selectedDocuments.map(doc => [doc.uuid, doc]));
                userDocuments.forEach(userDoc => {
                    if (userDoc.type === type && !selectedDocsMap.has(userDoc.uuid)) {
                        updatedDocs.push(userDoc);
                    }
                });
            }

            return updatedDocs;
        };

        setStyleDocuments(updateDocuments('STYLE'));
        setDataDocuments(updateDocuments('DATA'));
    }, [userDocuments, selectedDocuments]);

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
                    renderDocumentList(dataDocuments, 'DATA')
                )}
                <div className="flex justify-end mt-2">
                    <FileUploaderRegular sourceList={'local,url,dropbox,gdrive,onedrive'} onFileUploadSuccess={(event: any) => handleFileUploadSuccess('DATA', event)} pubkey={process.env.NEXT_PUBLIC_CDNKEY || ''} />
                </div>
            </section>

        </div>
    );
};

export default CreatorMode;
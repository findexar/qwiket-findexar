import { UserDocument } from "@/lib/types/chat";
import { useState, useEffect, useCallback, useRef } from "react";
import { useAppContext } from "@lib/context";
import { fetchUserDocuments, saveChatDocuments, deleteUploadedDocument, actionUserDocuments, actionSaveUploadedDocument, actionDeleteUploadedDocument } from "@/lib/fetchers/chat";
import useSWR from 'swr';
import { FileUploaderRegular } from "@uploadcare/react-uploader";
import "@uploadcare/react-uploader/core.css";
import { FetchUserDocumentsKey } from "@/lib/keys";
import { actionRecordEvent as recordEvent } from "@/lib/actions";

interface CreatorModeProps {
    chatUUId: string | null;
    onSelectedDocumentsChange: (documents: UserDocument[]) => void;
    selectedDocuments: UserDocument[];
}

interface WarningModalProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
}

const WarningModal: React.FC<WarningModalProps> = ({ isOpen, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-sm w-full">
                <p className="mb-4 text-gray-800 dark:text-gray-200">You have unsaved changes. Do you want to save them before switching?</p>
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
                    >
                        Continue Editing
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
                    >
                        Switch Without Saving
                    </button>
                </div>
            </div>
        </div>
    );
};

const CreatorMode: React.FC<CreatorModeProps> = ({ chatUUId, onSelectedDocumentsChange, selectedDocuments }) => {
    const { fallback, prompt, promptUUId, mode, isMobile, noUser, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, params, tp, league, pagetype, teamid, player, teamName, setTeamName, athleteUUId, userAccount, userAccountMutate, user, utm_content } = useAppContext();

    const [styleDocuments, setStyleDocuments] = useState<UserDocument[]>([]);
    const [dataDocuments, setDataDocuments] = useState<UserDocument[]>([]);
    const [uploader, setUploader] = useState<boolean>(false);

    const [editingDocument, setEditingDocument] = useState<{ [key: string]: UserDocument }>({});
    const [hasChanges, setHasChanges] = useState<{ [key: string]: boolean }>({});
    const editingRef = useRef<HTMLDivElement>(null);

    const [activeEditingUuid, setActiveEditingUuid] = useState<string | null>(null);
    const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
    const [pendingEditUuid, setPendingEditUuid] = useState<string | null>(null);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                event.preventDefault();
                event.returnValue = '';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [hasUnsavedChanges]);

    useEffect(() => {
        setHasUnsavedChanges(Object.values(hasChanges).some(Boolean));
    }, [hasChanges]);

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

    useEffect(() => {
        if (userDocuments) {
            console.log("Updating documents from userDocuments:", userDocuments);
            setStyleDocuments(userDocuments.filter(doc => doc.type === 'STYLE'));
            setDataDocuments(userDocuments.filter(doc => doc.type === 'DATA'));

            // Create a map of existing selectedDocuments for quick lookup
            const selectedDocsMap = new Map(selectedDocuments.map(doc => [doc.uuid, doc]));

            // Update selectedDocuments based on userDocuments
            const updatedSelectedDocs = userDocuments.filter(doc => doc.selected === 1).map(doc => {
                // If the document already exists in selectedDocuments, use that version
                return selectedDocsMap.get(doc.uuid) || doc;
            });

            //console.log(`==>updatedSelectedDocs: ${JSON.stringify(updatedSelectedDocs)}`);
            if (JSON.stringify(updatedSelectedDocs) !== JSON.stringify(selectedDocuments)) {
                console.log(`Updating selectedDocuments from userDocuments: ${JSON.stringify(updatedSelectedDocs)}`);
                onSelectedDocumentsChange(updatedSelectedDocs);
            }
        }
    }, [userDocuments]);

    const startEditing = (uuid: string) => {
        console.log("startEditing called with uuid:", uuid);
        if (activeEditingUuid && activeEditingUuid !== uuid && hasChanges[activeEditingUuid]) {
            console.log("Showing warning modal for unsaved changes");
            setPendingEditUuid(uuid);
            setIsWarningModalOpen(true);
        } else {
            console.log("Setting active editing uuid:", uuid);
            setActiveEditingUuid(uuid);
            if (!editingDocument[uuid]) {
                const docToEdit = findDocumentByUuid(uuid);
                console.log("Initializing editing document:", docToEdit);
                setEditingDocument(prev => ({
                    ...prev,
                    [uuid]: { ...docToEdit }
                }));
            }
        }
    };

    const handleStopEditing = () => {
        console.log("handleStopEditing called");
        if (activeEditingUuid && hasChanges[activeEditingUuid]) {
            setIsWarningModalOpen(true);
        } else {
            setActiveEditingUuid(null);
        }
    };

    const handleWarningConfirm = () => {
        console.log("handleWarningConfirm called");
        if (pendingEditUuid) {
            discardChanges(activeEditingUuid!);
            startEditing(pendingEditUuid);
        }
        setIsWarningModalOpen(false);
        setPendingEditUuid(null);
    };

    const handleWarningCancel = () => {
        console.log("handleWarningCancel called");
        setIsWarningModalOpen(false);
        setPendingEditUuid(null);
    };

    const handleUpdate = async (uuid: string) => {
        console.log("handleUpdate called with uuid:", uuid);
        if (editingDocument[uuid]) {
            const updatedDocument = editingDocument[uuid];
            console.log("Updating document:", updatedDocument);

            // Update local state
            const updateDocuments = (docs: UserDocument[]) =>
                docs.map(doc => doc.uuid === uuid ? { ...doc, ...updatedDocument } : doc);

            setStyleDocuments(prev => updateDocuments(prev));
            setDataDocuments(prev => updateDocuments(prev));

            // Update selectedDocuments
            let updatedSelectedDocuments: UserDocument[];
            if (selectedDocuments.some(doc => doc.uuid === uuid)) {
                updatedSelectedDocuments = updateDocuments(selectedDocuments);
            } else {
                updatedSelectedDocuments = [...selectedDocuments, updatedDocument];
            }
            console.log("Updating selectedDocuments:", updatedSelectedDocuments);
            onSelectedDocumentsChange(updatedSelectedDocuments);

            // Clear editing state
            setEditingDocument(prev => {
                const { [uuid]: _, ...rest } = prev;
                return rest;
            });
            setHasChanges(prev => {
                const { [uuid]: _, ...rest } = prev;
                return rest;
            });
            setActiveEditingUuid(null);

            // Update hasUnsavedChanges
            setHasUnsavedChanges(prevHasUnsavedChanges => {
                const updatedHasChanges = { ...hasChanges };
                delete updatedHasChanges[uuid];
                return Object.values(updatedHasChanges).some(Boolean);
            });
            console.log(`actionSaveUploadedDocument uuid: ${updatedDocument.uuid}`);
            await actionSaveUploadedDocument(updatedDocument, chatUUId || "");

            // Update on server if chatUUId is available
            if (chatUUId && chatUUId !== "_new") {
                console.log("Saving document to server");
                mutate();
            } else {
                console.log("No chatUUId available, changes saved locally in selectedDocuments");
            }
        } else {
            console.log("No editing document found for uuid:", uuid);
        }
    };

    const handleEdit = (uuid: string, field: keyof UserDocument, value: string) => {
        console.log("handleEdit called:", uuid, field, value);
        setEditingDocument(prev => ({
            ...prev,
            [uuid]: {
                ...prev[uuid],
                [field]: value
            }
        }));
        setHasChanges(prev => ({ ...prev, [uuid]: true }));
        setHasUnsavedChanges(true);
    };

    const discardChanges = (uuid: string) => {
        console.log("discardChanges called for uuid:", uuid);
        setEditingDocument(prev => {
            const { [uuid]: _, ...rest } = prev;
            return rest;
        });
        setHasChanges(prev => {
            const { [uuid]: _, ...rest } = prev;
            return rest;
        });
        setActiveEditingUuid(null);

        // Update hasUnsavedChanges after discarding changes
        setHasUnsavedChanges(prevHasUnsavedChanges => {
            const updatedHasChanges = { ...hasChanges };
            delete updatedHasChanges[uuid];
            return Object.values(updatedHasChanges).some(Boolean);
        });
    };

    const findDocumentByUuid = (uuid: string): UserDocument => {
        const doc = [...styleDocuments, ...dataDocuments].find(doc => doc.uuid === uuid);
        console.log("findDocumentByUuid:", uuid, doc);
        return doc || {
            uuid,
            type: 'STYLE',
            name: '',
            title: '',
            description: '',
            selected: 0
        };
    };

    const toggleSelectDocument = async (uuid: string, type: 'STYLE' | 'DATA') => {
        console.log(`toggleSelectDocument uuid: ${uuid}, type: ${type}`);
        const documents = type === 'STYLE' ? styleDocuments : dataDocuments;
        //console.log(`==>documents: ${JSON.stringify(documents)}`);
        const updatedDocuments = documents.map(doc =>
            doc.uuid === uuid ? { ...doc, selected: doc.selected === 1 ? 0 : 1 } : doc
        );
        //console.log(`==>updatedDocuments: ${JSON.stringify(updatedDocuments)}`);

        let newStyleDocuments, newDataDocuments;
        if (type === 'STYLE') {
            newStyleDocuments = updatedDocuments;
            newDataDocuments = dataDocuments;
            //console.log(`==>newStyleDocuments: ${JSON.stringify(newStyleDocuments)}`);
            setStyleDocuments(updatedDocuments);
        } else {
            newStyleDocuments = styleDocuments;
            newDataDocuments = updatedDocuments;
            setDataDocuments(updatedDocuments);
        }

        const allDocuments = [...newStyleDocuments, ...newDataDocuments];
        //console.log(`==>allDocuments: ${JSON.stringify(allDocuments)}`);
        const newSelectedDocuments = allDocuments.filter(doc => doc.selected === 1);
        //console.log(`==>newSelectedDocuments: ${JSON.stringify(newSelectedDocuments)}`);
        onSelectedDocumentsChange(newSelectedDocuments);
        recordEvent(`select-document`, `{"uuid":"${uuid}","type":"${type}","params":"${JSON.stringify(params)}"}`)
            .then((r: any) => {
                //console.log("recordEvent", r);
            });

        if (chatUUId && chatUUId !== "_new" && chatUUId !== "blocked") {
            await saveChatDocuments(newSelectedDocuments.map(doc => doc.uuid).join(','), chatUUId);
            // mutate();
        }
    };

    const deleteDocument = async (uuid: string, type: 'STYLE' | 'DATA') => {
        try {
            //console.log(`deleteDocument uuid: ${uuid}`);
            const updatedDocuments = userDocuments?.filter(doc => doc.uuid !== uuid);
            if (updatedDocuments && chatUUId && chatUUId !== "_new") {
                mutate(updatedDocuments, false);
            }
            if (!chatUUId || chatUUId === "_new") {
                const updatedSelectedDocuments = selectedDocuments.filter(doc => doc.uuid !== uuid);
                onSelectedDocumentsChange(updatedSelectedDocuments);
            }
            recordEvent(`delete-document`, `{"uuid":"${uuid}","params":"${JSON.stringify(params)}"}`)
                .then((r: any) => {
                    //console.log("recordEvent", r);
                });
            await actionDeleteUploadedDocument(uuid);

        } catch (error) {
            console.error("Error deleting document:", error);
        }
    };

    const handleFileUploadSuccess = useCallback((type: 'STYLE' | 'DATA', event: any) => {
        //console.log(` handleFileUploadSuccess event: ${JSON.stringify(event)}`);
        const uuid = event.uuid;
        let document: UserDocument = { uuid, type, name: event.name, title: '', description: '', selected: 1 };
        actionSaveUploadedDocument(document, chatUUId && chatUUId !== "_new" ? chatUUId : "").then(() => {
            if (chatUUId && chatUUId !== "_new") {
                mutate();
            }
            const updatedSelectedDocuments = [...selectedDocuments, document];
            onSelectedDocumentsChange(updatedSelectedDocuments);
        });
        recordEvent(`file-upload`, `{"name":"${event.name}","type":"${type}","event":"${JSON.stringify(event)}","params":"${JSON.stringify(params)}"}`)
            .then((r: any) => {
                //console.log("recordEvent", r);
            });
    }, [mutate, selectedDocuments, onSelectedDocumentsChange, chatUUId]);

    const renderDocumentList = (documents: UserDocument[], type: 'STYLE' | 'DATA') => (
        documents.map(doc => {
            const isEditing = activeEditingUuid === doc.uuid;
            const currentDoc = isEditing ? editingDocument[doc.uuid] || doc : doc;

            return (
                <div key={doc.uuid} className={`mb-4 p-4 border rounded ${isEditing ? 'bg-blue-50 dark:bg-blue-900' : 'bg-white dark:bg-gray-800'} dark:border-gray-700`}>
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
                        onFocus={() => startEditing(doc.uuid)}
                        className={`w-full mb-2 p-2 border rounded ${isEditing ? 'bg-white' : 'bg-gray-100'} dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600`}
                        placeholder="Title"
                    />
                    <textarea
                        value={currentDoc.description}
                        onChange={(e) => handleEdit(doc.uuid, 'description', e.target.value)}
                        onFocus={() => startEditing(doc.uuid)}
                        className={`w-full mb-2 p-2 border rounded ${isEditing ? 'bg-white' : 'bg-gray-100'} dark:bg-gray-700 text-gray-900 dark:text-gray-100 dark:border-gray-600`}
                        placeholder="Description"
                        rows={3}
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

            <WarningModal
                isOpen={isWarningModalOpen}
                onConfirm={handleWarningConfirm}
                onCancel={handleWarningCancel}
            />
        </div>
    );
};

export default CreatorMode;
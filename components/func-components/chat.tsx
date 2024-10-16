'use client';
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import useSWR from 'swr';
import { useAppContext } from '@lib/context';
import { motion, AnimatePresence } from 'framer-motion';
import { Chat, Message, UserDocument } from "@lib/types/chat";
import { actionChat, actionChatName, actionCreateChat, actionFlipCreatorMode, actionLoadLatestChat, CreateChatProps } from "@lib/fetchers/chat";
import ReactMarkdown from 'react-markdown';
import { FaPaperPlane, FaChevronDown, FaChevronUp, FaCopy, FaCheck, FaInfoCircle, FaPaperclip } from 'react-icons/fa';
import { actionUserRequest } from "@lib/actions/user-request";
import MyChats from "@components/func-components/mychats";
import { MyChatsKey, CreateChatKey } from "@lib/keys";
import { HiOutlinePencilAlt } from "react-icons/hi";
import { useRouter, useSearchParams } from 'next/navigation';
import type { UserAccount } from '@lib/types/user';
import Link from 'next/link';
import { actionFetchPrompts } from "@lib/actions/fetch-prompts";
import { styled } from "styled-components";
import CreatorMode from "@components/func-components/creator-mode";
import { actionRecordEvent as recordEvent } from "@/lib/actions";
import { MarkdownComponents } from '@components/shared/markdown-components';

const PromptsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const PromptTag = styled(Link) <{ $isDarkMode: boolean }>`
  background-color: ${props => props.$isDarkMode ? '#1D4037' : '#CFE0C2'}; // More muted brown in dark mode, lighter peach in light mode
  color: ${props => props.$isDarkMode ? '#E0E0E0' : '#4E342E'}; // Light gray text in dark mode, dark brown in light mode
  padding: 2px 10px;
  border-radius: 16px; // Slightly reduced for smaller size
  font-size: 14px; // Smaller font size
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
  &:hover {
    background-color: ${props => props.$isDarkMode ? '#795548' : '#FFCCBC'}; // Slightly lighter in dark mode, slightly darker in light mode
    color: ${props => props.$isDarkMode ? '#FFFFFF' : '#3E2723'}; // White in dark mode, darker text in light mode
  }
`;


interface Props {
    chatUUId?: string;
    isFantasyTeam?: boolean;
    source?: string;
}

const ChatsComponent: React.FC<Props> = ({
    chatUUId: chatUUIdProp,
    isFantasyTeam,
    source
}) => {
    const { fallback, prompt, promptUUId, mode, isMobile, noUser, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, params, tp, league, pagetype, teamid, player, teamName, setTeamName, athleteUUId, userAccount, userAccountMutate, user, utm_content } = useAppContext();
    const [response, setResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userInput, setUserInput] = useState<string>(prompt || '');
    const responseTextareaRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const responseSetRef = useRef(false);
    const [chatUUId, setChatUUId] = useState<string>(prompt ? '_new' : (chatUUIdProp || ""));
    const [chatName, setChatName] = useState<string>('');
    const [openMyChats, setOpenMyChats] = useState<boolean>(false);
    const [updateMessage, setUpdateMessage] = useState<string>('');
    const [pendingUserRequest, setPendingUserRequest] = useState<boolean>(false);
    const [provisionalChatUUId, setProvisionalChatUUId] = useState<string>('');
    const [provisionalUserInput, setProvisionalUserInput] = useState<string>('');
    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    const [prompts, setPrompts] = useState<string[]>([]);
    const [creator, setCreator] = useState<boolean>(false);
    const [showCreatorInfo, setShowCreatorInfo] = useState<boolean>(false);
    const [selectedDocuments, setSelectedDocuments] = useState<UserDocument[]>([]);
    const [showCreditsInfo, setShowCreditsInfo] = useState<boolean>(false);
    const [showAttachments, setShowAttachments] = useState<boolean>(false);
    // const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null);

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const createChatKey: CreateChatKey = { email: user.email, type: "create-chat", chatUUId: chatUUId, league: league.toUpperCase(), teamid, athleteUUId, fantasyTeam: false };
    const { data: loadedChat, error: loadedChatError, isLoading: isLoadingChat } = useSWR(createChatKey, actionLoadLatestChat, { fallback });
    //console.log('==> CHAT.TSX isLoadingChat', isLoadingChat, createChatKey);
    //console.log("==> CHAT.TSX loadedChat", JSON.stringify(loadedChat));
    let { extraCreditsRemaining, creditsRemaining, subscriptionType } = userAccount as UserAccount || {};

    const level = useMemo(() => {
        return !subscriptionType || subscriptionType === "trial" ? "trial" : subscriptionType;
    }, [subscriptionType]);
    // console.log("==> CHATS.TSX level", JSON.stringify(level));

    const totalCredits = (creditsRemaining || 0) + (extraCreditsRemaining || 0);

    let creditsString = creditsRemaining ? creditsRemaining.toString() : "0";
    if (extraCreditsRemaining && +extraCreditsRemaining > 0) {
        creditsString = creditsString + "/" + extraCreditsRemaining.toString();
    }
    creditsString += ' credits'
    if (totalCredits < 10) {
        creditsString += " remaining. Upgrade.";
    }
    const isCid = useMemo(() => {
        return userAccount?.cid && userAccount?.cid.length > 0;
    }, [userAccount]);
    console.log("==> CHATS.TSX isCid", isCid);
    const creditColorClass = totalCredits === 0
        ? "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        : totalCredits < 5
            ? "text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
            : "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300";

    const router = useRouter();
    const searchParams = useSearchParams();

    const [initialPrompt, setInitialPrompt] = useState<string | null>(null);
    const [initialPromptUUId, setInitialPromptUUId] = useState<string | null>(null);
    //console.log(`==>CHATS.TSX selectedDocuments: ${JSON.stringify(selectedDocuments)}`);
    useEffect(() => {
        if (loadedChat) {
            setCreator(loadedChat.chat.creator || false);

        }
    }, [loadedChat]);
    useEffect(() => {
        const prompt = searchParams?.get('prompt') || "";
        const promptUUId = searchParams?.get('promptUUId') || "";

        if (prompt) setInitialPrompt(prompt);
        if (promptUUId) setInitialPromptUUId(promptUUId);

        if (prompt || promptUUId) {
            const url = new URL(window.location.href);
            url.searchParams.delete('prompt');
            url.searchParams.delete('promptUUId');
            router.replace(url.toString());
        }
    }, [searchParams]);


    useEffect(() => {
        if (utm_content && utm_content.includes("xad")) {
            actionFetchPrompts({ league }).then(setPrompts);
        }
    }, [league, utm_content]);

    useEffect(() => {
        if (initialPrompt) {
            setUserInput(initialPrompt);
        }
    }, [initialPrompt]);

    useEffect(() => {
        setChatUUId(prompt ? "_new" : (chatUUIdProp || ""));
        setMessages([]);
        setChatName('');
    }, [league])
    /* useEffect(() => {
         setIsLoading(isLoadingChat);
     }, [isLoadingChat]);*/

    const update = useCallback((message: string) => {
        setUpdateMessage(message);
        setTimeout(() => {
            setUpdateMessage('waiting for response...');
            setTimeout(() => {
                setUpdateMessage('');
            }, 6000);
        }, 2000);
    }, []);

    const userRequest = useCallback(() => {
        setPendingUserRequest(false);
        // setStreamingMessageIndex(messages.length + 1);
        const styleDocument = selectedDocuments.find(doc => doc.type === 'STYLE' && doc.selected === 1)?.uuid || "";
        const dataDocumentsString = selectedDocuments.filter(doc => doc.type === 'DATA' && doc.selected === 1).map(doc => doc.uuid).join(',');
        //console.log(`==>styleDocument: ${styleDocument}`);
        //console.log(`==>dataDocumentsString: ${dataDocumentsString}`);
        //console.log(`==>selectedDocuments: ${JSON.stringify(selectedDocuments)}`);
        actionUserRequest({
            chatUUId: provisionalChatUUId || chatUUId,
            promptUUId: initialPromptUUId || "",
            userRequest: provisionalUserInput || textareaRef.current?.value.trim() || "",
            athleteUUId: athleteUUId,
            teamid: teamid,
            league: league,
            fantasyTeam: isFantasyTeam || false,
            onUpdate: (content: string) => {
                setUpdateMessage('');
                setResponse(prev => {
                    const updatedContent = prev + content;
                    setMessages(prevMessages => {
                        const updatedMessages = [...prevMessages];
                        //setStreamingMessageIndex(updatedMessages.length - 1);
                        if (updatedMessages.length > 0) {
                            updatedMessages[updatedMessages.length - 1].content = updatedContent;
                        }
                        return updatedMessages;
                    });
                    return updatedContent;
                });
            },
            onDone: () => {
                setUpdateMessage('');
                userAccountMutate();
                setIsLoading(false);
                actionChatName({ chatUUId }).then(
                    (data) => {
                        if (data.success) {
                            setChatName(data.chatName);
                        }
                    }
                );
                setInitialPrompt(null);
                setInitialPromptUUId(null);
                //setStreamingMessageIndex(null);
            },
            onChatUUId: (content: string) => {
                setChatUUId(prev => {
                    return content;
                });
            },
            onMetaUpdate: (content: string) => {
                update(content);
            },
            styleDocument: selectedDocuments.find(doc => doc.type === 'STYLE' && doc.selected === 1)?.uuid || "",
            dataDocumentsString: selectedDocuments.filter(doc => doc.type === 'DATA' && doc.selected === 1).map(doc => doc.uuid).join(','),
            creator
        }).catch(error => {
            console.error("Error in actionUserRequest:", error);
            setIsLoading(false);
            // setStreamingMessageIndex(null);
        }).finally(() => {
            setIsLoading(false);
            // setStreamingMessageIndex(null);
        });
        setProvisionalChatUUId('');
        setProvisionalUserInput('');
    }, [chatUUId, provisionalChatUUId, athleteUUId, teamid, league, isFantasyTeam, initialPromptUUId, creator, selectedDocuments]);

    useEffect(() => {
        if (chatUUId && chatUUId != '_new' && chatUUId != 'blocked' && pendingUserRequest || provisionalChatUUId && pendingUserRequest) {
            setPendingUserRequest(false);
            userRequest();
        }
        if (chatUUId && chatUUId == 'blocked') {
            setIsLoading(false);
            setPendingUserRequest(false);
            setChatUUId('');
            setUpdateMessage('Your request could not be processed due to browser settings blocking user sessions. Please adjust your settings to allow sessions (cookies) and try again.');
        }
    }, [chatUUId, provisionalChatUUId, pendingUserRequest]);

    useEffect(() => {
        setIsLoading(false);
        if (loadedChat && !loadedChatError && !isLoadingChat && loadedChat.success) {
            setChatUUId(loadedChat.chat.chatUUId);
            if (loadedChat.chat.messages) {
                setMessages(loadedChat.chat.messages);
            }
            if (loadedChat?.chat?.name?.includes("ChatGPT")) {
                setChatName(loadedChat?.chat?.name?.replace("ChatGPT", "QwiketAI") || 'New Chat');
            } else {
                setChatName(loadedChat?.chat?.name || 'New Chat');
            }

        }
    }, [loadedChat]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const currentUserInput = textareaRef.current?.value.trim();
        if (!currentUserInput) return;
        update('Loading...');
        const insider = currentUserInput.toLowerCase().indexOf("qw:") == 0;
        const userInputCleaned = currentUserInput.replace(/qw:/i, "");
        const newMessage: Message = {
            role: 'user',
            content: userInputCleaned
        };
        setProvisionalUserInput((prev) => {
            return userInputCleaned;
        });
        setIsLoading(true);
        setResponse('');
        const assistantMessage: Message = {
            role: 'QwiketAI',
            content: ''
        };
        setMessages(prevMessages => [...prevMessages, newMessage, assistantMessage]);
        try {
            if (!chatUUId || chatUUId == '_new') {
                setIsLoading(true);
                setPendingUserRequest(true);
                //AI: find a single style (type === STYLE) and 0-n data (type === DATA) documentids for this chat
                //need two params: styleDocument and dataDocumentsString. Second is comma separated list of uuids.
                actionCreateChat({ teamid, league, athleteUUId, insider, fantasyTeam: isFantasyTeam || false, styleDocument: "", dataDocumentsString: "", creator }).then(
                    (chatUUId) => {
                        setProvisionalChatUUId((prev) => {
                            return chatUUId as string;
                        });
                    }
                );
            }
            else {
                userRequest();
            }
        } catch (error) {
            console.error("Error in actionUserRequest:", error);
            setIsLoading(false);
        }
        setTimeout(() => {
            if (textareaRef.current) {
                textareaRef.current.value = '';
                responseSetRef.current = false;
            }
        }, 1000);
    }, [chatUUId, athleteUUId, teamid, league, isFantasyTeam])

    useEffect(() => {
        if (responseTextareaRef.current) {
            responseTextareaRef.current.scrollTop = responseTextareaRef.current.scrollHeight;
        }
    }, [response]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    if (!league) {
        return <><br /><h2 className="text-xl min-h-screen font-bold p-4">Please select a league first.</h2></>;
    }

    const isDarkMode = mode === 'dark';
    const renderPrompts = (device: "desktop" | "mobile") => {
        if (!prompts || prompts.length === 0) return null;
        const param = "?tab=chat";
        return (
            <>
                <h3 className="text-sm mt-4 font-semibold text-gray-700 dark:text-gray-300 mb-2">Suggested first time chat prompts:</h3>

                <PromptsContainer>
                    {prompts.map((p: any, index: number) => (
                        <PromptTag
                            key={`prompt-${index}`}
                            href={`/${p.league}${param}&prompt=${encodeURIComponent(p.prompt)}&promptUUId=${p.uuid}`}
                            $isDarkMode={isDarkMode}
                        >
                            {p.prompt}
                        </PromptTag>
                    ))}
                </PromptsContainer>
            </>
        );
    };

    const BlinkingDot = () => (
        <motion.span
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            className="inline-block ml-1"
        >
            •
        </motion.span>
    );

    const copyToClipboard = (content: string, index: number) => {
        navigator.clipboard.writeText(content).then(() => {
            setCopiedMessageIndex(index);
            setTimeout(() => {
                setCopiedMessageIndex(null);
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy content: ', err);
        });
    };

    const FlashingCircle = () => (
        <motion.div
            className="absolute -inset-1.5 rounded-full"
            animate={{
                boxShadow: [
                    '0 0 0 0 rgba(0, 255, 255, 0)',
                    '0 0 0 6px rgba(0, 255, 255, 0.3)'
                ]
            }}
            transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: 'reverse'
            }}
        />
    );
    const drawChatName = chatName && chatName.length > 0 ? chatName : loadedChat?.chat?.name || 'New Chat';
    const drawMessages = (messages && messages.length > 0) ? messages : loadedChat?.chat?.messages || [];
    // console.log("==> CHAT.TSX drawMessages", JSON.stringify(drawMessages));
    // console.log("==> CHAT.TSX drawChatName", loadedChat?.chat?.name, drawChatName, chatName);
    return (
        <div className="flex flex-col bg-white dark:bg-black w-full relative">
            <div className="flex-shrink-0 lg:p-4 p-4 pt-2 lg:pt-4 relative z-2">
                <div className="flex flex-col">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setOpenMyChats(!openMyChats)}
                                className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                            >
                                {openMyChats ? <FaChevronUp /> : <FaChevronDown />}
                            </button>
                            <h1 className="ml-4 text-lg font-bold text-gray-800 dark:text-gray-200">{drawChatName}</h1>
                        </div>
                        <div className="flex items-center">
                            <button
                                onClick={() => {
                                    setChatUUId("_new");
                                    setMessages([]);
                                    setChatName('New Chat');
                                    setOpenMyChats(false);
                                    setIsLoading(false);
                                }}
                                className={`text-gray-800 dark:text-gray-200 hover:text-blue-500 dark:hover:text-blue-200 font-bold py-2 px-4 rounded ${drawChatName === 'New Chat' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                disabled={drawChatName === 'New Chat'}
                            >
                                <HiOutlinePencilAlt size={24} />
                            </button>
                        </div>
                    </div>
                    {!openMyChats && (
                        <>
                            <div className="flex items-center justify-between mt-2 mb-2">
                                <div className="flex items-center">
                                    <span className="mr-2 text-sm text-gray-600 dark:text-gray-400">Creator Mode</span>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            disabled={level !== "creator" && level !== "trial"}
                                            className="sr-only peer"
                                            checked={creator}
                                            onChange={() => {
                                                setCreator(!creator);
                                                if (chatUUId && chatUUId !== "_new" && chatUUId !== "blocked") {
                                                    actionFlipCreatorMode(!creator, chatUUId);
                                                }
                                                recordEvent(`flip-creator`, `{"creator":"${!creator}","params":"${JSON.stringify(params)}"}`)
                                                    .then((r: any) => {
                                                        //console.log("recordEvent", r);
                                                    });
                                            }}
                                        />
                                        <div className="relative w-8 h-4 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[0px] after:start-[0px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                    <button
                                        onClick={() => setShowCreatorInfo(!showCreatorInfo)}
                                        className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <FaInfoCircle size={14} />
                                    </button>
                                    <button
                                        onClick={() => setShowAttachments(!showAttachments)}
                                        className={`ml-4 flex items-center text-sm ${creator ? 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
                                            : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                                            }`}
                                        disabled={!creator}
                                    >
                                        <FaPaperclip className="mr-1" size={14} />
                                        Attachments
                                        {creator && (
                                            showAttachments ?
                                                <FaChevronUp className="ml-1" size={12} /> :
                                                <FaChevronDown className="ml-1" size={12} />
                                        )}
                                    </button>
                                </div>
                                <div className="flex items-center">
                                    <Link
                                        href="/account/dashboard"
                                        className={`text-xs ${creditColorClass} hover:underline mr-2`}
                                    >
                                        {creditsString}
                                    </Link>
                                    <button
                                        onClick={() => setShowCreditsInfo(!showCreditsInfo)}
                                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    >
                                        <FaInfoCircle size={14} />
                                    </button>
                                </div>
                            </div>
                            {showCreatorInfo && (
                                <><div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                                    Creator Mode supports creative sports content producers, allows to attach documents to the chat and more. Note: each document attached to chat costs extra 5 credits per request.
                                </div>
                                    {(level !== "creator" && level !== "trial") && (
                                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                                            Creator Mode is not available for your subscription level. <Link href="/account/dashboard" className="text-blue-500 hover:underline">Upgrade to creator level</Link> to use this feature.
                                        </div>
                                    )}
                                </>)}
                            {showCreditsInfo && (
                                <div className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                                    Credits are used for AI Chat requests. Regular credits refill monthly based on your subscription. Extra credits never expire and are used when regular credits run out. Visit the <Link href="/account/dashboard" className="text-blue-500 hover:underline">
                                        Dashboard
                                    </Link> for more details on your credit usage and subscription options.
                                </div>
                            )}
                            {!isCid && creator && !showCreatorInfo && (
                                <div className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4">
                                    <Link href="/account/rsp">
                                        Learn about the Revenue-Sharing Program for Creators
                                    </Link>
                                </div>
                            )}
                            {isCid && creator && !showCreatorInfo && (
                                <div className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4">
                                    <Link href="/account/dashboard">
                                        Revenue-Sharing Dashboard
                                    </Link>
                                </div>
                            )}
                            <AnimatePresence>
                                {creator && showAttachments && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="overflow-hidden"
                                    >
                                        <CreatorMode
                                            chatUUId={chatUUId}
                                            selectedDocuments={selectedDocuments}
                                            onSelectedDocumentsChange={(documents: UserDocument[]) => {
                                                console.log("==> CHAT.TSX onSelectedDocumentsChange", documents);
                                                setSelectedDocuments(documents)
                                            }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    )}
                </div>
                <div
                    className={`absolute top-full mt-4 left-0 w-full bg-white dark:bg-black z-20 transition-all duration-300 overflow-hidden ${openMyChats ? 'max-h-128' : 'max-h-0'}`}
                >
                    <MyChats
                        onChatSelect={async (selectedChatUUId) => {
                            setChatUUId(selectedChatUUId);
                            setTimeout(() => {
                                setOpenMyChats(false);
                            }, 200);
                        }}
                        onNewChat={async () => {
                            setChatUUId("_new");
                            setMessages([]);
                            setChatName('New Chat');
                            setOpenMyChats(false);
                        }}
                        onFirstChat={(firstChat) => {
                        }}
                    />
                </div>
            </div>

            <div className={`overflow-y-auto mb-32 p-4 pb-16 relative z-0 ${openMyChats ? 'opacity-50' : ''}`}>
                {drawMessages.length === 0 && (
                    <>
                        {(!prompts || prompts.length === 0) && !creator ? <>
                            <p className="text-gray-600 dark:text-gray-400 italic text-center mt-8">
                                Please note that AI results may not always be reliable. It&apos;s recommended to ask follow-up questions for clarification and verify important information from trusted sources.
                            </p>

                        </> : renderPrompts(isMobile ? "mobile" : "desktop")}
                    </>
                )}
                {drawMessages.map((message, index) => (
                    <div key={index} className={`mb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[95%] p-3 rounded-2xl ${message.role === 'user'
                            ? 'bg-blue-100 dark:bg-teal-800'
                            : 'bg-gray-100 dark:bg-gray-700'
                            } text-gray-800 dark:text-gray-200`}>
                            <div className="flex justify-between items-center mb-1">
                                <p className="font-semibold">{message.role === 'user' ? 'You     ' : 'QwiketAI     '}</p>
                                {message.role !== 'user' && message.content.length >= 20 && (
                                    <button
                                        onClick={() => copyToClipboard(message.content, index)}
                                        className={`${copiedMessageIndex === index
                                            ? 'text-green-500 dark:text-green-400'
                                            : 'text-gray-500 hover:text-gray-700 dark:text-grayr:text-gray-700 dark:text-gray-200'
                                            } transition-colors duration-200`}
                                    >
                                        {copiedMessageIndex === index ? <FaCheck size={14} /> : <FaCopy size={14} />}
                                    </button>
                                )}
                            </div>
                            <ReactMarkdown components={MarkdownComponents}>
                                {message?.content || ''}
                            </ReactMarkdown>
                            {isLoading && index === messages.length - 1 && message.role === 'QwiketAI' && <BlinkingDot />}
                        </div>
                    </div>
                ))}
                <div className="flex justify-center items-center h-2 pt-4 text-xs text-gray-500 dark:text-gray-400">
                    {updateMessage || "***"}
                </div>
                <div className="p-0 mt-4">
                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            ref={textareaRef}
                            defaultValue={userInput}
                            onKeyDown={handleKeyDown}
                            placeholder="Message to QwiketAI"
                            className={`w-full p-3 pr-16 border rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-black resize-none ${openMyChats ? 'opacity-50' : ''}`}
                            rows={3}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-500 hover:text-teal-600 dark:text-cyan-400 dark:hover:text-cyan-300"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-800 dark:border-gray-200"></div>
                            ) : (
                                <div className="relative p-1.5">
                                    {messages.length === 0 && userInput.trim() !== '' && <FlashingCircle />}
                                    <FaPaperPlane size={18} />
                                </div>
                            )}
                        </button>
                    </form>
                </div>
            </div>

            <div className="flex-shrink-0 fixed bottom-0 w-full max-w-[600px] bg-white dark:bg-black border-gray-200 dark:border-gray-700">
            </div>
        </div>
    );
};

export default ChatsComponent;
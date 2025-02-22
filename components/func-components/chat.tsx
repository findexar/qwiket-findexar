'use client';
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import useSWR from 'swr';
import { unstable_serialize } from 'swr'
import { useAppContext } from '@lib/context';
import { motion, AnimatePresence } from 'framer-motion';
import { Chat, Message, UserDocument, RelatedContent } from "@lib/types/chat";
import { actionFeedback, actionChat, actionChatName, actionCreateChat, actionChatInit, actionFlipCreatorMode, actionLoadLatestChat } from "@lib/server-actions/chat";
import ReactMarkdown from 'react-markdown';
import { FaPaperPlane as FaPaperPlaneIcon, FaChevronDown as FaChevronDownIcon, FaChevronUp as FaChevronUpIcon, FaCopy as FaCopyIcon, FaCheck as FaCheckIcon, FaInfoCircle as FaInfoCircleIcon, FaPaperclip as FaPaperclipIcon, FaRedo as FaRedoIcon } from 'react-icons/fa';

import { actionChatStream } from "@lib/client-actions/chat-stream";
import MyChats from "@components/func-components/mychats";
import { MyChatsKey, CreateChatKey, PromptChatResponseKey } from "@lib/keys";
import { HiOutlinePencilAlt as HiOutlinePencilAltIcon } from "react-icons/hi";
import { useRouter, useSearchParams } from 'next/navigation';
import type { UserAccount } from '@lib/types/user';
import Link from 'next/link';
import { actionFetchPrompts } from "@lib/client-actions/fetch-prompts";
import { styled } from "styled-components";
import CreatorMode from "@components/func-components/creator-mode";
import { actionRecordEvent, actionRecordEvent as recordEvent } from "@lib/server-actions/event";
import { MarkdownComponents } from '@components/shared/markdown-components';
import { ChatMessage } from "@/lib/types/chat";  // Make sure this import exists
import Toast from './toaster'; // Import your Toast component
import { actionPromptChatResponse } from "@lib/server-actions/chat";

const FaPaperPlane: any = FaPaperPlaneIcon as any;
const FaChevronDown: any = FaChevronDownIcon as any;
const FaChevronUp: any = FaChevronUpIcon as any;
const FaCopy: any = FaCopyIcon as any;
const FaCheck: any = FaCheckIcon as any;
const FaInfoCircle: any = FaInfoCircleIcon as any;
const FaPaperclip: any = FaPaperclipIcon as any;
const FaRedo: any = FaRedoIcon as any;

const HiOutlinePencilAlt: any = HiOutlinePencilAltIcon as any;

const PromptsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const PromptTag = styled(Link) <{ $isDarkMode: boolean }>`
  display: block;
  width: fit-content;
  background-color: ${props => props.$isDarkMode ? '#1D4037' : '#CFE0C2'};
  color: ${props => props.$isDarkMode ? '#E0E0E0' : '#4E342E'};
  padding: 2px 10px;
  border-radius: 16px;
  font-size: 14px;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
  &:hover {
    background-color: ${props => props.$isDarkMode ? '#795548' : '#FFCCBC'};
    color: ${props => props.$isDarkMode ? '#FFFFFF' : '#3E2723'};
  }
`;

const AIMessageHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
`;

const AILogo = styled.img`
  width: 24px;
  height: 24px;
  margin-right: 8px;
  opacity: 0.6;
`;

const AIName = styled.span`
  font-weight: bold;
  margin-left: 4px;
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
    let { relatedContent, fallback, prompt, promptUUId, mode, isMobile, setLeague, setView, setPagetype, setPlayer, setMode, fbclid, params, tp, league, pagetype, teamid, player, teamName, setTeamName, athleteUUId, userAccount, userAccountMutate, user, utm_content, bot, feedback, setFeedback, setCstory, setCm } = useAppContext();
    const [response, setResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userInput, setUserInput] = useState<string>('');
    const responseTextareaRef = useRef<HTMLDivElement>(null);
    const feedbackTextareaRef = useRef<HTMLTextAreaElement>(null);

    const responseSetRef = useRef(false);
    const [chatUUId, setChatUUId] = useState<string>(promptUUId ? '' : (chatUUIdProp || ""));

    const [pumpUUId, setPumpUUId] = useState<string>('');

    const [openMyChats, setOpenMyChats] = useState<boolean>(false);
    const [updateMessage, setUpdateMessage] = useState<string>('');
    const [pendingUserRequest, setPendingUserRequest] = useState<boolean>(false);
    const [provisionalChatUUId, setProvisionalChatUUId] = useState<string>('');
    const [provisionalUserInput, setProvisionalUserInput] = useState<string>('');
    const [lastUserInput, setLastUserInput] = useState<string>('');
    const [copiedMessageIndex, setCopiedMessageIndex] = useState<number | null>(null);
    const [prompts, setPrompts] = useState<string[]>([]);
    const [creator, setCreator] = useState<boolean>(false);
    const [showCreatorInfo, setShowCreatorInfo] = useState<boolean>(false);
    const [selectedDocuments, setSelectedDocuments] = useState<UserDocument[]>([]);
    const [showCreditsInfo, setShowCreditsInfo] = useState<boolean>(false);
    const [showAttachments, setShowAttachments] = useState<boolean>(false);
    const [streamingMessageIndex, setStreamingMessageIndex] = useState<number | null>(null);

    const [isPromptSelected, setIsPromptSelected] = useState(false);
    const [isMessageSubmitted, setIsMessageSubmitted] = useState(false);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastIcon, setToastIcon] = useState(<></>);
    const [status, setStatus] = useState<string>('white');
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    // Update where fallback is used
    const [localFallback, setLocalFallback] = useState<{ [key: string]: any }>(
        typeof fallback === 'object' ? fallback : {}
    );
    const [autoPrompt, setAutoPrompt] = useState<boolean>(false);
    //const initialPromptUUIdRef = useRef<string | null>(promptUUId); // Initialize with promptUUId

    /* DATA FETCHING */
    const createChatKey: CreateChatKey = { promptUUId, email: user.email, type: "create-chat", chatUUId: chatUUId, league: league?.toUpperCase() || '', teamid, athleteUUId, fantasyTeam: false };
    let { data: loadedChat, error: loadedChatError, isLoading: isLoadingChat, mutate: mutateLoadedChat }: {
        data: any,
        error: any,
        isLoading: boolean,
        mutate: any
    } = useSWR(createChatKey, actionLoadLatestChat, { fallback: localFallback });
    /*
    if (loadedChat && !loadedChatError && !isLoadingChat && loadedChat.success) {
            setChatUUId(loadedChat.chat.chatUUId);
            if (loadedChat.chat.messages && loadedChat.chat.messages.length > 0) {
                setFollowupPrompts(loadedChat.chat.messages.length > 0 ? loadedChat.chat.messages[loadedChat.chat.messages.length - 1].prompts || [] : []);
                setMessages(loadedChat.chat.messages);
                setIsLoading(false);

            }
            if (loadedChat?.chat?.name?.includes("ChatGPT")) {
                setChatName(loadedChat?.chat?.name?.replace("ChatGPT", "Qwiket AI") || 'New Chat');
            } else {
                if (loadedChat?.chat?.name != "New Chat" && loadedChat?.chat?.name != chatName) {
                    setChatName(loadedChat?.chat?.name || 'New Chat');
                }
            }
            setLastMessageUUID(loadedChat?.chat?.lastMessageUUID || '');
            */

    const [lastMessageUUID, setLastMessageUUID] = useState<string>(loadedChat?.chat?.lastMessageUUID || '');

    const [messages, setMessages] = useState<Message[]>(loadedChat?.chat?.messages || []);
    const [followupPrompts, setFollowupPrompts] = useState<string[]>(loadedChat?.chat?.messages ? loadedChat?.chat?.messages[1]?.prompts || [] : []);
    const [chatName, setChatName] = useState<string>(loadedChat?.chat?.name || 'New Chat');

    let immediateFollowupPrompts = followupPrompts || loadedChat?.chat?.messages[1]?.prompts || [];
    const promptChatResponseKey: PromptChatResponseKey = { type: 'prompt-response', promptUUId, prompt };
    const savedFallback = JSON.parse(JSON.stringify(fallback));
    const savedPromptUUId = promptUUId;
    const { data: promptResponse, error: promptResponseError, isLoading: isLoadingPromptResponse, mutate: mutatePromptResponse }: {
        data: any,
        error: any,
        isLoading: boolean,
        mutate: any
    } = useSWR(promptChatResponseKey, actionPromptChatResponse, { fallback });
    relatedContent = promptResponse;
    /****************/
    // console.log("==> CHATS.TSX loadedChat", JSON.stringify({ promptUUId, savedPromptUUId, loadedChat, messages/*, savedFallback, fallback */ }));
    let { extraCreditsRemaining, creditsRemaining, subscriptionType } = userAccount as UserAccount || {};

    const level = useMemo(() => {
        return !subscriptionType || subscriptionType === "trial" ? "trial" : subscriptionType;
    }, [subscriptionType]);

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
    const tag = useMemo(() => {
        return userAccount?.tag || "base";
    }, [userAccount]);
    useEffect(() => {
        if (isCid) {
            setCreator(true);
        }
    }, [isCid]);
    // console.log("==> CHATS.TSX isCid", isCid);
    const creditColorClass = totalCredits === 0
        ? "text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        : totalCredits < 5
            ? "text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300"
            : "text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300";

    const router = useRouter();
    const searchParams = useSearchParams();

    const [initialPrompt, setInitialPrompt] = useState<string | null>(null);

    //console.log(`==>CHATS.TSX selectedDocuments: ${JSON.stringify(selectedDocuments)}`);
    useEffect(() => {
        if (loadedChat) {
            setCreator(loadedChat.chat.creator || isCid);
        }
    }, [loadedChat]);

    useEffect(() => {
        if (!bot && promptUUId) {
            if (loadedChat && loadedChat.chat?.messages && loadedChat.chat?.messages?.length == 2) {
                if (!autoPrompt && loadedChat?.chat?.name == "New Prompt Chat") {
                    setAutoPrompt(true);
                    recordEvent(`chat-auto-start`, `{"text":"${prompt}","componentId":"${componentId}","isMobile":${isMobile},"creator":"${!creator}","params":"${JSON.stringify(params)}"}`)
                }
                const followupPrompts = loadedChat?.chat?.messages[1]?.prompts || [];
                if (followupPrompts && followupPrompts.length > 0) {
                    setFollowupPrompts(followupPrompts);
                }
            }
        }
    }, [promptUUId, loadedChat]);
    /*useEffect(() => {
        if (promptUUId != initialPromptUUIdRef.current) {
            setMessages([]);
            setChatName('New Chat');
            setFollowupPrompts([]);
        }
    }, [promptUUId]);*/
    const pumpUUIdRef = useRef(pumpUUId); // Create a ref to hold the current pumpUUId

    // Update the ref whenever pumpUUId changes
    useEffect(() => {
        pumpUUIdRef.current = pumpUUId;
    }, [pumpUUId]);
    useEffect(() => {
        if (chatUUId == '' && loadedChat && loadedChat.chat && loadedChat.chat.chatUUId != '') {
            const createChatKey2: CreateChatKey = { promptUUId, email: user.email, type: "create-chat", chatUUId: loadedChat.chat.chatUUId, league: league?.toUpperCase() || '', teamid, athleteUUId, fantasyTeam: false };
            // Update where fallback is spread
            const updatedFallback = {
                ...fallback,
                [unstable_serialize(createChatKey2)]: loadedChat
            };
            setLocalFallback(updatedFallback);
        }
        if (status == 'red') {
            setStatus('yellow');
        }
        if (pumpUUIdRef.current && chatUUId && chatUUId !== '_new') {
            if (status == 'yellow') {
                setStatus('green');
            }
            // console.log("==> CHAT.TSX actionChatStream", provisionalChatUUId || chatUUId, pumpUUIdRef.current);
            actionChatStream({
                chatUUId: provisionalChatUUId || chatUUId,
                pumpUUId: pumpUUIdRef.current,
                onUpdate: (content: string) => {
                    setUpdateMessage('');
                    if (status != 'white') {
                        setStatus('white');
                    }
                    setResponse(prev => {
                        const updatedContent = prev + content;
                        //console.log("==> CHAT.TSX actionChatStream onUpdate", updatedContent, messages);
                        setMessages(prevMessages => {
                            const updatedMessages = [...prevMessages];
                            if (updatedMessages.length > 1) {
                                if (updatedMessages[updatedMessages.length - 1]?.role == 'Qwiket AI') {
                                    updatedMessages[updatedMessages.length - 1].content = updatedContent;
                                }
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
                    setStreamingMessageIndex(null);
                    setMessages(prevMessages => {
                        const updatedMessages = [...prevMessages];
                        if (updatedMessages.length > 1) {
                            if (updatedMessages[updatedMessages.length - 1]?.role == 'Qwiket AI') {
                                updatedMessages[updatedMessages.length - 1].role = 'assistant';
                            }
                        }
                        return updatedMessages;
                    });

                    if (!bot) {
                        actionRecordEvent(`chat-done`, `{"utm_content":"${utm_content}","isMobile":${isMobile},"promptUUId":"${promptUUId}","prompt":"${prompt}","response":"${response}","params":"${params}"}`)
                            .then((r: any) => {
                                //console.log("recordEvent", r);
                            });
                    }
                    setPumpUUId((prev) => {
                        return '';
                    });

                    setUserInput('');
                    if (textareaRef.current) {
                        textareaRef.current.value = '';
                        responseSetRef.current = false;
                    }
                },
                onMetaUpdate: (content: string) => {
                    setUpdateMessage(content);
                },
                onFollowupPromptsUpdate: (content: string[]) => {
                    setUpdateMessage('');
                    const newPrompts = content;
                    setFollowupPrompts(newPrompts);
                },
                onLastMessageUUIDUpdate: (content: string) => {
                    setUpdateMessage('');
                    setLastMessageUUID(content);
                },
                onError: (content: string) => {
                    console.log("==> CHAT.TSX onError", content);
                    setStatus('red');
                    setUpdateMessage(content);
                    /*  setMessages(prevMessages => {
                          const updatedMessages = [...prevMessages];
                          if (updatedMessages.length > 1) {
                              updatedMessages.pop(); // Remove last AI response
                              updatedMessages.pop(); // Remove last user request
                          }
                          return updatedMessages;
                      });*/
                    /* setResponse(prev => {
                         const updatedContent = prev + content;
                         setMessages(prevMessages => {
                             const updatedMessages = [...prevMessages];
                             if (updatedMessages.length > 0) {
                                 updatedMessages[updatedMessages.length - 1].content = updatedContent;
                             }
                             return updatedMessages;
                         });
                         return updatedContent;
                     });*/
                    setUserInput(lastUserInput);
                    if (false && content.includes('Server error')) {
                        setStatus('red');
                        setUpdateMessage("Server error. Retrying...");
                        setPumpUUId('');
                        setTimeout(() => {
                            const formEvent = new Event('submit', { bubbles: true });
                            //console.log("==> CHAT.TSX onError setting formEvent and retrying handleSubmit");
                            handleSubmit(formEvent as unknown as React.FormEvent);
                        }, 1);
                        setResponse(prev => {
                            const updatedContent = "";
                            setMessages(prevMessages => {
                                const updatedMessages = [...prevMessages];
                                if (updatedMessages.length > 0) {
                                    updatedMessages[updatedMessages.length - 1].content = updatedContent;
                                }
                                return updatedMessages;
                            });
                            return updatedContent;
                        });
                    }
                    else {

                        /*if (textareaRef.current) {
                            textareaRef.current.value = lastUserInput;
                            const formEvent = new Event('submit', { bubbles: true });
                            handleSubmit(formEvent as unknown as React.FormEvent);
                        }*/
                        setPumpUUId('');
                        setTimeout(() => {
                            setPumpUUId(pumpUUId); //to trigger useEffect
                        }, 100);
                    }

                },
            }).catch(error => {
                console.error("Error in actionUserRequest:", error);
                setUpdateMessage("Streaming network error");
                setResponse(prev => {
                    const updatedContent = prev + "Network error. Please try again.";
                    setMessages(prevMessages => {
                        const updatedMessages = [...prevMessages];
                        if (updatedMessages.length > 1) {
                            if (updatedMessages[updatedMessages.length - 1]?.role == 'Qwiket AI') {
                                updatedMessages[updatedMessages.length - 1].content = updatedContent;
                            }
                        }
                        return updatedMessages;
                    });
                    return updatedContent;
                });
                setUserInput(lastUserInput);
            });
        }
    }, [pumpUUId, chatUUId]);

    /* useEffect(() => {
         const prompt = searchParams?.get('prompt') || "";
         const promptUUId = searchParams?.get('promptUUId') || "";
         if (promptUUId && promptUUId != initialPromptUUIdRef.current) {
             console.log("==> CHAT.TSX useEffect searchParams", promptUUId, initialPromptUUIdRef.current);
             initialPromptUUIdRef.current = promptUUId; // Update the ref instead of state
             //  setMessages([{ role: 'user', content: prompt }, { role: 'assistant', content: '' }]);
            
         }
     }, [searchParams]);*/


    useEffect(() => {
        if (utm_content && utm_content.includes("xad")) {
            actionFetchPrompts({ league }).then(setPrompts);
        }
    }, [league, utm_content]);

    /*   useEffect(() => {
           if (initialPrompt) {
               setUserInput(initialPrompt);
           }
       }, [initialPrompt]);*/

    /*useEffect(() => {
        if (!loadedChat) {
            setChatUUId('_new');
            // setChatUUId(promptUUId ? "_new" : (chatUUIdProp || ""));
            setMessages([]);
            setChatName('New Chat');
            setFollowupPrompts([]);
        }
        // console.log('==> useEffect league', league);
    }, [league])*/
    /* useEffect(() => {
         setIsLoading(isLoadingChat);
     }, [isLoadingChat]);*/

    const update = useCallback((message: string) => {
        setUpdateMessage(message);

    }, []);

    useEffect(() => {
        if (loadedChat && !loadedChatError && !isLoadingChat && loadedChat.success) {
            setChatUUId(loadedChat.chat.chatUUId);
            if (loadedChat.chat.messages && loadedChat.chat.messages.length > 0) {
                setFollowupPrompts(loadedChat.chat.messages.length > 0 ? loadedChat.chat.messages[loadedChat.chat.messages.length - 1].prompts || [] : []);
                const lastMessage = messages[messages.length - 1];
                //console.log("==> CHAT.TSX useEffect loadedChat", { loadedChatMessages: loadedChat.chat.messages, messages: messages, lastMessage: lastMessage });
                if (lastMessage?.role == 'Qwiket AI' && loadedChat.chat.promptUUId == promptUUId && loadedChat.chat.messages.length > messages.length) {
                    setMessages([...loadedChat.chat.messages, lastMessage]);
                }
                else {
                    setMessages(messages);
                }
                setIsLoading(false);

            }
            if (loadedChat?.chat?.name?.includes("ChatGPT")) {
                setChatName(loadedChat?.chat?.name?.replace("ChatGPT", "Qwiket AI") || 'New Chat');
            } else {
                if (loadedChat?.chat?.name != "New Chat" && loadedChat?.chat?.name != chatName) {
                    setChatName(loadedChat?.chat?.name || 'New Chat');
                }
            }
            setLastMessageUUID(loadedChat?.chat?.lastMessageUUID || '');
        }
    }, [loadedChat]);

    const hasSubmittedPromptRef = useRef(false);
    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        let lastMessage = drawMessages[drawMessages.length - 1];
        // Reset feedback state
        setFeedback({ messageUUId: "", feedback: "", stars: 0, open: false });
        setStatus('green');
        const currentUserInput = textareaRef.current?.value.trim() || lastUserInput;
        if (!currentUserInput) return;
        setIsMessageSubmitted(true);
        setIsPromptSelected(false);  // Reset prompt selection on submit
        update(`Loading ...`);
        const insider = currentUserInput.toLowerCase().indexOf("qw:") == 0;
        const userInputCleaned = currentUserInput?.replace(/qw:/i, "");

        const newMessage: Message = {
            role: 'user',
            content: userInputCleaned
        };
        setProvisionalUserInput((prev) => {
            return userInputCleaned;
        });
        setLastUserInput(userInputCleaned);
        setUserInput('');
        if (textareaRef.current) {
            textareaRef.current.value = '';
        }

        setResponse('');
        setFollowupPrompts([]); // Clear follow-up prompts
        const assistantMessage: Message = {
            role: 'Qwiket AI',
            content: ''
        };
        // console.log("==> CHAT.TSX handleSubmit newMessage", messages, newMessage, assistantMessage);
        setMessages(prevMessages => [...prevMessages, newMessage, assistantMessage]);

        try {
            if (!pumpUUIdRef.current) {
                let paramChatUUId = chatUUId;
                if (paramChatUUId == '_new') {
                    paramChatUUId = '';
                }
                setIsLoading(true);
                setPendingUserRequest(true);
                //console.log("==> CHAT.TSX handleSubmit actionChatInit", { userRequest: userInputCleaned, chatUUId: paramChatUUId, teamid, league, athleteUUId, insider, fantasyTeam: isFantasyTeam || false, styleDocument: "", dataDocumentsString: "", creator, promptUUId });
                actionChatInit({ userRequest: userInputCleaned, chatUUId: paramChatUUId, teamid, league, athleteUUId, insider, fantasyTeam: isFantasyTeam || false, styleDocument: "", dataDocumentsString: "", creator, promptUUId }).then(
                    (data) => {
                        if (!bot) {
                            actionRecordEvent(`chat-init`, `{"utm_content":"${utm_content}","isMobile":${isMobile},"promptUUId":"${promptUUId}","prompt":"${prompt}","data":"${JSON.stringify(data)}","params":"${params}"}`)
                                .then((r: any) => {
                                    //console.log("recordEvent", r);
                                });
                        }
                        const { pumpUUId: newPumpUUId, nocredits, name: newName, league: newLeague, chatUUId: newChatUUId } = data;
                        if (nocredits) {
                            setIsLoading(false);
                            setUpdateMessage("No credits remaining");
                            return;
                        }
                        if (pumpUUIdRef.current != newPumpUUId) {
                            setPumpUUId((prev) => {
                                return newPumpUUId;
                            });
                            // console.log("==> CHAT.TSX handleSubmit actionChatInit mutateLoadedChat", { newPumpUUId, newChatUUId });
                            // mutateLoadedChat();
                        }
                        if (chatUUId != newChatUUId) {
                            setChatUUId((prev) => {
                                return newChatUUId;
                            });
                        }
                        if (chatName != newName) {
                            setChatName(newName);
                        }
                        if (league != newLeague) {
                            if (['NFL', 'MLB', 'NBA', 'NHL'].includes(newLeague)) {
                                setToastMessage(`Switching to ${newLeague} tab...`);
                                // setToastIcon(<TeamAddIcon className="text-2xl inline" />); // Example icon, adjust as needed

                                // Automatically clear the toast message after 3 seconds
                                setTimeout(() => {
                                    setToastMessage("");
                                }, 3000);

                                // Navigate to the new league view
                                window.history.pushState({}, '', `/${newLeague.trim().toUpperCase()}?tab=chat`);
                                // console.log('*********************** CHAT onLeagueUpdate:', content);
                            }
                        }
                    }
                );
                // mutateLoadedChat();


            }

            /* else {
                userRequest();
            }*/


        } catch (error) {
            console.error("Error in actionUserRequest:", error);
            setUpdateMessage("Streaming network error");
            setResponse(prev => {
                const updatedContent = prev + "Network error. Please try again.";
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
            // setIsLoading(false);
            // setStreamingMessageIndex(null);
            setUserInput(lastUserInput);
            //console.log("setting lastUserInput3", lastUserInput);
            setIsLoading(false);
        }

    }, [chatUUId, athleteUUId, teamid, league, isFantasyTeam, lastUserInput]);

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
    const handleFeedbackKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleFeedbackSubmit();
        }
    };
    useEffect(() => {
        if (textareaRef.current && !promptUUId) {
            textareaRef.current.focus();
        }
    }, [promptUUId]);

    const handlePromptClick = (prompt: string) => {
        if (textareaRef.current) {
            textareaRef.current.value = prompt;
            setIsPromptSelected(true);
            setIsMessageSubmitted(false);  // Reset this when a prompt is clicked
        }
    };
    useEffect(() => {
        if (!bot) {
            actionRecordEvent(`chat-component-open`, `{"utm_content":"${utm_content}","isMobile":${isMobile},"promptUUId":"${promptUUId}","prompt":"${prompt}","league":"${league}","params":"${params}"}`)
                .then((r: any) => {
                    //console.log("recordEvent", r);
                });
        }
    }, []);
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
                            href={`/${p.league}${teamid ? `/${teamid}` : ''}${player ? `/${player}` : ''}${athleteUUId ? `/${athleteUUId}` : ''}${param}&prompt=${encodeURIComponent(p.prompt)}&promptUUId=${p.uuid}`}
                            $isDarkMode={isDarkMode}
                        >
                            {typeof p.prompt === 'string' ? p.prompt : JSON.stringify(p.prompt)}
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
            className="absolute -inset-0 rounded-full"
            animate={{
                boxShadow: [
                    status === 'red' ? '0 0 0 0 rgba(255, 0, 0, 0)' :
                        status === 'yellow' ? '0 0 0 0 rgba(255, 255, 0, 0)' :
                            status === 'white' ? '0 0 0 0 rgba(0, 255, 255, 0)' : // Original color for white
                                '0 0 0 0 rgba(0, 255, 0, 0)', // Default for green
                    status === 'red' ? '0 0 0 9px rgba(255, 0, 0, 0.3)' :
                        status === 'yellow' ? '0 0 0 9px rgba(255, 255, 0, 0.3)' :
                            status === 'white' ? '0 0 0 9px rgba(0, 255, 255, 0.3)' : // Original color for white
                                '0 0 0 9px rgba(0, 255, 0, 0.3)' // Default for green
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
    // const relatedContentBox = relatedContent ? <RelatedContentBox relatedContent={relatedContent} /> : null;

    const handleRetry = () => {
        if (textareaRef.current) {
            if (textareaRef.current) {
                textareaRef.current.value = prompt; // Load prompt into textarea
                const formEvent = new Event('submit', { bubbles: true }); // Create a new event
                handleSubmit(formEvent as unknown as React.FormEvent); // Trigger handleSubmit
                hasSubmittedPromptRef.current = true; // Mark as submitted
            }

        }
    };

    const [componentId, setComponentId] = useState(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    let singularity = 0;
    /* useEffect(() => {
         if (prompt && !singularity && !bot) {
             singularity++;
             recordEvent(`chat-auto-start`, `{"text":"${prompt}","componentId":"${componentId}","isMobile":${isMobile},"creator":"${!creator}","params":"${JSON.stringify(params)}"}`)
             setTimeout(() => {
                 //console.log("==> CHAT.TSX useEffect333 handleRetry prompt", { chatUUId, componentId, prompt, isMobile });
                 setTimeout(() => {
                     singularity = 0;
                 }, 2000);
                 handleRetry();
             }, 2000);
         }
     }, [prompt]);*/
    // const [starRating, setStarRating] = useState<number>(0);
    // const [feedbackText, setFeedbackText] = useState<string>('');

    // Function to handle star click
    const handleStarClick = (index: number) => {

        const lastMessage = drawMessages[drawMessages.length - 1]; // Get the last message

        const stars = index + 1;
        setFeedback({ messageUUId: lastMessageUUID, feedback: feedback.feedback, stars: stars, open: feedback.open });
        actionFeedback({ stars: stars, feedback: feedback.feedback, messageUUId: lastMessageUUID }).then(() => {
        });
        recordEvent(`chat-stars-click`, `{"stars":${stars},"feedback":"${feedback.feedback}","messageUUId":"${lastMessageUUID}","creator":"${!creator}","params":"${JSON.stringify(params)}"}`)
            .then((r: any) => {
                //console.log("recordEvent", r);
            })
    };
    // const starsTrigger = loadedChat?.chat?.lastMessageUUID && drawMessages.length > 0 && drawMessages[drawMessages.length - 1]?.role !== 'user'
    // Function to handle feedback submission
    const handleFeedbackSubmit = () => {
        const feedbackText = feedbackTextareaRef.current?.value || '';

        if (feedbackText) {
            const lastMessage = drawMessages[drawMessages.length - 1]; // Get the last message

            actionFeedback({ stars: 0, feedback: feedbackText, messageUUId: lastMessageUUID }).then(() => {
            });
            //setLastMessageUpdate(prev => prev + 1); // Trigger re-render
            setTimeout(() => {
                setFeedback({ messageUUId: lastMessageUUID, feedback: 'Thank you for your feedback!', stars: feedback.stars, open: feedback.open });

                if (feedbackTextareaRef.current) {
                    feedbackTextareaRef.current.value = 'Thank you for your feedback!';
                }
                recordEvent(`chat-feedback-submit`, `{"stars":${feedback.stars},"feedback":"${feedback.feedback}","messageUUId":"${lastMessageUUID}","creator":"${!creator}","params":"${JSON.stringify(params)}"}`)
                    .then((r: any) => {
                        //console.log("recordEvent", r);
                    })
            }, 2000);
        }
    };
    /*
    *
     prompt: string,
    response: string,
    slug: string,
    image: string,
    image_width: number,
    image_height: number,
    publishedTime: string,
    title: string,
    digest: string
    */
    let lastMessage = drawMessages[drawMessages.length - 1];
    let relatedUrl = relatedContent ? `${league}${teamid ? `/${teamid}` : ''}${player ? `/${encodeURIComponent(player)}` : ''}${athleteUUId ? `/${athleteUUId}` : ''}?story=${encodeURIComponent(relatedContent.slug)}` : '';
    const renderedRelatedContent = relatedContent && relatedContent.digest && relatedContent.image && (
        <div className="flex justify-center">
            <div className="related-content flex flex-col mt-12 p-4 border rounded-lg shadow-md bg-white dark:bg-gray-800 w-full sm:w-1 md:w-1 lg:w-1/2 xl:w-1/2">
                <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Related Content:</h2>
                <Link href={`/${relatedUrl}`} className="w-full">
                    <img src={relatedContent.image} width={relatedContent.image_width} height={relatedContent.image_height} alt={relatedContent.title} className="w-full h-auto rounded-md mb-2" />
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200">{relatedContent.title}</h3>
                </Link>
                <div
                    className="text-gray-600 dark:text-gray-400"
                    dangerouslySetInnerHTML={{
                        __html: relatedContent?.digest?.replace(/<p>/g, '<p class="mt-4">').substring(0, 160) + '...'
                    }}
                />
                <Link href={`/${relatedUrl}`} className="text-blue-500 hover:underline mt-2">
                    Read more
                </Link>
            </div>
        </div>
    )
    const formRef = useRef<HTMLFormElement>(null); // Create a ref for the form
    return (
        <>
            {toastMessage && <Toast icon={toastIcon} message={toastMessage} onClose={() => setToastMessage("")} />}
            <div className="flex flex-col bg-white dark:bg-black w-full relative">
                <div className="flex-shrink-0 lg:p-4 p-4 pt-2 lg:pt-4 relative z-2">
                    <div className="flex items-center justify-end">
                        <Link
                            href="/account/dashboard"
                            className={`text-xs ${creditColorClass} hover:underline mr-2`}
                            onClick={() => recordEvent(`credits-chat-dashboard-click`, `{"creator":"${!creator}","params":"${JSON.stringify(params)}"}`)
                                .then((r: any) => {
                                    //console.log("recordEvent", r);
                                })}
                        >
                            {creditsString}
                        </Link>
                        <button
                            onClick={() => {
                                setShowCreditsInfo(!showCreditsInfo);
                                recordEvent(`credits-chat-info-click`, `{"creator":"${!creator}","params":"${JSON.stringify(params)}"}`)
                                    .then((r: any) => {
                                        // console.log("recordEvent", r);
                                    });
                            }}
                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <FaInfoCircle size={14} />
                        </button>
                    </div>
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
                                        const url = new URL(window.location.href);
                                        url.searchParams.delete('prompt');
                                        url.searchParams.delete('promptUUId');
                                        window.history.replaceState({}, '', url.toString());
                                        // initialPromptUUIdRef.current = '';

                                        setMessages([]);
                                        setChatName('New Chat');
                                        setOpenMyChats(false);
                                        setIsLoading(false);
                                        setFollowupPrompts([]);
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
                                <div className="flex items-center justify-center mt-2 mb-2">
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
                                        Credits are used for AI Chat requests. Regular credits refill monthly based on your subscription. Extra credits never expire and are used when regular credits run out. Visit the
                                        <Link href="/account/dashboard" className="text-blue-500 hover:underline" onClick={() => recordEvent(`credits-info-link-dashboard-click`, `{"creator":"${!creator}","params":"${JSON.stringify(params)}"}`)
                                            .then((r: any) => {
                                                //console.log("recordEvent", r);
                                            })}>
                                            Dashboard
                                        </Link> for more details on your credit usage and subscription options.
                                    </div>
                                )}
                                {creator && !showCreatorInfo && (
                                    <div className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 mb-4">
                                        {isCid ? <Link href="/account/rsp-creator">
                                            Revenue-Sharing Program
                                        </Link> : <Link href="/account/rsp">
                                            Learn about the Revenue-Sharing Program for Creators
                                        </Link>}
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

                <div className={`overflow-y-auto mb-32 p-0 pb-8 relative z-0 ${openMyChats ? 'opacity-50' : ''}`}>
                    {drawMessages.length === 0 && (
                        <>
                            {(!prompts || prompts.length === 0) ? <>
                                <p className="text-gray-600 dark:text-gray-400 italic text-center mt-0 mb-8">
                                    Ask Qwiket AI anything about major league and fantasy sports and more...
                                </p>
                                <p className="text-gray-600 dark:text-gray-400 italic text-center mt-6 mb-8">
                                    Please note that AI results may not always be reliable. It&apos;s recommended to ask follow-up questions for clarification and verify important information from trusted sources.
                                </p>

                            </> : renderPrompts(isMobile ? "mobile" : "desktop")}
                        </>
                    )}
                    {drawMessages.map((message: Message, index: number) => (
                        <div key={`${index}-${message.content}`} className={`mb-2 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`w-full min-w-[200px] ${message.role === 'user' ? 'lg:max-w-[70%]' : ''} max-w-[95%] p-3 rounded-2xl 
                        ${message.role === 'user'
                                    ? 'bg-gray-100 dark:bg-gray-800'
                                    : ''
                                } text-gray-800 dark:text-gray-200`}>
                                <div className="flex justify-between items-center mb-1">
                                    {message.role !== 'user' && (
                                        <div className="flex items-center">
                                            {streamingMessageIndex !== index && (
                                                <>

                                                </>
                                            )}
                                            <span className="font-bold ml-0.5">Qwiket AI:</span>
                                        </div>
                                    )}
                                    {message.role !== 'user' && message.content.length >= 20 && (
                                        <button
                                            onClick={() => copyToClipboard(message.content, index)}
                                            className={`${copiedMessageIndex === index
                                                ? 'text-green-500 dark:text-green-400'
                                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                                                } transition-colors duration-200`}
                                        >
                                            {copiedMessageIndex === index ? <FaCheck size={14} /> : <FaCopy size={14} />}
                                        </button>
                                    )}
                                </div>
                                <ReactMarkdown components={MarkdownComponents}>
                                    {message?.content || ''}
                                </ReactMarkdown>
                                {promptUUId && index === drawMessages.length - 1 && drawMessages.length < 3 && <div className=" mb-4  flex justify-center">
                                    <button className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300" onClick={() => {
                                        if (textareaRef.current) {
                                            if (textareaRef.current) {
                                                textareaRef.current.value = 'Please expand the answer'; // Load prompt into textarea
                                                const formEvent = new Event('submit', { bubbles: true }); // Create a new event
                                                // handleSubmit(formEvent as unknown as React.FormEvent); // Trigger handleSubmit
                                                // hasSubmittedPromptRef.current = true; // Mark as submitted
                                                formRef.current?.dispatchEvent(formEvent);
                                                const newMessage: Message = {
                                                    role: 'user',
                                                    content: 'Your new user message here' // Replace with the actual message content
                                                };
                                                /* mutateLoadedChat({
                                                     ...loadedChat, // Spread existing chat data
                                                     chat: {
                                                         ...loadedChat.chat, // Spread existing chat attributes
                                                         messages: [...loadedChat.chat.messages, newMessage] // Add the new user message
                                                     }
                                                 });
                                                 setTimeout(() => {
                                                     mutateLoadedChat();
                                                 }, 2000);*/
                                            }

                                        }
                                    }}>
                                        More details...
                                    </button>
                                </div>}
                                {index === drawMessages.length - 1 && message.role === 'Qwiket AI' && (
                                    <>
                                        <BlinkingDot />
                                        {false && <button onClick={handleRetry} className="ml-2 text-gray-500 hover:text-gray-700">
                                            <FaRedo size={8} /> {/* Retry icon */}
                                        </button>}
                                    </>
                                )}
                            </div>
                        </div>
                    ))}

                    {!isLoading && loadedChat?.chat?.lastMessageUUID && drawMessages.length > 0 && drawMessages[drawMessages.length - 1]?.role == 'assistant' && (
                        <div className="mt-4 mb-4 ml-4 mr-4">
                            <hr className="w-full border-gray-300 dark:border-gray-700" ></hr>

                            <div className="flex items-center">
                                Rate the QwiketAI response:&nbsp;{[...Array(5)].map((_, index) => (
                                    <span
                                        key={index}
                                        onClick={() => handleStarClick(index)}
                                        className={`cursor-pointer ${feedback.stars && feedback.stars > index ? 'text-yellow-500' : 'text-gray-400'}`}
                                    >
                                        ★
                                    </span>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    if (lastMessage) {
                                        setFeedback({ messageUUId: lastMessageUUID, feedback: feedback.feedback, stars: feedback.stars, open: !feedback.open });
                                        recordEvent(`chat-feedback-click`, `{"stars":${feedback.stars},"feedback":"${feedback.feedback}","messageUUId":"${lastMessageUUID}","creator":"${!creator}","params":"${JSON.stringify(params)}"}`)
                                            .then((r: any) => {
                                                //console.log("recordEvent", r);
                                            })
                                    }
                                    //setLastMessageUpdate(prev => prev + 1);
                                }

                                }
                                className="mt-2 text-blue-500"
                            >
                                More Feedback
                            </button>
                            {feedback.open && (
                                <div className={`mt-2 ${feedback.feedback ? 'opacity-50' : ''}`}>
                                    <div className="relative">
                                        <textarea
                                            onKeyDown={handleFeedbackKeyDown}
                                            ref={feedbackTextareaRef}
                                            defaultValue={feedback.feedback || ''}
                                            // onChange={(e) => { lastMessage.feedback = e.target.value }}
                                            placeholder="Your feedback..."
                                            //className="w-full p-3 pr-16 border rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-black resize-none"
                                            className={`w-full p-3 pr-16 border mh-4 rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-black resize-none ${openMyChats ? 'opacity-50' : ''}`}

                                            rows={3}
                                            disabled={isLoading || feedback.feedback}
                                        />
                                        <button
                                            onClick={handleFeedbackSubmit}
                                            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-500 hover:text-teal-600 dark:text-cyan-400 dark:hover:text-cyan-300"
                                        >
                                            <FaPaperPlane size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-center items-center h-2 pt-4 text-xs text-gray-500 dark:text-gray-400">
                        {updateMessage || "***"}
                    </div>
                    {chatName !== "New Chat" && immediateFollowupPrompts.length > 0 && !isLoading && !pumpUUId && (
                        <div className="mt-4 mb-8"> {/* Added mb-4 for margin-bottom */}
                            {false && <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Follow-up suggestions:</h4>}
                            <div className="flex flex-wrap gap-2">
                                {immediateFollowupPrompts.map((prompt: string | { prompt: string }, index: number) => (
                                    <button
                                        key={index}
                                        onClick={() => handlePromptClick(typeof prompt === 'string' ? prompt : prompt.prompt)}
                                        className={`text-sm px-6 py-1 rounded-full transition-colors duration-200 text-left ${isDarkMode
                                            ? 'bg-[#1D4037] text-[#E0E0E0] hover:bg-[#795548] hover:text-white'
                                            : 'bg-[#CFE0C2] text-[#4E342E] hover:bg-[#FFCCBC] hover:text-[#3E2723]'
                                            }`}
                                    >
                                        {typeof prompt === 'string'
                                            ? prompt
                                            : 'prompt' in prompt
                                                ? prompt.prompt
                                                : ''}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {level == 'trial' && !isLoading && drawMessages.length >= 6 && (
                        <div className="text-xs text-green-600 dark:text-green-400 mb-6 mt-4 ml-4 mr-4">
                            You have {totalCredits} trial credits remaining. Consider&nbsp;
                            <Link href="/account/upgrade" className="text-blue-500 hover:underline" onClick={() => recordEvent(`reasoning-trial-upgrade-click`, `{"creator":"${!creator}","utm_content":"${utm_content}","isMobile":${isMobile},"promptUUId":"${promptUUId}","prompt":"${prompt}","remainingCredits":"${totalCredits}","params":"${JSON.stringify(params)}"}`)
                                .then((r: any) => {
                                    //console.log("recordEvent", r);
                                })}>
                                subscribing to Qwiket AI
                            </Link> for continuous reasoning and decision-making support in your Fantasy Sports and Betting strategies.
                        </div>
                    )}

                    <div className="p-0 mt-4 mx-4">
                        <form ref={formRef} onSubmit={handleSubmit} className="relative">
                            <textarea
                                ref={textareaRef}
                                defaultValue={userInput}
                                onKeyDown={handleKeyDown} //787508
                                onChange={() => {
                                    setIsPromptSelected(false);
                                    setIsMessageSubmitted(false);  // Reset on manual input
                                }}
                                placeholder={messages.length ? "Ask a follow-up question..." : creator ? `Compose your prompt for AI. For example: "In 400 words, create a post about ..."` : `Ask me about sports...`}
                                className={`w-full p-3 pr-16 border rounded-lg text-gray-800 dark:text-gray-200 bg-white dark:bg-black resize-none ${openMyChats ? 'opacity-50' : ''}`}
                                rows={3}
                                disabled={isLoading || (pumpUUId ? true : false)}
                            />
                            <button
                                type="submit"
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-teal-500 hover:text-teal-600 dark:text-cyan-400 dark:hover:text-cyan-300"
                                disabled={isLoading || (pumpUUId ? true : false)}
                            >
                                {isLoading || pumpUUId ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-800 dark:border-gray-200"></div>
                                ) : (
                                    <div className="relative p-1.5">
                                        {(messages.length === 0 && textareaRef.current?.value.trim() !== '' && !isMessageSubmitted) || (isPromptSelected && !isMessageSubmitted) ? <FlashingCircle /> : null}
                                        <FaPaperPlane size={18} />
                                    </div>
                                )}
                            </button>
                        </form>
                        {renderedRelatedContent}
                    </div>

                </div>

                <div className="flex-shrink-0 fixed bottom-0 w-full max-w-[600px] bg-white dark:bg-black border-gray-200 dark:border-gray-700">
                </div>

            </div >

        </>
    );

};

export default ChatsComponent;

'use client';
import React, { useState, useRef, useEffect, startTransition, useCallback, ReactNode } from "react";
import useSWR from 'swr';
import { useAppContext } from '@lib/context';
import { motion } from 'framer-motion';

import { Chat, Message } from "@lib/types/chat";
import { actionChat, actionChatName, actionCreateChat, actionLoadLatestChat, CreateChatProps } from "@lib/fetchers/chat";
import ReactMarkdown, { Components } from 'react-markdown';
import { FaPaperPlane, FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Added chevron icons
import { actionUserRequest } from "@lib/actions/user-request";
import MyChats from "@components/func-components/mychats";
import { MyChatsKey, CreateChatKey } from "@lib/keys";

interface Props {
    chatUUId?: string;
    isFantasyTeam?: boolean;
}

const ChatsComponent: React.FC<Props> = ({
    chatUUId: chatUUIdProp,
    isFantasyTeam
}) => {
    const { fallback, mode, isMobile, noUser, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, teamid, player, teamName, setTeamName, athleteUUId } = useAppContext();
    // console.log("==> ChatsComponent:", "teamid", teamid, "league", league, "athleteUUId", athleteUUId, "isFantasyTeam", isFantasyTeam)
    const [response, setResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userInput, setUserInput] = useState<string>('');
    const responseTextareaRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const responseSetRef = useRef(false); // Add a ref to track if response has been set
    const [chatUUId, setChatUUId] = useState<string>(chatUUIdProp || "");
    const [chatName, setChatName] = useState<string>('New Chat');
    const [openMyChats, setOpenMyChats] = useState<boolean>(false);
    const [updateMessage, setUpdateMessage] = useState<string>('');
    const [pendingUserRequest, setPendingUserRequest] = useState<boolean>(false);
    const [provisionalChatUUId, setProvisionalChatUUId] = useState<string>('');
    const [provisionalUserInput, setProvisionalUserInput] = useState<string>('');
    // const [chatSelected, setChatSelected] = useState<boolean>(false);
    console.log("==> ChatsComponent:", league, teamid, athleteUUId, isFantasyTeam)
    const createChatKey: CreateChatKey = { type: "create-chat", chatUUId: chatUUId, league, teamid, athleteUUId, fantasyTeam: false };
    const { data: loadedChat, error: loadedChatError, isLoading: isLoadingChat } = useSWR(createChatKey, actionLoadLatestChat, { fallback });
    useEffect(() => {
        setChatUUId(chatUUIdProp || "");
        setMessages([]);
        setChatName('New Chat');
    }, [league])
    useEffect(() => {
        //if (isLoadingChat) {
        setIsLoading(isLoadingChat);
        // }
    }, [isLoadingChat]);

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
        console.log("provisionalChatUUId", provisionalChatUUId, "chatUUId", chatUUId)
        actionUserRequest({
            chatUUId: provisionalChatUUId || chatUUId,
            userRequest: provisionalUserInput || userInput,
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
                        console.log("prevMessages", updatedMessages)
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
                setIsLoading(false);
                actionChatName({ chatUUId }).then(
                    (data) => {
                        if (data.success) {
                            setChatName(data.chatName);
                        }
                    }
                );
            },
            onChatUUId: (content: string) => {
                setChatUUId(prev => {
                    return content;
                });
            },
            onMetaUpdate: (content: string) => {
                update(content);
            }

        }).catch(error => {
            console.error("Error in actionUserRequest:", error);
            setIsLoading(false);
        }).finally(() => {
            setIsLoading(false);

        });
        setProvisionalChatUUId('');
        setProvisionalUserInput('');
    }, [chatUUId, provisionalChatUUId, userInput, athleteUUId, teamid, league, isFantasyTeam])

    useEffect(() => {
        if (chatUUId && chatUUId != '_new' && pendingUserRequest || provisionalChatUUId && pendingUserRequest) {
            console.log("CALLING userRequest:", "chatUUId", chatUUId, "provisionalChatUUId", provisionalChatUUId, "pendingUserRequest", pendingUserRequest)
            setPendingUserRequest(false);
            userRequest();
        }
    }, [chatUUId, provisionalChatUUId, pendingUserRequest]);

    useEffect(() => {
        console.log("useEffectloadedChatData", loadedChat);
        if (loadedChat && !loadedChatError && !isLoadingChat && loadedChat.success) {
            console.log("GOT loadedChat.chat.chatUUId", loadedChat.chat.chatUUId)
            setChatUUId(loadedChat.chat.chatUUId);
            if (loadedChat.chat.messages) {
                setMessages(loadedChat.chat.messages);
            }

            console.log("loadedChat.chat.name", loadedChat.chat.name)
            if (loadedChat?.chat?.name?.includes("ChatGPT")) {
                setChatName(loadedChat?.chat?.name?.replace("ChatGPT", "QwiketAI") || 'New Chat');
            } else {
                setChatName(loadedChat?.chat?.name || 'New Chat');
            }
            setIsLoading(false);

        }
    }, [loadedChat]);

    /*useEffect(() => {
        console.log("chatName", chatName)
        if (chatName?.includes("ChatGPT")) {
            setChatName(chatName?.replace("ChatGpt", "QwiketAI") || 'New Chat');
        } else {
            setChatName(chatName || '');
        }
    }, [chatName])*/

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        console.log("handleSubmit", userInput)
        e.preventDefault();
        if (!userInput.trim()) return;
        const newMessage: Message = {
            role: 'user',
            content: userInput
        };
        update('Loading...');

        console.log("messages", messages);
        setProvisionalUserInput(userInput);
        setUserInput('');
        setIsLoading(true);
        setResponse('');
        console.log("handleSubmit2", userInput)
        responseSetRef.current = false; // Reset the ref when a new request is made

        // Add a placeholder message for the assistant response
        const assistantMessage: Message = {
            role: 'QwiketAI',
            content: ''
        };
        setMessages(prevMessages => [...prevMessages, newMessage, assistantMessage]);
        try {
            if (!chatUUId || chatUUId == '_new') {
                setIsLoading(true);
                setPendingUserRequest(true);
                //console.log("==> actionCreateChat:", "teamid", teamid, "league", league, "athleteUUId", athleteUUId, "isFantasyTeam", isFantasyTeam)
                actionCreateChat({ teamid, league, athleteUUId, fantasyTeam: isFantasyTeam || false }).then(
                    (chatUUId) => {
                        //console.log("=============> chat createdchatUUId", chatUUId)
                        setProvisionalChatUUId((prev) => { // this will trigger useEffect to call userRequest
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
            // Optionally, update the UI to show an error message
        }
    }, [chatUUId, userInput, athleteUUId, teamid, league, isFantasyTeam])

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
    if (!league) {
        return <><br /><h2 className="text-xl min-h-screen font-bold p-4">Please select a league first.</h2></>;
    }
    // Custom components for ReactMarkdown
    const MarkdownComponents: Partial<Components> = {
        h1: ({ node, ...props }) => <h1 className="text-2xl font-bold my-8" {...props} />,
        h2: ({ node, ...props }) => <h2 className="text-xl font-semibold my-4" {...props} />,
        h3: ({ node, ...props }) => <h3 className="text-lg font-medium my-2 mt-8" {...props} />,
        p: ({ node, ...props }) => <p className="my-2" {...props} />,
        ul: ({ node, ...props }) => <ul className="list-disc list-inside my-2" {...props} />,
        ol: ({ node, ...props }) => <ol className="list-inside my-2 mt-4" {...props} />,
        li: ({ node, ...props }) => <li className="my-1" {...props} />,
        strong: ({ node, ...props }) => <strong className="font-bold mt-4" {...props} />,
        a: ({ node, href, children, ...props }) => (
            <a href={href} className="text-blue-500 hover:underline" {...props}>
                {children}
            </a>
        ),
        img: ({ node, ...props }) => (
            <img
                {...props}
                width="64"
                height="64"
                style={{ width: '64px', height: '64px', objectFit: 'cover' }}
            />
        ),
        code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            return (
                <code
                    className={`${match ? 'block bg-gray-100 dark:bg-gray-800 rounded p-2 my-2' : 'bg-gray-200 dark:bg-gray-700 rounded px-1'}`}
                    {...props}
                >
                    {children}
                </code>
            );
        },
    };

    console.log("messages", messages)
    const BlinkingDot = () => (
        <motion.span
            animate={{ opacity: [0, 1] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
            className="inline-block ml-1"
        >
            •
        </motion.span>
    );

    return (
        <div className="flex flex-col min-h-screen  h-full w-full bg-white dark:bg-black">
            {false && (
                <div className="flex justify-center items-center mt-4">
                    Loading Chat...
                </div>
            )}

            <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <button
                            onClick={() => setOpenMyChats(!openMyChats)}
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            {openMyChats ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                        <h1 className="ml-4 text-xl font-bold text-gray-800 dark:text-gray-200">{chatName}</h1>
                    </div>
                    <button
                        onClick={() => {
                            setChatUUId("_new");
                            setMessages([]);
                            setChatName('New Chat');
                            setOpenMyChats(false);
                            setIsLoading(false);
                        }}
                        className={`bg-teal-700 dark:bg-teal-900 hover:bg-teal-700 hover:dark:bg-teal-700 text-gray-200 hover:text-white font-bold py-2 px-4 rounded ${chatName === 'New Chat' ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        disabled={chatName === 'New Chat'}
                    >
                        New Chat
                    </button>
                </div>
                {openMyChats && (
                    <MyChats
                        onChatSelect={async (selectedChatUUId) => {
                            // Handle chat selection

                            setChatUUId(selectedChatUUId);
                            setTimeout(() => {

                                setOpenMyChats(false);
                            }, 200);

                        }}
                        onNewChat={async () => {
                            console.log("onNewChat");
                            // setNewChat(true);
                            // Handle new chat creation
                            setChatUUId("_new");
                            setMessages([]);
                            setChatName('New Chat');
                            setOpenMyChats(false);
                        }}
                        onFirstChat={(firstChat) => {
                            // Handle first chat selection if needed
                        }}
                    />
                )}

            </div>


            <div className="p-1">
                <>
                    {messages.map((message, index) => (
                        <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl ${message.role === 'user'
                                ? 'bg-blue-100 dark:bg-teal-800'
                                : 'bg-gray-100 dark:bg-gray-700'
                                } text-gray-800 dark:text-gray-200`}>
                                <p className="font-semibold mb-1">{message.role === 'user' ? 'You' : 'QwiketAI'}</p>
                                <ReactMarkdown components={MarkdownComponents}>
                                    {message?.content?.replace(/<img/g, '<img width="64" height="64" ') || ''}
                                </ReactMarkdown>
                                {isLoading && index === messages.length - 1 && message.role === 'QwiketAI' && <BlinkingDot />}
                            </div>
                        </div>
                    ))}
                    <div className="flex justify-center items-center mt-0">
                        {updateMessage || "***"}
                    </div>
                </>
                <div className="p-4 bg-white dark:bg-black">
                    <form onSubmit={handleSubmit} className="flex">
                        <textarea
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message to QwiketAI"
                            className="flex-grow p-2 border rounded-lg mr-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-black"
                            rows={3}
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <FaPaperPlane />
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ChatsComponent;
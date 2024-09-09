'use client';
import React, { useState, useRef, useEffect, startTransition, useCallback } from "react";
import useSWR from 'swr';
import { useAppContext } from '@lib/context';

import { Chat, Message } from "@lib/types/chat";
import { actionChat, actionChatName, actionCreateChat, actionLoadLatestChat, CreateChatProps } from "@lib/fetchers/chat";
import ReactMarkdown from 'react-markdown';
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
    // const [chatSelected, setChatSelected] = useState<boolean>(false);

    const createChatKey: CreateChatKey = { type: "create-chat", chatUUId: chatUUId, league, teamid, athleteUUId, fantasyTeam: false };
    const { data: loadedChat, error: loadedChatError, isLoading: isLoadingChat } = useSWR(createChatKey, actionLoadLatestChat, { fallback });

    useEffect(() => {
        setIsLoading(isLoadingChat);
    }, [isLoadingChat]);

    const update = useCallback((message: string) => {
        setUpdateMessage(message);
        setTimeout(() => {
            setUpdateMessage('waiting for response...');
            setTimeout(() => {
                setUpdateMessage('');
            }, 2000);
        }, 2000);
    }, []);

    const userRequest = useCallback(() => {

        if (!userInput.trim()) return;
        const newMessage: Message = {
            role: 'user',
            content: userInput
        };
        update('Loading...');

        console.log("messages", messages);
        setUserInput('');
        setIsLoading(true);
        setResponse('');
        responseSetRef.current = false; // Reset the ref when a new request is made

        // Add a placeholder message for the assistant response
        const assistantMessage: Message = {
            role: 'QwiketAI',
            content: ''
        };
        setMessages(prevMessages => [...prevMessages, newMessage, assistantMessage]);

        setPendingUserRequest(false);
        actionUserRequest({
            chatUUId,
            userRequest: userInput,
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

    }, [chatUUId, userInput, athleteUUId, teamid, league, isFantasyTeam])

    useEffect(() => {
        if (chatUUId && pendingUserRequest) {
            setPendingUserRequest(false);
            userRequest();
        }
    }, [chatUUId, pendingUserRequest]);

    useEffect(() => {
        console.log("useEffectloadedChatData", loadedChat);
        if (loadedChat && !loadedChatError && !isLoadingChat && loadedChat.success) {
            console.log("GOT loadedChat.chat.chatUUId", loadedChat.chat.chatUUId)
            setChatUUId(loadedChat.chat.chatUUId);
            if (loadedChat.chat.messages) {
                setMessages(loadedChat.chat.messages);
            }

            console.log("loadedChat.chat.name", loadedChat.chat.name)
            if (loadedChat.chat.name?.includes("ChatGPT")) {
                setChatName(loadedChat.chat.name?.replace("ChatGPT", "QwiketAI") || 'New Chat');
            } else {
                setChatName(loadedChat.chat.name || 'New Chat');
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
        e.preventDefault();

        try {
            if (!chatUUId) {
                setPendingUserRequest(true);
                console.log("==> actionCreateChat:", "teamid", teamid, "league", league, "athleteUUId", athleteUUId, "isFantasyTeam", isFantasyTeam)
                actionCreateChat({ teamid, league, athleteUUId, fantasyTeam: isFantasyTeam || false }).then(
                    (chatUUId) => {
                        console.log("=============> chat createdchatUUId", chatUUId)
                        setChatUUId((prev) => { // this will trigger useEffect to call userRequest
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
        return <><br /><h2 className="text-xl font-bold">Please select a league first.</h2></>;
    }

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-black">
            {false && (
                <div className="flex justify-center items-center mt-4">
                    Loading Chat...
                </div>
            )}

            <div className="p-4">
                <div className="flex  items-center mb-4">
                    <button
                        onClick={() => setOpenMyChats(!openMyChats)}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        {openMyChats ? <FaChevronUp /> : <FaChevronDown />}
                    </button>
                    <h1 className="ml-4 text-xl font-bold text-gray-800 dark:text-gray-200">{chatName}</h1>
                    <span className="text-gray-600 dark:text-gray-400"></span>
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
                        console.log("message", message),
                        <div key={message.content} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-2xl ${message.role === 'user'
                                ? 'bg-blue-100 dark:bg-blue-700'
                                : 'bg-gray-100 dark:bg-gray-700'
                                } text-gray-800 dark:text-gray-200`}>
                                <p className="font-semibold mb-1">{message.role === 'user' ? 'You' : 'QwiketAI'}</p>
                                <ReactMarkdown>{message.content}</ReactMarkdown>
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
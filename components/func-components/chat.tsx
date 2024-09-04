'use client';
import React, { useState, useRef, useEffect, startTransition } from "react";
import useSWR from 'swr';
import { useAppContext } from '@lib/context';
import LoadMore from "@components/func-components/load-more";
import { IoAddCircleOutline } from 'react-icons/io5';
import { Chat, Message } from "@lib/types/chat";
import { actionChat, actionChatName, actionCreateChat, actionLoadLatestChat, CreateChatProps } from "@lib/fetchers/chat";
import ReactMarkdown from 'react-markdown';
import { FaPaperPlane, FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Added chevron icons
import { actionUserRequest } from "@lib/actions/user-request";
import MyChats from "@components/func-components/mychats";
import { MyChatsKey, CreateChatKey } from "@lib/keys";

interface Props {
    chat?: Chat;
    isFantasyTeam?: boolean;
}

const ChatsComponent: React.FC<Props> = ({
    chat: chatProp,
    isFantasyTeam
}) => {
    const { fallback, mode, isMobile, noUser, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, teamid, player, teamName, setTeamName, athleteUUId } = useAppContext();
    console.log(`==> chat`, { teamName, league, teamid, player, athleteUUId });
    const [response, setResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userInput, setUserInput] = useState<string>('');
    const responseTextareaRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>(chatProp?.messages || []);
    const responseSetRef = useRef(false); // Add a ref to track if response has been set
    const [chat, setChat] = useState<Chat | null>(chatProp || null);
    const [chatName, setChatName] = useState<string>(chatProp?.name || 'New Chat');
    const [openMyChats, setOpenMyChats] = useState<boolean>(false);

    const createChatKey: CreateChatKey = { type: "create-chat", league, teamid, athleteUUId, fantasyTeam: false };
    console.log("createChatKey", createChatKey)
    console.log("fallback", fallback)
    const { data: loadedChat, error: loadingChatError, isLoading: isLoadingChat } = useSWR(createChatKey, actionLoadLatestChat, { fallback });

    useEffect(() => {
        if (loadedChat) {
            setChat(loadedChat.chat);
            setMessages(loadedChat.chat.messages || []);
            console.log("loadedChat.chat.name", loadedChat.chat.name)
            if (loadedChat.chat.name?.includes("ChatGPT")) {
                setChatName(loadedChat.chat.name?.replace("ChatGPT", "QwiketAI") || '');
            } else {
                setChatName(loadedChat.chat.name || '');
            }
        }
    }, [loadedChat]);

    useEffect(() => {
        console.log("chatName", chatName)
        if (chatName?.includes("ChatGPT")) {
            setChatName(chatName?.replace("ChatGpt", "QwiketAI") || '');
        } else {
            setChatName(chatName || '');
        }
    }, [chatName])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;
        const newMessage: Message = {
            role: 'user',
            content: userInput
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setUserInput('');
        setIsLoading(true);
        setResponse('');
        responseSetRef.current = false; // Reset the ref when a new request is made

        // Add a placeholder message for the assistant response
        const assistantMessage: Message = {
            role: 'QwiketAI',
            content: ''
        };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);
        console.log(`==> calling user request`, chat?.chatUUId, messages);

        try {
            const response = await actionUserRequest({
                chatUUId: chat?.chatUUId || "",
                userRequest: userInput,
                athleteUUId: athleteUUId,
                teamid: teamid,
                league: league,
                fantasyTeam: isFantasyTeam || false,
                onUpdate: (content: string) => {
                    setResponse(prev => {
                        const updatedContent = prev + content;
                        setMessages(prevMessages => {
                            const updatedMessages = [...prevMessages];
                            updatedMessages[updatedMessages.length - 1].content = updatedContent;
                            return updatedMessages;
                        });
                        return updatedContent;
                    });
                },
                onDone: () => {
                    setIsLoading(false);
                    actionChatName({ chatUUId: chat?.chatUUId || "" }).then(
                        (data) => {
                            if (data.success) {
                                setChatName(data.chatName);
                            }
                        }
                    );
                }
            });

        } catch (error) {
            console.error('Error user-request chat:', error);
            setResponse('Error calling user-request chat. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

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

    return (
        <div className="flex flex-col h-full w-full bg-white dark:bg-black">
            {!chat && (
                <div className="flex justify-center items-center mt-4">
                    Loading Chat...
                </div>
            )}
            {chat && (
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
                                setChat(null);
                                setMessages([]);
                                //  setChatName('New Chat');
                                setOpenMyChats(false);
                                setIsLoading(true);
                                console.log("selectedChatUUId", selectedChatUUId)
                                const newChat = await actionChat({ type: "chat", chatUUId: selectedChatUUId });
                                setIsLoading(false);
                                setChat(newChat);
                                setMessages(newChat.messages || []);
                                setChatName(newChat.name || 'New Chat');
                                setOpenMyChats(false);
                            }}
                            onNewChat={async () => {
                                // Handle new chat creation
                                setChat(null);
                                setMessages([]);
                                setChatName('New Chat');
                                setOpenMyChats(false);
                                setIsLoading(true);
                                const newChat = await actionCreateChat({ teamid, league, athleteUUId, fantasyTeam: isFantasyTeam || false });
                                setChat(newChat);
                                setMessages(newChat.messages || []);
                                setChatName(newChat.name || 'New Chat');
                                setIsLoading(false);
                            }}
                            onFirstChat={(firstChat) => {
                                // Handle first chat selection if needed
                            }}
                        />
                    )}

                </div>
            )}

            <div className="p-4">
                {chat && (
                    <>
                        {messages.map((message, index) => (
                            <div key={index} className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] p-3 rounded-2xl ${message.role === 'user'
                                    ? 'bg-blue-100 dark:bg-blue-700'
                                    : 'bg-gray-100 dark:bg-gray-700'
                                    } text-gray-800 dark:text-gray-200`}>
                                    <p className="font-semibold mb-1">{message.role === 'user' ? 'You' : 'QwiketAI'}</p>
                                    <ReactMarkdown>{message.content}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-center items-center mt-4">
                                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {chat && (
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
            )}
        </div>
    );
};

export default ChatsComponent;
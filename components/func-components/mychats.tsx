'use client';
import React, { useEffect } from "react";
import { useAppContext } from '@lib/context';
import LoadMore from "@components/func-components/load-more";
import { IoAddCircleOutline } from 'react-icons/io5';
import { MyChatsKey } from "@/lib/keys";
import useSWRInfinite from "swr/infinite";
import { actionMyChats } from "@/lib/fetchers/mychats";
import { ChatItem } from "@/lib/types/chat";

interface Props {
    onChatSelect: (chat: any) => void;
    onNewChat: () => void; // Add this line
    onFirstChat: (chat: ChatItem) => void;
}

let lastMutate = 0;

const ChatsComponent: React.FC<Props> = ({
    onChatSelect,
    onNewChat, // Add this line
    onFirstChat,
}) => {
    const { fallback, league, teamid, athleteUUId } = useAppContext();

    const fetchMyChatsKey = (pageIndex: number, previousPageData: ChatItem[]): MyChatsKey | null => {
        // If there's no previous data and it's the first page, return the key
        if (pageIndex === 0) return { type: "fetch-mychats", page: 0, league, teamid, athleteUUId };

        // If the previous request returned less than 5 items, we've reached the end
        if (previousPageData && previousPageData.length < 5) return null;

        // Otherwise, return the key for the next page
        return { type: "fetch-mychats", page: pageIndex, league, teamid, athleteUUId };
    };

    const { data, mutate, size, setSize, isLoading } = useSWRInfinite(fetchMyChatsKey, actionMyChats, { fallback });
    console.log(`==> raw data`, { data, size, isLoading });
    let chats: ChatItem[] = data ? ([] as ChatItem[]).concat(...(data as ChatItem[][])) : [];
    console.log(`==> chats`, chats);
    useEffect(() => {
        if (chats.length > 0) {
            onFirstChat(chats[0]);
        }
    }, [chats, onFirstChat]);

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (Date.now() - lastMutate > 60 * 1000 && (window.scrollY === 0)) {
                lastMutate = Date.now();
                mutate();
            }
        }, 20 * 1000); // Check every 20 secs

        return () => clearInterval(intervalId);
    }, [mutate]);

    useEffect(() => {
        const listener = () => {
            if (window.scrollY === 0) {
                if (lastMutate < Date.now() - 1000) {
                    mutate();
                }
                lastMutate = Date.now();
            }
        };

        function debounce(callbackFn: any, delay: number) {
            let timeoutId: NodeJS.Timeout | null = null;
            return function () {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(() => {
                    callbackFn.call();
                }, delay);
            };
        }

        window.addEventListener("scroll", debounce(listener, 100));
        return () => window.removeEventListener("scroll", listener);
    }, [mutate]);

    const isLoadingMore = isLoading;
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 5);

    // Group chats by groupName
    const groupedChats = chats.reduce((acc, chat) => {
        (acc[chat.groupName] = acc[chat.groupName] || []).push(chat);
        return acc;
    }, {} as Record<string, ChatItem[]>);

    const ChatGroups = Object.entries(groupedChats).map(([groupName, groupChats]) => (
        <div key={groupName} className="mb-4">
            <h3 className="text-sm font-semibold text-gray-500 mb-2">{groupName}</h3>
            {groupChats.map((chat) => (
                <div
                    key={chat.chatUUId}
                    onClick={() => onChatSelect(chat.chatUUId)}
                    className="w-full p-3 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer rounded-lg transition-colors duration-200"
                >
                    <div className="text-sm font-medium">{chat.name}</div>
                </div>
            ))}
        </div>
    ));

    return (
        <div className="h-full flex flex-col">

            {!ChatGroups.length && <div className="text-sm text-gray-500">No chat history yet...</div>}

            <div className="flex-grow p-4">
                {ChatGroups}
            </div>
            {false && <div className="p-4">
                <LoadMore
                    items={chats}
                    name="chats"
                    setSize={setSize}
                    size={size}
                    isLoadingMore={isLoadingMore || false}
                    isReachingEnd={isReachingEnd || false}
                />
            </div>}
        </div>
    );
};

export default ChatsComponent;
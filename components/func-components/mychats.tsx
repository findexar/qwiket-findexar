'use client';
import React from "react";
import { useAppContext } from '@lib/context';
import LoadMore from "@components/func-components/load-more";
import { IoAddCircleOutline } from 'react-icons/io5';

interface Props {
    chats: any[];
    setSize: (size: number | ((_size: number) => number)) => Promise<any[] | undefined>;
    size: number;
    error: any;
    isValidating: boolean;
    isEmpty: boolean;
    isReachingEnd: boolean;
    isLoadingMore: boolean;
    mutate: any;
    mutateChats?: any;
    onChatSelect: (chat: any) => void;
    onNewChat: () => void;
}

const ChatsComponent: React.FC<Props> = ({
    chats,
    setSize,
    size,
    error,
    isValidating,
    isEmpty,
    isReachingEnd,
    isLoadingMore,
    mutate,
    mutateChats,
    onChatSelect,
    onNewChat
}) => {
    const { view } = useAppContext();

    const Chats = chats?.map((chat, index) => (
        <div
            key={index}
            onClick={() => onChatSelect(chat)}
            className="w-full p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-colors duration-200"
        >
            <div className="text-sm font-medium">{chat.name}</div>
        </div>
    ));

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-xl font-semibold">Chats</h2>
                <button
                    onClick={onNewChat}
                    className="p-2 rounded-full hover:bg-gray-100 transition-colors duration-200"
                >
                    <IoAddCircleOutline className="w-6 h-6 text-gray-600" />
                </button>
            </div>
            <div className="flex-grow overflow-y-auto">
                {Chats}
            </div>
            <div className="p-4">
                <LoadMore
                    items={chats}
                    name="chats"
                    setSize={setSize}
                    size={size}
                    isLoadingMore={isLoadingMore || false}
                    isReachingEnd={isReachingEnd || false}
                />
            </div>
        </div>
    );
};

export default ChatsComponent;
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
import { HiOutlinePencilAlt } from "react-icons/hi";

interface Props {
    chatUUId?: string;
    isFantasyTeam?: boolean;
}

const AccountUpgrade: React.FC<Props> = ({
    chatUUId: chatUUIdProp,
    isFantasyTeam
}) => {
    const { fallback, mode, isMobile, noUser, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, teamid, player, teamName, setTeamName, athleteUUId } = useAppContext();
    return (
        <div>
            <h1>Account Upgrade</h1>
        </div>
    );
};

export default AccountUpgrade;
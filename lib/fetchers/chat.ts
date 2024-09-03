'use server';
import { unstable_serialize } from 'swr'
import { ChatKey } from '@/lib/keys';
import { auth, currentUser } from "@clerk/nextjs/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { Chat, ContextInput } from "@/lib/types/chat";
import { cookies } from "next/headers";

const api_key = process.env.LAKE_API_KEY;
export const fetchChat = async (key: ChatKey, userId: string, sessionid: string): Promise<Chat> => {
    'use server';
    try {
        const { chatUUId = '' } = key;
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/load?api_key=${api_key}&userid=${userId || ""}&chatUUId=${chatUUId}&sessionid=${sessionid}`;
        console.log("fetching chat", url);
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        console.log("return fetching chat", url, data);
        if (data.success) {
            console.log("===>GET CHAT", data.chat);
            return data.chat as Chat;
        }
        throw new Error("Failed to fetchChat");
    }
    catch (e) {
        console.log("fetchChat", e);
        throw new Error("Failed to fetchChat");
    }
}

const promiseChat = async (key: ChatKey, userId: string, sessionid: string) => {
    'use server';
    return { key: unstable_serialize(key), call: fetchChat(key, userId, sessionid) };
}
export const actionChat = async (key: ChatKey): Promise<Chat> => {
    'use server';
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid;

    if (!userId) {
        return {} as Chat;
    }
    return fetchChat(key, userId, sessionid);
}

export interface CreateChatProps {
    league?: string;
    teamid?: string;
    athleteUUId?: string;
    fantasyTeam?: boolean;
    //@TODO add multi-athlete
}
const createChat = async (props: CreateChatProps, userId: string, sessionid: string): Promise<{ success: boolean, chat: Chat, error: string }> => {
    'use server';
    const { athleteUUId, teamid, league, fantasyTeam = false } = props;
    console.log("****** createChat", props)
    userId = userId || sessionid;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/create?api_key=${api_key}&userid=${userId}&sessionid=${sessionid}`;
    console.log("createChat", url);
    let contextInputs: ContextInput[] = [];
    if (athleteUUId) {
        contextInputs.push({
            "scope": 'Athlete',
            "type": 'IncludeMentions',
            "athleteUUId": "self",
        });
    }
    else if (teamid) {
        contextInputs.push({
            "scope": 'Team',
            "type": 'IncludeMentions',
            "teamid": "self",
        });
    }
    else if (league) {
        contextInputs.push({
            "scope": 'League',
            "type": 'IncludeMentions',
            "league": "self",
        });
    }
    else {
        contextInputs.push({
            "scope": 'All',
            "type": 'IncludeMentions',
        });
    }
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            athleteUUId,
            teamid,
            league,
            fantasyTeam,
            contextInputs
        }),
    });

    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await res.json();
    console.log("RET create chat:", data.success)
    return { success: data.success, chat: data.chat, error: data.error };
}

export const actionCreateChat = async (props: CreateChatProps) => {
    'use server';
    console.log("actionCreateChat", props)
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId = "" } = auth() || {};
    const sessionid = session.sessionid || "";
    return createChat(props, userId || "", sessionid);
}

interface ChatNameProps {
    chatUUId: string;
}
const chatName = async (props: ChatNameProps, userId: string, sessionid: string) => {
    const { chatUUId } = props;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/chat-name?api_key=${api_key}&userid=${userId}&sessionid=${sessionid}&chatUUId=${chatUUId}`;
    console.log("chatName url", url);
    const fetchResponse = await fetch(url);
    const data = await fetchResponse.json();
    console.log("return chatName", url, data);
    return data;
}

export const actionChatName = async (props: ChatNameProps) => {
    'use server';
    console.log("actionChatName", props)
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId = "" } = auth() || {};
    const sessionid = session.sessionid || "";
    return chatName(props, userId || "", sessionid);
}



export default promiseChat;

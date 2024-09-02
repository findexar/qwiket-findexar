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
    const { athleteUUId, teamid, league, fantasyTeam = false } = props;
    userId = userId || sessionid;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/create?api_key=${api_key}&userid=${userId}&sessionid=${sessionid}`;

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
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId = "" } = auth() || {};
    const sessionid = session.sessionid || "";
    return createChat(props, userId || "", sessionid);
}

export interface UserRequestProps {
    league?: string;
    teamid?: string;
    athleteUUId?: string;
    fantasyTeam?: boolean;
    userRequest: string;
    onUpdateContent: (content: string) => void;
    onDone: () => void;
}

const userRequest = async (props: UserRequestProps, userId: string, sessionid: string) => {
    const { athleteUUId, teamid, league, fantasyTeam = false, userRequest, onUpdateContent, onDone } = props;
    userId = userId || sessionid;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/user-request?api_key=${api_key}&userid=${userId}&sessionid=${sessionid}`;
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
            contextInputs,
            userRequest
        }),
    });

    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    const reader = res.body?.getReader();
    if (!reader) {
        throw new Error('Failed to get reader from response');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            if (line.trim() === 'data: [DONE]') {
                console.log('data: [DONE] received');
                onDone();
                return;
            } else if (line.startsWith('data: ')) {
                console.log('data: content received');
                try {
                    const jsonData = JSON.parse(line.slice(5));
                    if (jsonData.content) {
                        onUpdateContent(jsonData.content);
                    }
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
            }
        }
        const data = await res.json();
        console.log("RET create chat:", data.success)
        return { success: data.success, chat: data.chat, error: data.error };
    }
}

export const actionUserRequest = async (props: UserRequestProps) => {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId = "" } = auth() || {};
    const sessionid = session.sessionid || "";
    return userRequest(props, userId || "", sessionid);
}

export default promiseChat;

'use server';
import { unstable_serialize } from 'swr'
import { MyChatsKey } from '@/lib/keys';
import { auth, currentUser } from "@clerk/nextjs/server";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { Chat } from "@/lib/types/chat";
import { cookies } from "next/headers";
const api_key = process.env.LAKE_API_KEY;
export const fetchMyChats = async (key: MyChatsKey, userId: string, sessionid: string, page: number): Promise<Chat[]> => {
    try {
        const { league = '', teamid = '', athleteUUId = '' } = key;
        let url = '';

        url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/fetch-chats?api_key=${api_key}&userid=${userId || ""}&league=${league}&teamid=${teamid}&athleteUUId=${athleteUUId}&sessionid=${sessionid}&page=${page}`;
        console.log("fetching my chats", url);
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        console.log("return fetching my chats", url, data);
        if (data.success) {
            console.log("===>GET MY CHATS", data.chats);
            return data.chats as Chat[];
        }
        throw new Error("Failed to fetchMyChats");
    }
    catch (e) {
        console.log("fetchMyChats", e);
        throw new Error("Failed to fetchMyChats");
    }
}

const promiseMyChats = async (key: MyChatsKey, userId: string, sessionid: string) => {
    return { key: unstable_serialize(key), call: fetchMyChats(key, userId, sessionid, 0) };
}
export const actionMyChats = async (key: MyChatsKey): Promise<Chat[]> => {
    'use server';
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid;

    if (!userId) {
        return [];
    }
    return fetchMyChats(key, userId, sessionid, 0);
}
export default promiseMyChats;

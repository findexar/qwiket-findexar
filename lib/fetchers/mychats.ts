'use server';
import { unstable_serialize } from 'swr'
import { auth } from "@clerk/nextjs/server";
import fetchSession from "./session";
import { ChatItem } from "@/lib/types/chat";
import { MyChatsKey } from "@/lib/keys";
const api_key = process.env.LAKE_API_KEY;
export const fetchMyChats = async (key: MyChatsKey, userId: string, sessionid: string): Promise<ChatItem[]> => {
    try {
        const { league = '', teamid = '', athleteUUId = '', page = 0 } = key;
        let url = '';

        url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/fetch-chats?api_key=${api_key}&userid=${userId || ""}&league=${league}&teamid=${teamid}&athleteUUId=${athleteUUId}&sessionid=${sessionid}&page=${page}`;
        //  console.log("fetching my chats", url);
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        // console.log("return fetching my chats", url, data);
        if (data.success) {
            // console.log("===>GET MY CHATS", data.chats);
            return data.chats as ChatItem[];
        }
        throw new Error("Failed to fetchMyChats");
    }
    catch (e) {
        console.log("fetchMyChats", e);
        throw new Error("Failed to fetchMyChats");
    }
}

const promiseMyChats = async (key: MyChatsKey, userId: string, sessionid: string) => {
    return { key: unstable_serialize(key), call: fetchMyChats(key, userId, sessionid) };
}
export const actionMyChats = async (key: MyChatsKey): Promise<ChatItem[]> => {
    'use server';
    const session = await fetchSession();
    const sessionid = session.sessionid;
    let { userId } = auth() || { userId: "" };
    if (!userId) {
        userId = sessionid;
    }
    return fetchMyChats(key, userId, sessionid);
}
export default promiseMyChats;

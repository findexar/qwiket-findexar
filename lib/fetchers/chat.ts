'use server';
import { unstable_serialize } from 'swr'
import { ChatKey, CreateChatKey, FetchUserDocumentsKey } from '@/lib/keys';
import { auth, currentUser } from "@clerk/nextjs/server";
import fetchSession from "@/lib/fetchers/session";
import { Chat, UserDocument, UserDocuments } from "@/lib/types/chat";


const api_key = process.env.LAKE_API_KEY;
export const deleteUploadedDocument = async (uuid: string, userid: string, sessionid: string): Promise<boolean> => {
    'use server';
    try {
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/delete-uploaded-document?api_key=${api_key}&userid=${userid}&sessionid=${sessionid}&uuid=${uuid}`;
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        return data.success;
    }
    catch (e) {
        console.log("deleteUploadedDocument", e);
        throw new Error("Failed to deleteUploadedDocument");
    }
}
export const saveUploadedDocument = async (document: UserDocument, userid: string, sessionid: string, chatUUId: string): Promise<boolean> => {
    'use server';
    try {
        const { uuid, title, name, description, type: document_type } = document;
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/save-uploaded-document?api_key=${api_key}&userid=${userid}&sessionid=${sessionid}&uuid=${uuid}&title=${title}&name=${name}&description=${description}&document_type=${document_type}&chatUUId=${chatUUId}`;
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        return data.success;
    }
    catch (e) {
        console.log("saveUploadedDocument", e);
        throw new Error("Failed to saveUploadedDocument");
    }
}
export const saveChatDocuments = async (uuids: string, chatUUId: string): Promise<boolean> => {
    'use server';
    try {
        if (!uuids || !chatUUId) {
            return false;
        }
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/save-chat-documents?api_key=${api_key}&chatUUId=${chatUUId}&uuidsString=${uuids}`;
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        return data.success;
    }
    catch (e) {
        console.log("saveChatDocuments", e);
        throw new Error("Failed to saveChatDocuments");
    }
}
export const flipCreatorMode = async (creator: boolean, chatUUId: string, userId: string, sessionid: string): Promise<boolean> => {
    'use server';
    try {
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/flip-creator-chat?api_key=${api_key}&userid=${userId}&sessionid=${sessionid}&creator=${creator}&chatUUId=${chatUUId}`;
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        return data.success;
    }
    catch (e) {
        console.log("flipCreatorMode", e);
        throw new Error("Failed to flipCreatorMode");
    }
}



export const fetchUserDocuments = async (key: FetchUserDocumentsKey, userId: string, sessionid: string): Promise<UserDocuments> => {
    'use server';
    try {
        const { chatUUId = '' } = key;
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/fetch-user-documents?api_key=${api_key}&userid=${userId}&sessionid=${sessionid}&chatUUId=${chatUUId}`;
        console.log("fetchUserDocuments", url);
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        console.log("fetchUserDocuments return:", JSON.stringify(data, null, 2));
        if (data.success) {
            // console.log("===>GET CHAT", data.chat);
            return data.documents as UserDocuments;
        }
        throw new Error("Failed to fetchUserDocuments");
    }
    catch (e) {
        console.log("fetchUserDocuments", e);
        throw new Error("Failed to fetchUserDocuments");
    }
}
export const fetchChat = async (key: ChatKey, userId: string, sessionid: string): Promise<Chat> => {
    'use server';
    try {
        const { chatUUId = '' } = key;
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/load?api_key=${api_key}&userid=${userId || ""}&chatUUId=${chatUUId}&sessionid=${sessionid}`;
        // console.log("fetching chat", url);
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        // console.log("return fetching chat", url, data);
        if (data.success) {
            // console.log("===>GET CHAT", data.chat);
            return data.chat as Chat;
        }
        throw new Error("Failed to fetchChat");
    }
    catch (e) {
        console.log("fetchChat", e);
        throw new Error("Failed to fetchChat");
    }
}


export const actionChat = async (key: ChatKey): Promise<Chat> => {
    'use server';
    const session = await fetchSession();

    const { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid;

    if (!userId) {
        return {} as Chat;
    }
    return fetchChat(key, userId, sessionid);
}
export const actionUserDocuments = async (key: FetchUserDocumentsKey): Promise<UserDocuments> => {
    'use server';
    const session = await fetchSession();

    const { userId } = auth();
    const sessionid = session.sessionid || "";
    return fetchUserDocuments(key, userId || "", sessionid);
}
export const actionDeleteUploadedDocument = async (uuid: string): Promise<boolean> => {
    'use server';
    const session = await fetchSession();

    const { userId } = auth();
    const sessionid = session.sessionid || "";
    return deleteUploadedDocument(uuid, userId || "", sessionid);
}
export const actionFlipCreatorMode = async (creator: boolean, chatUUId: string): Promise<boolean> => {
    'use server';
    if (!chatUUId) {
        return false;
    }
    const session = await fetchSession();

    const { userId } = auth();
    const sessionid = session.sessionid || "";
    return flipCreatorMode(creator, chatUUId, userId || "", sessionid);
}
export const actionSaveUploadedDocument = async (document: UserDocument, chatUUId: string): Promise<boolean> => {
    'use server';
    const session = await fetchSession();

    const { userId } = auth();
    const sessionid = session.sessionid || "";
    return saveUploadedDocument(document, userId || "", sessionid, chatUUId);
}
export interface CreateChatProps {
    league?: string;
    teamid?: string;
    athleteUUId?: string;
    insider?: boolean;
    fantasyTeam?: boolean;
    styleDocument?: string;
    dataDocumentsString?: string;
    creator?: boolean;
}
const createChat = async (props: CreateChatProps, userId: string, sessionid: string): Promise<String> => {
    'use server';
    const { athleteUUId, teamid, league, fantasyTeam = false, insider = false, styleDocument = "", dataDocumentsString = "", creator = false } = props;
    //  console.log("****** createChat", props)
    userId = userId || sessionid;
    const insiderParam = insider ? '1' : '0';
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/create?api_key=${api_key}&userid=${userId}&sessionid=${sessionid}&insider=${insiderParam}&styleDocument=${styleDocument}&dataDocumentsString=${dataDocumentsString}&creator=${creator ? '1' : '0'}`;
    // console.log("createChat", url);

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
        }),
    });

    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await res.json();
    //console.log("RET create chat:", JSON.stringify({ success: data.success, chatUUId: data.chatUUId, error: data.error }, null, 2))
    return data.success ? data.chatUUId as string : 'blocked';
}
export const actionCreateChat = async (props: CreateChatProps) => {
    'use server';
    console.log("actionCreateChat", props)
    const session = await fetchSession();

    //let session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId = "" } = auth() || {};

    const sessionid = session.sessionid || "";

    //console.log("=================>>>>>>actionCreateChat", { userId, sessionid, session })
    return createChat(props, userId || "", sessionid);
}

const loadLatestChat = async (props: CreateChatKey, userId: string, sessionid: string): Promise<{ success: boolean, chat: Chat, error: string }> => {
    'use server';
    const { chatUUId, athleteUUId, teamid, league, fantasyTeam = false, email } = props;
    // email is to break the SWR cache when the user switches accounts
    if (chatUUId == "_new") {
        return { success: false, chat: {} as Chat, error: '' };
    }

    //console.log("****** loadLatestChat", props)
    userId = userId || sessionid;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/load-latest?api_key=${api_key}&userid=${userId}&sessionid=${sessionid}`;

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
            chatUUId,
        }),
    });

    if (!res.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await res.json();
    if (!data.success) {
        // console.log("RET loadLatestChat:", data)
        // throw new Error('Failed to loadLatestChat');
        console.log("NULL RET loadLatestChat:", data.error)
        return { success: false, chat: {} as Chat, error: data.error || 'Failed to loadLatestChat' };
    }
    // console.log("RET loadLatestChat:", { success: true, chat: data.chat, error: '' })
    return { success: true, chat: data.chat, error: '' };
}

export const actionLoadLatestChat = async (key: CreateChatKey) => {
    'use server';
    const session = await fetchSession();
    const { userId = "" } = auth() || {};
    const sessionid = session.sessionid || "";
    // console.log("!!!! actionLoadLatestChat", key, userId, sessionid)
    return await loadLatestChat(key, userId || "", sessionid);
}
interface ChatNameProps {
    chatUUId: string;
}
const chatName = async (props: ChatNameProps, userId: string, sessionid: string) => {
    const { chatUUId } = props;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/chat-name?api_key=${api_key}&userid=${userId}&sessionid=${sessionid}&chatUUId=${chatUUId}`;
    //  console.log("chatName url", url);
    const fetchResponse = await fetch(url);
    const data = await fetchResponse.json();
    // console.log("return chatName", url, data);
    return data;
}

export const actionChatName = async (props: ChatNameProps) => {
    'use server';
    // console.log("actionChatName", props)
    const session = await fetchSession();
    const { userId = "" } = auth() || {};
    const sessionid = session.sessionid || "";
    return chatName(props, userId || "", sessionid);
}

const promiseCreateChat = async (key: CreateChatKey, userId: string, sessionid: string) => {
    'use server';
    //  console.log("promiseCreateChat", key, userId, sessionid)
    let ret = { key: unstable_serialize(key), call: loadLatestChat(key, userId, sessionid) };
    // console.log("AFTER promiseCreateChat", key, userId, sessionid)
    return ret;
}

export const promiseUserDocuments = async (key: FetchUserDocumentsKey, userId: string, sessionid: string) => {
    'use server';
    let ret = { key: unstable_serialize(key), call: fetchUserDocuments(key, userId, sessionid) };
    return ret;
}

export default promiseCreateChat;

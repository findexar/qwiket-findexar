'use server';
import { unstable_serialize } from 'swr'
import { auth, currentUser } from "@clerk/nextjs/server";
import fetchSession from './session';

const api_key = process.env.LAKE_API_KEY;

export type Notification = {
    xid: number;
    text: string;
    type: string;
    dismissed: boolean;
    removed: boolean;
};

export type NotificationsKey = {
    includeRemoved?: boolean;
    page?: number;
    limit?: number;
};

export const fetchNotifications = async (key: NotificationsKey, userId: string, sessionid: string): Promise<{ notifications: Notification[], hasMore: boolean }> => {
    'use server';
    try {
        const { includeRemoved = false, page = 1, limit = 20 } = key;

        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/get-notifications?api_key=${api_key}&userid=${userId || ""}&sessionid=${sessionid}&includeRemoved=${includeRemoved}&page=${page}&limit=${limit}`;
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        // console.log("fetchNotifications", data);
        if (data.success) {
            return {
                notifications: data.notifications as Notification[],
                hasMore: data.notifications.length === limit
            };
        }
        throw new Error("Failed to fetchNotifications");
    }
    catch (e) {
        console.log("fetchNotifications", e);
        throw new Error("Failed to fetchNotifications");
    }
}

export const actionNotifications = async (key: NotificationsKey): Promise<Notification[]> => {
    'use server';
    const session = await fetchSession();

    let { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid;
    if (!userId) {
        userId = "";
    }

    return fetchNotifications(key, userId, sessionid).then(({ notifications }) => notifications);
}

export const upsertNotification = async (notification: Notification): Promise<number | null> => {
    'use server';
    const session = await fetchSession();
    let { userId } = auth() || { userId: "" };
    const adminSessionid = session.sessionid;

    try {
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/upsert-notification`;
        const fetchResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ...notification,
                admin_userid: userId,
                admin_sessionid: adminSessionid,
                api_key
            }),
        });
        const data = await fetchResponse.json();
        if (data.success) {
            return data.xid;
        }
        throw new Error(data.message || "Failed to upsert notification");
    } catch (e) {
        console.log("upsertNotification", e);
        return null;
    }
}

export const dismissNotification = async (xid: number): Promise<boolean> => {
    'use server';
    const session = await fetchSession();
    let { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid;

    try {
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/dismiss-notification`;
        const fetchResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ xid, userid: userId, sessionid, api_key }),
        });
        const data = await fetchResponse.json();
        return data.success;
    } catch (e) {
        console.log("dismissNotification", e);
        return false;
    }
}

export const removeNotification = async (xid: number): Promise<boolean> => {
    'use server';
    const session = await fetchSession();
    let { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid;

    try {
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/remove-notification`;
        const fetchResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ xid, userid: userId, sessionid, api_key }),
        });
        const data = await fetchResponse.json();
        return data.success;
    } catch (e) {
        console.log("removeNotification", e);
        return false;
    }
}

const promiseNotifications = async (key: NotificationsKey, userId: string, sessionid: string) => {
    'use server';
    console.log("promiseNotifications", key, userId, sessionid)
    let ret = { key: unstable_serialize(key), call: fetchNotifications(key, userId, sessionid) };
    console.log("AFTER promiseNotifications", key, userId, sessionid)
    return ret;
}

export default promiseNotifications;

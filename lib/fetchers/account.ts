'use server';
import { unstable_serialize } from 'swr'
import { UserAccountKey, UserUsageAccountKey } from '@/lib/keys';
import { auth, currentUser } from "@clerk/nextjs/server";
import { UserAccount, UserUsage, MonthlyUsage } from "@/lib/types/user";
import fetchSession from './session';

const api_key = process.env.LAKE_API_KEY;

export const fetchUserUsage = async (key: UserUsageAccountKey, userId: string, sessionid: string): Promise<UserUsage> => {
    'use server';
    try {
        const { periods = [] } = key;

        if (!Array.isArray(periods) || periods.length === 0) {
            throw new Error("Invalid periods");
        }

        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/get-user-usage?api_key=${api_key}&userid=${userId || ""}&sessionid=${sessionid}&periods=${encodeURIComponent(JSON.stringify(periods))}`;
        //  console.log("fetching usage", url);
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        console.log("return fetching usage", url, JSON.stringify(data, null, 2));
        if (data.success) {
            return data.usage as UserUsage;
        }
        throw new Error("Failed to fetchUserUsage");
    }
    catch (e) {
        console.log("fetchUserUsage", e);
        throw new Error("Failed to fetchUserUsage");
    }
}

export const fetchUser = async (
    key: UserAccountKey,
    userId: string,
    sessionid: string,
    utm_content: string = "",
    ua: string = "",
    cid: string = "",
    aid: string = ""
): Promise<UserAccount> => {
    'use server';
    try {
        const { email = '', bot = false } = key;
        if (bot) {
            return {
                email: "",
                billingDay: 0,
                type: "bot",
                creditsTotal: 0,
                creditsRemaining: 0,
                extraCreditsTotal: 0,
                extraCreditsRemaining: 0,
                subscriptionType: "",
                subscriptionActive: false,
            }
        }
        // console.log("fetchUser", key, userId, sessionid, utm_content)
        if (!sessionid) {
            console.log("===>FAILED TO GET USER, NO SESSIONID", sessionid);
            return {} as UserAccount;
            // throw new Error("Failed to fetchUser");
        }
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/account/get-user-account?api_key=${api_key}&userid=${userId || ""}&email=${email}&sessionid=${sessionid}&utm_content=${encodeURIComponent(utm_content)}&ua=${encodeURIComponent(ua)}&cid=${encodeURIComponent(cid)}&aid=${encodeURIComponent(aid)}`;
        console.log("fetching user", url);
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        //  console.log("return fetching user", url, data);
        if (data.success) {
            // console.log("===>GET USER", data.account);
            return data.account as UserAccount;
        }
        console.log("===>FAILED TO GET USER", data);
        return {} as UserAccount;
        // throw new Error("Failed to fetchUser");
    }
    catch (e) {
        console.log("fetchUser", e);
        throw new Error("Failed to fetchUser");
    }
}

export const actionUserUsage = async (key: UserUsageAccountKey): Promise<UserUsage> => {
    'use server';
    const session = await fetchSession();

    let { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid;
    if (!userId) {
        userId = "";
    }
    console.log("===>actionUserUsage", key, userId, sessionid)

    return fetchUserUsage(key, userId, sessionid);
}

export const actionUser = async (key: UserAccountKey, utm_content?: string): Promise<UserAccount> => {
    'use server';
    const session = await fetchSession();
    let { userId } = auth() || { userId: "" };
    if (!userId || userId == "null") {
        userId = "";
    }
    const sessionid = session.sessionid;
    console.log("===>actionUser", key, userId, sessionid)
    /*if (!userId) {
        return {} as UserAccount;
    }*/
    return fetchUser(key, userId, sessionid, utm_content);
}

const promiseUser = async (key: UserAccountKey, userId: string, sessionid: string, utm_content?: string, ua?: string, cid?: string, aid?: string) => {
    'use server';
    console.log("promiseUser", key, userId, sessionid, utm_content, ua, cid, aid)
    let ret = { key: unstable_serialize(key), call: fetchUser(key, userId, sessionid, utm_content, ua, cid, aid) };
    console.log("AFTER promiseUser", key, userId, sessionid)
    return ret;
}

export default promiseUser;



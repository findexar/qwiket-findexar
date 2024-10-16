'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { InvitesKey } from '@/lib/keys';
import { auth } from "@clerk/nextjs/server";
import fetchSession from './session';

const lake_api = process.env.NEXT_PUBLIC_LAKEAPI
const api_key = process.env.LAKE_API_KEY;;
interface FetchInvitesProps {
    userId: string;
    sessionid: string;
}

const fetchInvites = async (key: InvitesKey, userId: string, sessionid: string) => {
    const { page } = key;
    const url = `${lake_api}/api/v50/findexar/get-invites?api_key=${api_key}&userid=${userId || ""}&sessionid=${sessionid}&page=${page}`;
    const t1 = Date.now();
    const fetchResponse = await fetch(url);
    const t2 = Date.now();
    const res = await fetchResponse.json();
    return res.invites;
}
export interface UpdateInviteProps {
    cid: string;
    email?: string;
    full_name?: string;
    nickname?: string;
    notes?: string;
}
const updateInvite = async ({ cid, email, full_name, nickname, notes }: UpdateInviteProps, userId: string, sessionid: string) => {
    const url = `${lake_api}/api/v50/findexar/update-invite?api_key=${api_key}&userid=${userId || ""}&sessionid=${sessionid}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            cid,
            email,
            full_name,
            nickname,
            notes,
        }),
    });
    return res.json();
}
const promiseInvites = async ({ userId, sessionid }: FetchInvitesProps) => {

    let keyInvites = (page: any) => {
        const keyFetchedInvites: InvitesKey = { type: "fetch-invites", page: page }
        return keyFetchedInvites;
    };

    return { key: us(keyInvites), call: fetchInvites(keyInvites(0), userId, sessionid) };
}
export const actionInvites = async (key: InvitesKey) => {

    const session = await fetchSession();

    const { userId } = auth() || { userId: "" };

    const sessionid = session.sessionid;
    return fetchInvites(key, userId || "", sessionid);
}
export const actionUpdateInvite = async ({ cid, email, full_name, nickname, notes }: UpdateInviteProps) => {
    const session = await fetchSession();

    const { userId } = auth() || { userId: "" };

    const sessionid = session.sessionid;
    return updateInvite({ cid, email, full_name, nickname, notes }, userId || "", sessionid);
}

export default promiseInvites;

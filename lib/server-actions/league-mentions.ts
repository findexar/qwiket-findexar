'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { LeagueMentionsKey } from '@/lib/keys';

import { auth } from "@clerk/nextjs/server";
import fetchSession from './session';
const lake_api = process.env.NEXT_PUBLIC_LAKEAPI
const api_key = process.env.LAKE_API_KEY;;
interface FetchMentionsProps {
    userId: string;
    sessionid: string;
    league: string;
}

const fetchMentions = async (key: LeagueMentionsKey, userId: string, sessionid: string) => {
    const t1 = new Date().getTime();
    const { league, page } = key;
    const url = `${lake_api}/api/v50/findexar/get-mentions?api_key=${api_key}&userid=${userId || ""}&league=${league}&sessionid=${sessionid}&page=${page}`;
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    const t2 = new Date().getTime();
    //  console.log("==> FETCH MENTIONS TIME", t2 - t1);
    return res.mentions;
}

const promiseLeagueMentions = async ({ userId, sessionid, league }: FetchMentionsProps) => {
    let keyMentions = (page: any) => {
        const keyFetchedLeagueMentions: LeagueMentionsKey = { type: "fetch-league-mentions", page: page, league: league.toUpperCase() }
        return keyFetchedLeagueMentions;
    };
    // console.log("keyMentions", keyMentions(0));
    return { key: us(keyMentions), call: fetchMentions(keyMentions(0), userId, sessionid) };
}
export const actionLeagueMentions = async (key: LeagueMentionsKey) => {

    const session = await fetchSession();
    const { userId } = await auth() || { userId: "" };
    const sessionid = session.sessionid;
    return fetchMentions(key, userId || "", sessionid);
}

export default promiseLeagueMentions;

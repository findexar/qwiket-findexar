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
    const { league, page } = key;
    const url = `${lake_api}/api/v50/findexar/get-mentions?api_key=${api_key}&userid=${userId || ""}&league=${league}&sessionid=${sessionid}&page=${page}`;
    console.log("fetchLeagueMentions", url);
    const fetchResponse = await fetch(url);
    //  console.log("fetchTeamMentions fetchResponse", await fetchResponse.text());
    // const strResponse = await fetchResponse.text();
    //  console.log("fetchTeamMentions JSON strResponse", JSON.parse(strResponse));
    const res = await fetchResponse.json();
    //console.log("fetchTeamMentions res",res);
    return res.mentions;
}

const promiseLeagueMentions = async ({ userId, sessionid, league }: FetchMentionsProps) => {
    console.log("promiseLeagueMentions", userId, sessionid, league);
    let keyMentions = (page: any) => {
        const keyFetchedLeagueMentions: LeagueMentionsKey = { type: "fetch-league-mentions", page: page, league }
        return keyFetchedLeagueMentions;
    };
    console.log("promiseTeamMentions KEY:", keyMentions);
    return { key: us(keyMentions), call: fetchMentions(keyMentions(0), userId, sessionid) };
}
export const actionLeagueMentions = async (key: LeagueMentionsKey) => {

    const session = await fetchSession();
    const { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid;
    return fetchMentions(key, userId || "", sessionid);
}

export default promiseLeagueMentions;

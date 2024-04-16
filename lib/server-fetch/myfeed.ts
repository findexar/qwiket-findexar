'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { FetchMyFeedKey } from '@/lib/keys';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";

const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;
interface FetchMyFeedProps{
    userId:string;
    sessionid:string;
    league:string;
}

const fetchMyFeed=async (key:FetchMyFeedKey,userId:string,sessionid:string)=>{
    const {league, page}=key;
    const url=`${lake_api}/api/v50/findexar/get-my-feed?api_key=${api_key}&userid=${userId || ""}&league=${league}&sessionid=${sessionid}&page=${page}`;
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    return res.mentions;
}

const promiseMyFeed =({userId,sessionid,league}:FetchMyFeedProps)=>{
    let keyMyFeed = (page:number) => {
        const keyFetchMyFeed: FetchMyFeedKey = { type: "FetchMyFeed", page, league}
        return keyFetchMyFeed;
    };
    return { key: us(keyMyFeed), call: fetchMyFeed(keyMyFeed(0),userId,sessionid)};
}
export const actionMyFeed=async (key:FetchMyFeedKey)=>{
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const userId=session.username?session.username:"";
    const sessionid=session.sessionid;
    return fetchMyFeed(key,userId,sessionid);
}
export default promiseMyFeed;
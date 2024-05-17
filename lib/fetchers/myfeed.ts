'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { FetchMyFeedKey } from '@/lib/keys';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";
import { auth } from "@clerk/nextjs/server";

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
    console.log("fetching my feed:",url)
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    return res.mentions;
}

const promiseMyFeed =async ({userId,sessionid,league}:FetchMyFeedProps)=>{
    let keyMyFeed = (page:number) => {
        const keyFetchMyFeed: FetchMyFeedKey = { type: "fetch-my-feed", page, league}
        return keyFetchMyFeed;
    };
    return { key: us(keyMyFeed), call: fetchMyFeed(keyMyFeed(0),userId,sessionid)};
}
export const actionMyFeed=async (key:FetchMyFeedKey)=>{
    'use server';
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId } = auth() || { userId: "" };
    const sessionid=session.sessionid;
    return fetchMyFeed(key,userId||"",sessionid);
}
export default promiseMyFeed;
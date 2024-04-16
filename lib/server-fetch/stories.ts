'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { FetchStoriesKey } from '@/lib/keys';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";

const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;
interface FetchStoriesProps{
    userId:string;
    sessionid:string;
    league:string;    
}

const fetchStories=async (key:FetchStoriesKey,userId:string,sessionid:string)=>{
    const {league, page}=key;
    const url=`${lake_api}/api/v50/findexar/get-stories?api_key=${api_key}&userid=${userId || ""}&league=${league}&sessionid=${sessionid}&page=${page}`;
    const fetchResponse = await fetch(url);
    const dataTrackListMembers = await fetchResponse.json();
    return dataTrackListMembers.members;
}

const promiseStories =({userId,sessionid,league}:FetchStoriesProps)=>{
    let keyStories = (page:any) => {
        const keyFetchedStories: FetchStoriesKey = { type: "FetchedStories", page: page, league}
        return keyFetchedStories;
    };
    return { key: us(keyStories), call: fetchStories(keyStories(0),userId,sessionid) };
}
export const actionStories=async (key:FetchStoriesKey)=>{
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const userId=session.username?session.username:"";
    const sessionid=session.sessionid;
    return fetchStories(key,userId,sessionid);
}

export default promiseStories;

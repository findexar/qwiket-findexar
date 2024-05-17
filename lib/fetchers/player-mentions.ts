'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { PlayerMentionsKey } from '@/lib/keys';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";
import { auth } from "@clerk/nextjs/server";

const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;
interface FetchMentionsProps{
    userId:string;
    sessionid:string;
    league:string;  
    teamid:string;  
    name:string;
}

const fetchMentions=async (key:PlayerMentionsKey,userId:string,sessionid:string)=>{
    const {teamid, league,page,name}=key;
    const url=`${lake_api}/api/v50/findexar/get-mentions?api_key=${api_key}&userid=${userId || ""}&league=${league}&teamid=${teamid}&name=${name}&sessionid=${sessionid}&page=${page}`;
    console.log("fetchPlayerMentions",url);
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    return res.mentions;
}

const promisePlayerMentions =async ({userId,sessionid,teamid,league,name}:FetchMentionsProps)=>{
    console.log("promisePlayerMentions",userId,sessionid,teamid,name);
    let keyMentions= (page:any) => {
        const keyFetchedPlayerMentions: PlayerMentionsKey = { type: "fetch-player-mentions", page: page, league,teamid,name}
        return keyFetchedPlayerMentions;
    };
    console.log("MentionsKey:",keyMentions);
    return { key: us(keyMentions), call: fetchMentions(keyMentions(0),userId,sessionid) };
}

export const actionPlayerMentions=async (key:PlayerMentionsKey)=>{
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId } = auth() || { userId: "" };
    const sessionid=session.sessionid;
    return fetchMentions(key,userId||"",sessionid);
}

export default promisePlayerMentions;

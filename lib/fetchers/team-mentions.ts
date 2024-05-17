'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { TeamMentionsKey } from '@/lib/keys';
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
}

const fetchMentions=async (key:TeamMentionsKey,userId:string,sessionid:string)=>{
    const {teamid, league,page}=key;
    const url=`${lake_api}/api/v50/findexar/get-mentions?api_key=${api_key}&userid=${userId || ""}&league=${league}&teamid=${teamid}&sessionid=${sessionid}&page=${page}`;
    console.log("fetchTeamMentions",url);
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    //console.log("fetchTeamMentions res",res);
    return res.mentions;
}

const promiseTeamMentions =async ({userId,sessionid,teamid,league}:FetchMentionsProps)=>{
    console.log("promiseTeamMentions",userId,sessionid,teamid);
    let keyMentions= (page:any) => {
        const keyFetchedTeamMentions: TeamMentionsKey = { type: "fetch-team-mentions", page: page, league,teamid}
        return keyFetchedTeamMentions;
    };
    console.log("promiseTeamMentions KEY:",keyMentions);
    return { key: us(keyMentions), call: fetchMentions(keyMentions(0),userId,sessionid) };
}
export const actionTeamMentions=async (key:TeamMentionsKey)=>{

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId } = auth() || { userId: "" };
    const sessionid=session.sessionid;
    return fetchMentions(key,userId||"",sessionid);
}

export default promiseTeamMentions;

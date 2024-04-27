'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { TeamMentionsKey } from '@/lib/keys';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";

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
    const url=`${lake_api}/api/v50/findexar/get-stories?api_key=${api_key}&userid=${userId || ""}&league=${league}&teamid=${teamid}&sessionid=${sessionid}&page=${page}`;
    console.log("fetchMentions",url);
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    return res.stories;
}

const promiseTeamMentions =async ({userId,sessionid,teamid,league}:FetchMentionsProps)=>{
    console.log("promiseTeamMentions",userId,sessionid,teamid);
    let keyMentions= (page:any) => {
        const keyFetchedTeamMentions: TeamMentionsKey = { type: "fetch-team-meantions", page: page, league,teamid}
        return keyFetchedTeamMentions;
    };
    console.log("StoriesKey:",keyMentions);
    return { key: us(keyMentions), call: fetchMentions(keyMentions(0),userId,sessionid) };
}
export const actionTeamMentions=async (key:TeamMentionsKey)=>{

    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const userId=session.username?session.username:"";
    const sessionid=session.sessionid;
    return fetchMentions(key,userId,sessionid);
}

export default promiseTeamMentions;

'use server';
import { unstable_serialize } from 'swr'
import {MyTeamRosterKey} from '@/lib/keys';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";
const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;
interface FetchMyTeamProps{
    userId:string;
    sessionid:string;
    league:string;

}
const fetchMyTeam=async ({userId,sessionid,league}:FetchMyTeamProps)=>{
    const url=`${lake_api}/api/v50/findexar/get-my-team?api_key=${api_key}&userid=${userId || ""}&league=${league}&sessionid=${sessionid}`;
    const fetchResponse = await fetch(url);
    const dataTrackListMembers = await fetchResponse.json();
    return dataTrackListMembers.members;
}
const promiseMyTeam =async ({userId,sessionid,league}:FetchMyTeamProps)=>{
    let trackerListMembersKey: MyTeamRosterKey = { type: "my-team-roster", league};
    return { key: unstable_serialize(trackerListMembersKey), call: fetchMyTeam({userId,sessionid,league}) };
}
export const actionMyTeam=async ({league}:MyTeamRosterKey)=>{
    'use server';
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const userId=session.username?session.username:"";
    const sessionid=session.sessionid;
    return fetchMyTeam({league,userId,sessionid});
}
export default promiseMyTeam;
'use server';
import { TeamPlayersKey } from "@/lib/keys";
import { unstable_serialize } from 'swr'
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";
import { auth } from "@clerk/nextjs/server";

const api_key = process.env.LAKE_API_KEY;;
interface FetchTeamPlayersProps {
    teamid: string;
    userId:string;
    sessionid:string;
}
const fetchTeamPlayers = async (key: TeamPlayersKey,userId:string,sessionid:string) => {
    const { teamid } = key;
    userId=userId || sessionid;
   // const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-team-players?league=${encodeURIComponent(league)}&teamid=${encodeURIComponent(teamid)}`;
   
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/get-team-roster?api_key=${api_key}&teamid=${teamid}&userid=${userId}`;
    console.log("fetching team players:",url)
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
   // console.log("RET:",res.players)
    return res.players;
}
const promiseFetchLeagueTeams = async ({ teamid = "",userId="",sessionid="" }: FetchTeamPlayersProps) => {
    const key: TeamPlayersKey = { type: "team-players", teamid };
    return { key: unstable_serialize(key), 
        call: fetchTeamPlayers(key,userId,sessionid) };
}
export const actionFetchLeagueTeams = async (key: TeamPlayersKey) => {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId } = auth() || { userId: "" };
    const sessionid=session.sessionid;
 
    return fetchTeamPlayers(key,userId||"",sessionid);
}
export default promiseFetchLeagueTeams;


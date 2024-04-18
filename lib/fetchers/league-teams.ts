'use server';
import { LeagueTeamsKey } from "@/lib/keys";
import { unstable_serialize } from 'swr'


const api_key = process.env.LAKE_API_KEY;;
interface FetchLeagueTeamsProps {
    league: string;
}
const fetchLeagueTeams = async (key: LeagueTeamsKey) => {
    const { league } = key;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-league-teams?api_key=${api_key}&league=${league}`;
    console.log("fetching league teams:",url)
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    console.log("RET:",res.teams)
    return res.teams;
}
const promiseFetchLeagueTeams = async ({ league = "" }: FetchLeagueTeamsProps) => {
    const key: LeagueTeamsKey = { type: "league-teams", league };
    return { key: unstable_serialize(key), call: fetchLeagueTeams(key) };
}
export const actionFetchLeagueTeams = async (key: LeagueTeamsKey) => {
     return fetchLeagueTeams(key);
}
export default promiseFetchLeagueTeams;
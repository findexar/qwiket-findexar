'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { FetchedStoriesKey } from '@/lib/api';

const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;
interface FetchStoriesProps{
    userId:string;
    sessionid:string;
    league:string;
    noLoad:boolean;

}
const fetchMyTeam=async ({userId,sessionid,league}:FetchStoriesProps)=>{
    const url=`${lake_api}/api/v50/findexar/get-my-team?api_key=${api_key}&userid=${userId || ""}&league=${league}&sessionid=${sessionid}`;
    const fetchResponse = await fetch(url);
    const dataTrackListMembers = await fetchResponse.json();
    return dataTrackListMembers.members;
}
const promiseMyTeam =({userId,sessionid,league,noLoad}:FetchStoriesProps)=>{
    let keyStories = us(page => {
        const keyFetchedStories: FetchedStoriesKey = { type: "FetchedStories", noUser: userId ? false : true, page: page, league: league || "", noLoad }
        return keyFetchedStories;
    });
    return { key: keyStories, call: fetchMyTeam({userId,sessionid,league,noLoad}) };

}
export default promiseMyTeam;
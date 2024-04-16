'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { FetchStoriesKey } from '@/lib/keys';

const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;
interface FetchStoriesProps{
    userId:string;
    sessionid:string;
    league:string;
    noLoad:boolean;

}
const fetchStories=async ({userId,sessionid,league}:FetchStoriesProps)=>{
    const url=`${lake_api}/api/v50/findexar/get-stories?api_key=${api_key}&userid=${userId || ""}&league=${league}&sessionid=${sessionid}`;
    const fetchResponse = await fetch(url);
    const dataTrackListMembers = await fetchResponse.json();
    return dataTrackListMembers.members;
}
const promiseStories =({userId,sessionid,league,noLoad}:FetchStoriesProps)=>{
    let keyStories = us(page => {
        const keyFetchedStories: FetchStoriesKey = { type: "FetchedStories", noUser: userId ? false : true, page: page, league: league || ""}
        return keyFetchedStories;
    });
    return { key: keyStories, call: fetchStories({userId,sessionid,league,noLoad}) };

}
export default promiseStories;
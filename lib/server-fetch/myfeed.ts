'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { FetchedStoriesKey } from '@/lib/api';

const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;
interface FetchMyFeedProps{
    userId:string;
    sessionid:string;
    league:string;
    noLoad:boolean;

}
const fetchMyFeed=async ({userId,sessionid,league}:FetchMyFeedProps)=>{
    const url=`${lake_api}/api/v50/findexar/get-my-team?api_key=${api_key}&userid=${userId || ""}&league=${league}&sessionid=${sessionid}`;
    const fetchResponse = await fetch(url);
    const dataTrackListMembers = await fetchResponse.json();
    return dataTrackListMembers.members;
}
const promiseMyfeed =({userId,sessionid,league,noLoad}:FetchMyFeedProps)=>{
    let keyStories = us(page => {
        const keyFetchedStories: FetchedStoriesKey = { type: "FetchedMyFeed", noUser: userId ? false : true, page: page, league: league || "", noLoad }
        return keyFetchedStories;
    });
    return { key: keyStories, call: fetchMyFeed({userId,sessionid,league,noLoad}) };

}
export default promiseMyFeed;
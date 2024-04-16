'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { FetchMyFeedKey } from '@/lib/keys';

const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;
interface FetchMyFeedProps{
    userId:string;
    sessionid:string;
    league:string;


}
const fetchMyFeed=async ({userId,sessionid,league}:FetchMyFeedProps)=>{
    const url=`${lake_api}/api/v50/findexar/get-my-feed?api_key=${api_key}&userid=${userId || ""}&league=${league}&sessionid=${sessionid}`;
    const fetchResponse = await fetch(url);
    const dataTrackListMembers = await fetchResponse.json();
    return dataTrackListMembers.members;
}
const promiseMyFeed =({userId,sessionid,league}:FetchMyFeedProps)=>{
    let keyMyFeed = us(page => {
        const keyFetchMyFeed: FetchMyFeedKey = { type: "FetchMyFeed", noUser: userId ? false : true, page: page, league: league || ""}
        return keyFetchMyFeed;
    });
    return { key: keyMyFeed, call: fetchMyFeed({userId,sessionid,league}) };

}
export default promiseMyFeed;
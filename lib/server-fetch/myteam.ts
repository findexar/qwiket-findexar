import { unstable_serialize } from 'swr'
import {TrackerListMembersKey} from '@/lib/api';
const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;
interface FetchMyTeamProps{
    userId:string;
    sessionId:string;
    league:string;

}
const fetchMyTeam=async ({userId,sessionId,league}:FetchMyTeamProps)=>{
    const url=`${lake_api}/api/v41/findexar/user/tracker-list/get?api_key=${api_key}&userid=${userId || ""}&league=${league}`;
    const fetchResponse = await fetch(url);
    const dataTrackListMembers = await fetchResponse.json();
    return dataTrackListMembers.members;
}
const promiseMyTeam =({userId,sessionId,league}:FetchMyTeamProps)=>{
    let trackerListMembersKey: TrackerListMembersKey = { type: "tracker_list_members", league, noUser: userId ? false : true, noLoad: false };
    return { key: unstable_serialize(trackerListMembersKey), call: fetchMyTeam({userId,sessionId,league}) };

}
export default promiseMyTeam;
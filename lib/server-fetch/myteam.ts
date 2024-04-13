import { unstable_serialize } from 'swr'
import {TrackerListMembersKey} from '@/lib/api';
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
const promiseMyTeam =({userId,sessionid,league}:FetchMyTeamProps)=>{
    let trackerListMembersKey: TrackerListMembersKey = { type: "tracker_list_members", league, noUser: userId ? false : true, noLoad: false };
    return { key: unstable_serialize(trackerListMembersKey), call: fetchMyTeam({userId,sessionid,league}) };

}
export default promiseMyTeam;
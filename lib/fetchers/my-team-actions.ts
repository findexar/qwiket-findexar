'use server';
import { MyTeamKey } from "@/lib/keys";
import { unstable_serialize } from 'swr'
import fetchSession from "./session";
import { auth } from "@clerk/nextjs/server";

const api_key = process.env.LAKE_API_KEY;;
interface FetchMyTeamProps {
    league: string;
    userId: string;
    sessionid: string;
}
const fetchMyTeam = async (key: MyTeamKey, userId: string, sessionid: string) => {
    const { league } = key;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/get-my-team?api_key=${api_key}&league=${league || ""}&userid=${userId}&sessionid=${sessionid}`;
    // console.log("fetching my team players:", url)
    // console.log("====> fetchMyTeam", JSON.stringify({ userId, sessionid, league }))

    const fetchResponse = await fetch(url);
    // console.log("fetchResponse", fetchResponse.json)
    const res = await fetchResponse.json();
    //console.log("RET fetch my team:",res.members)
    return res.members;
}
const promiseFetchMyTeam = async ({ league = "", userId = "", sessionid = "" }: FetchMyTeamProps) => {
    const key: MyTeamKey = { type: "my-team", league };

    return {
        key: unstable_serialize(key),
        call: fetchMyTeam(key, userId, sessionid)
    };
}
export const actionFetchMyTeam = async (key: MyTeamKey) => {
    const session = await fetchSession();
    // const userId=session.username?session.username:"";
    const { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid || "";

    return fetchMyTeam(key, userId || "", sessionid);
}
export default promiseFetchMyTeam;
interface MyTeamMemberProps {
    teamid: string;
    member: string;
    athleteUUId: string;
}
const addMyTeamMember = async ({ teamid, member, athleteUUId }: MyTeamMemberProps, userId: string, sessionid: string) => {

    userId = userId || sessionid;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/user/tracker-list/add?api_key=${api_key}&member=${encodeURIComponent(member)}&athleteUUId=${athleteUUId}&teamid=${teamid}&userid=${userId}&sessionid=${sessionid}`;
    // console.log("==================> add my team member:", url)
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    // console.log("RET add my team:", res.success)
    return { success: res.success, maxUser: res.maxUser, maxSubscription: res.maxSubscription, error: res.error };
}
const removeMyTeamMember = async ({ teamid, member, athleteUUId }: MyTeamMemberProps, userId: string, sessionid: string) => {

    userId = userId || sessionid;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/user/tracker-list/remove?api_key=${api_key}&member=${encodeURIComponent(member)}&athleteUUId=${athleteUUId}&teamid=${teamid}&userid=${userId}&sessionid=${sessionid}`;
    //  console.log("remove my team member:",url)
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    //  console.log("RET remove my team:",res.success)
    return res.success;
}
export const actionAddMyTeamMember = async (props: MyTeamMemberProps) => {
    const session = await fetchSession();
    const { userId = "" } = auth() || {};
    const sessionid = session.sessionid || "";
    return addMyTeamMember(props, userId || "", sessionid);
}

export const actionRemoveMyTeamMember = async (props: MyTeamMemberProps) => {
    const session = await fetchSession();
    const { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid;
    return removeMyTeamMember(props, userId || "", sessionid);
}
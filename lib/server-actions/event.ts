'use server';
import { MyTeamKey } from "@/lib/keys";
import { unstable_serialize } from 'swr'
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { auth } from "@clerk/nextjs/server";
interface RecordEventProps {
    name: string;
    params: string;
}
const recordEvent = async ({ name, params }: RecordEventProps, userId: string, sessionid: string) => {

    userId = userId || sessionid;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/record-event?name=${encodeURIComponent(name)}&sessionid=${encodeURIComponent(sessionid)}&userid=${encodeURIComponent(userId)}&params=${encodeURIComponent(params)}`;
    // console.log("record-event:",url)
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    //console.log("RET record-event:",res.success)
    return res.success;
}
const workRecordEvent = async (name: string, params: string, passedSessionid?: string) => {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const { userId } = await auth() || { userId: "" };
    let sessionid = session.sessionid;
    //console.log("===>WORK RECORD EVENT", { sessionid, passedSessionid });
    if (!sessionid && passedSessionid) {
        sessionid = passedSessionid;
    }
    //console.log("===>WORK RECORD EVENT=>>", { name, params, sessionid,  });
    return await recordEvent({ name, params }, userId || "", sessionid);
}
export const actionRecordEvent = async (name: string, params: string, sessionid?: string) => {
    return workRecordEvent(name, params, sessionid);
}


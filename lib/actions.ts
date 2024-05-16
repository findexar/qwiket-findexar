'use server';
import { MyTeamKey } from "@/lib/keys";
import { unstable_serialize } from 'swr'
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";
interface RecordEventProps {
    name: string;
    params: string;
}
const recordEvent = async ({ name,params }: RecordEventProps,userId:string,sessionid:string) => {

    userId=userId || sessionid;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/record-event?name=${encodeURIComponent(name)}&sessionid=${encodeURIComponent(sessionid)}&params=${encodeURIComponent(params)}`;
   // console.log("record-event:",url)
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    //console.log("RET record-event:",res.success)
    return res.success;
}
 const workRecordEvent = async (name: string, params: string) => {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const userId=session.username?session.username:"";
    const sessionid=session.sessionid;
    return recordEvent({name,params}, userId,sessionid);
}
export const actionRecordEvent=(name:string,params:string)=>{
    return workRecordEvent(name,params);
}


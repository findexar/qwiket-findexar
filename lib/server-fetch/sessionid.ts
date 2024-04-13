'use server';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";

const fetchSessionId=async ()=>{
    let session = await getIronSession<SessionData>(cookies(), sessionOptions);
    let sessionId="";
    if(!session.sessionid){
      console.log("process.env.NEXT_PUBLIC_SERVER",process.env.NEXT_PUBLIC_SERVER)
        const url=`${process.env.NEXT_PUBLIC_SERVER}/api/session/init`;
        console.log("url",url)
        const fetchResponse = await fetch(url, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            }
          });
          
        session = await fetchResponse.json();
        console.log("session",session);
        sessionId=session.sessionid;
    }
    else {
        sessionId=session.sessionid;
    }
   return sessionId;
}
export default fetchSessionId;
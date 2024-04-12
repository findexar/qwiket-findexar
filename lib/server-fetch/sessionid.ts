
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";

const fetchSessionId=async ()=>{
    let session = await getIronSession<SessionData>(cookies(), sessionOptions);
    let sessionId="";
    if(!session.sessionid){
        const url=`${process.env.NEXT_PUBLIC_SERVER}/api/session/init`;
        const fetchResponse = await fetch(url, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json",
            }
          });
        session = await fetchResponse.json();
        sessionId=session.sessionid;
    }
    else {
        sessionId=session.sessionid;
    }
   return sessionId;
}
export default fetchSessionId;
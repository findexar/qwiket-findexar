'use server';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";

const saveSession = async (sessionData: any) => {

    const t0=new Date().getTime();
    console.log("!!!!!!!!!!!!!!!!!!!! ==> saveSession1", sessionData)
    let session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.newSession = false;
    const oldSessionid = session.sessionid;
    if(oldSessionid) {
        sessionData.sessionid = oldSessionid;
    }
    console.log("==> saveSession2", session,new Date().getTime()-t0)
    if (!session.sessionid) {
        var randomstring = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        session.sessionid = randomstring();
       // session.dark = -1;
        console.log("********** NEW SESSION", session)
        await session.save();
        sessionData.sessionid = session.sessionid;
    }
    console.log("action: old session", session)
    session = Object.assign(session, sessionData);
    console.log("action: inSession", session)
    await session.save();
}
export default saveSession;
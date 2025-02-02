"use server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
//Simport { withIronSessionApiRoute } from 'iron-session/next'
const fetchSession = async () => {
    "use server";
    let session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.sessionid) {
        var randomstring = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        session.sessionid = randomstring();
        session.dark = -1;
        console.log("********** action: NEW SESSION2", session)
        try {
            await session.save();
            console.log("after save")
        } catch (x) {
            console.log("error saving session", x)
        }
    }
    /* if(!session||!session.sessionid){
        const resp=await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/init-session`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({})
        });
        const respJson=await resp.json();
        session=respJson.session;
     }*/
    // console.log("===>FETCH SESSION", session);
    return session;
}
export default fetchSession;
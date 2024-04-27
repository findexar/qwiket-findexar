'use server';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";

const saveSession=async (sessionData:any)=>{
    let session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if(!session.sessionid){
        var randomstring = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        session.sessionid = randomstring();
        session.username="";
        session.isLoggedIn=false;
        session.dark=-1;
        console.log("********** NEW SESSION",session)
        //await session.save();
    }
    console.log("action: old session",session)
    session= Object.assign(session, sessionData);
    console.log("action: inSession",session)
    await session.save();
   

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
   return session;
}
export default saveSession;
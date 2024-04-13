'use server';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";

const fetchSession=async ()=>{
    let session = await getIronSession<SessionData>(cookies(), sessionOptions);
     if(!session||!session.sessionid){
        const resp=await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/init-session`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({})
        });
        const respJson=await resp.json();
        session=respJson.session;
     }
   return session;
}
export default fetchSession;
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";

export async function initSession() {
    'use server';
    console.log("INSIDE API")
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    console.log("INSIDE API2",session)
    
    var randomstring = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    session.sessionid=randomstring();
    await session.save();    
    return session;
  }
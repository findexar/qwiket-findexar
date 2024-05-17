// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { defaultSession, sessionOptions, SessionData } from "@/lib/session";

//import {updateUserSession} from "../../../lib/lake-api"


/**
 * Note: the incoming session object could be only partial, will be merged over existing session
 * 
 * @param req 
 * 
 * @param res 
 * @returns 
 */
async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    console.log("api")
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' });
        return;
    }
    let session = await getIronSession<SessionData>(req, res, sessionOptions);
    console.log("********** EXIST SESSION",session)
    if (!session || !session.sessionid) {
       // session=defaultSession;
        var randomstring = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        session.sessionid = randomstring();
        session.dark=-1;
        console.log("********** NEW SESSION",session)
        await session.save();
    }
    res.status(200).json({ session })
}
export default handler;

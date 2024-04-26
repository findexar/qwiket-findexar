// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import { withSessionRoute, Options } from "@/lib/with-session";
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
    if (req.method !== 'POST') {
        res.status(405).send({ message: 'Only POST requests allowed' });
        return;
    }
    var randomstring = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    let session = await getIronSession<SessionData>(req, res, sessionOptions);
  
     const body = req.body;
    
    let inSession = body.session ? (body.session) : {};
    console.log("old session",session)
    session= Object.assign(session, inSession);
    console.log("inSession",session)
    await session.save();
   /* if(req.session.options?.userslug){
       await updateUserSession(req.session.options.userslug,req.session.options);
    }*/

    res.status(200).json({})
}
export default handler;
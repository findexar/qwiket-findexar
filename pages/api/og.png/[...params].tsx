import React from 'react';
//import type { NextRequest, NextResponse } from 'next'
import { ImageResponse } from 'next/og';
import { NextRequest,NextResponse } from 'next/server';

export const size = { width: 1200, height: 600 };
export const alt = 'OpenGraph Image';
export const contentType = 'image/png';
export const runtime = 'edge';

export const config = {
    runtime: "edge",

}
/**
 * Note: the incoming session object could be only partial, will be merged over existing session
 * 
 * @param req 
 * 
 * @param res 
 * @returns 
 */
async function handler(
    req: NextRequest,
    res: NextResponse
) {
    try {
 
        const parts=req.url.split('?')[0].split('/');
        const height=parts[parts.length-1];
        const width=parts[parts.length-2];
        let site_name=decodeURIComponent(parts[parts.length-3]);
        const image=decodeURIComponent(parts[parts.length-4]);
        if(site_name==='https://www.inquirer.com'){
            site_name='Philadelphia Inquirer';
        }
        let offset=0;
        if(site_name=='RotoWire')
            offset=12;
        const response = new ImageResponse(
            (
                <div style={{
                    width: +width,
                    height: +height,
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <div style={{
                        position: 'absolute',
                        top: '20%',
                        left: offset?'10%':'3%',
                        //right: 0,
                        height: '10%', // Adjust as needed
                        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark background with opacity
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '10px',
                    }}>
                        <span style={{zIndex:1,fontSize:`${(+height)/16}px`,padding:10}} >{site_name?site_name.trim():''}</span>
                    </div>
                </div>
            ),
            {
                width: +width,
                height: +height,
                emoji:'twemoji',
                
            }
        )
        return response;
    }
    catch(x) {
        //console.log("Error:",x);
        return new Response(`Failed to generate the image,${x}`, {
            status: 500,
        });
    }

}
export default handler;   
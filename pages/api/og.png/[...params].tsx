import React from 'react';
//import type { NextRequest, NextResponse } from 'next'
import { ImageResponse } from 'next/og';
import { NextRequest, NextResponse } from 'next/server';

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
        const parts = req.url.split('?')[0].split('/');
        const height = parts[parts.length - 1];
        const width = parts[parts.length - 2];
        let site_name = decodeURIComponent(parts[parts.length - 3]);
        const image = decodeURIComponent(parts[parts.length - 4]);
        if (site_name === 'https://www.inquirer.com') {
            site_name = 'Philadelphia Inquirer';
        }
        let offset = 0;
        if (site_name == 'RotoWire')
            offset = 12;
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
                        left: offset ? '10%' : '3%',
                        //right: 0,
                        height: '20%', // Adjust as needed
                        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark background with opacity
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '10px',
                    }}>
                        <span style={{ zIndex: 0, fontSize: `${(+height) / 16}px`, padding: 10 }} >Source: {site_name ? site_name.trim() : ''}</span>
                        <br />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="yellow" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            <div style={{ zIndex: 0, fontSize: `32px`, padding: 10, color: 'yellow', }} >Please click Like to support Qwiket&apos;s growth.</div>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="yellow" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                    </div>
                </div>
            ),
            {
                width: +width,
                height: +height,
                emoji: 'twemoji',

            }
        )
        return response;
    }
    catch (x) {
        //console.log("Error:",x);
        return new Response(`Failed to generate the image,${x}`, {
            status: 500,
        });
    }

}
export default handler;   
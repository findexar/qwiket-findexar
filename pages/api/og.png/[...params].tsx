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
        let sn = "";
        let offset = 0;
        site_name = site_name ? site_name.trim() : "";
        if (site_name == 'RotoWire')
            offset = 12;
        switch (site_name) {
            case 'RotoWire':
                sn = "RW";
                break;
            case "Rotoballer":
                sn = "RB";
                break;
            case 'Sports Illustrated':
                sn = "SI";
                break;
            case 'The Athletic':
                sn = "TA";
                break;
            case 'Yahoo Sports':
                sn = "Y!S";
                break;
            case 'CBSSports':
                sn = "CBS";
                break;
            case 'ESPN':
                sn = "ESPN";
                break;
            case 'Denver Post':
                sn = "DP";
                break;
            case 'Philadelphia Inquirer':
                sn = "PI";
                break;
            case 'Orlando Sentinel':
                sn = "OS";
                break;
            case 'Toronto Star':
                sn = "TS";
                break;
            case 'New York Post':
                sn = "NYP";
                break;
            case 'New York Daily News':
                sn = "NYDN";
                break;
            case 'The Globe and Mail':
                sn = "TG";
                break;
            case 'The Washington Times':
                sn = "WT";
                break
            case 'NBC Sports':
                sn = "NBC";
                break;
            case 'Dallas News':
                sn = "DN";
                break;
            case 'thePeachBasket':
                sn = "TPB";
                break;
            case '@StarTribune':
                sn = "ST";
                break;
            case 'Bleacher Report':
                sn = "BR";
                break;
            case 'Houston Chronicle':
                sn = "HC";
                break;
            case 'Chicago Sun-Times':
                sn = "CST";
                break;
            case 'Los Angeles Times':
                sn = "LAT";
                break;
            case 'RotoWire':
                sn = "RW";
                break;
            default:
                sn = site_name;
                break;
        }
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
                        height: '24%', // Adjust as needed
                        backgroundColor: 'rgba(0, 0, 0, 0.0)', // Dark background with opacity
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        padding: '10px',
                        borderRadius: '10px',
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', // Light background for the oval
                            borderRadius: '50%', // Makes it oval
                            padding: '10px 20px', // Padding to create the oval shape
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <span style={{ zIndex: 0, fontSize: `${(+height) / 16}px` }}>{sn}</span>
                        </div>
                        <br />
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            {false && <svg xmlns="http://www.w3.org/2000/svg" width={`${(+height) / 18}`} height={`${(+height) / 18}`} viewBox="0 0 24 24" fill="none" stroke="yellow" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>}
                            {false && <div style={{ zIndex: 0, fontSize: `${(+height) / 18}px`, padding: 10, color: 'yellow', }} >Please click Like to support Qwiket&apos;s growth.</div>}
                            <svg xmlns="http://www.w3.org/2000/svg" width={`${(+height) / 18}`} height={`${(+height) / 18}`} viewBox="0 0 24 24" fill="none" stroke="yellow" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                            {false && <svg xmlns="http://www.w3.org/2000/svg" width={`${(+height) / 18}`} height={`${(+height) / 18}`} viewBox="0 0 24 24" fill="none" stroke="yellow" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                                <line x1="12" y1="4" x2="12" y2="20" stroke="yellow" strokeWidth="2" />
                                <polygon points="10,18 12,20 14,18" fill="yellow" />
                            </svg>}
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
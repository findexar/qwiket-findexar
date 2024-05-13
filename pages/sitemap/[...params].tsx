import React from "react"
import Error from 'next/error'

import { GetServerSidePropsContext } from "next";
import { SWRConfig, unstable_serialize } from 'swr'

interface HomeProps { }

//All root presentation logic for broasheet pages is handled in Common component:
export default function Home({ }: HomeProps) {
    return undefined;
}


export const getServerSideProps =
    async function getServerSideProps(context: GetServerSidePropsContext): Promise<any> {
        try {
            let host = context.req.headers.host || "";

            //Disqus OAuth callback params:
            console.log("START SSR",context.params)
            let ssr = context.params?.params as string[];
            if (!ssr)
                return { props: {} }
            let [league, startDate] = ssr;
            console.log("SSR", league, startDate, host);
            // Sitemap handling:
            let format = 'xml';
            const parts = startDate.split('.');
            if (parts.length > 1 && parts[1].indexOf('txt') >= 0) {
                format = 'txt';
            }
            startDate = parts[0];
            const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/sitemap/fetch?league=${encodeURIComponent(league || "")}&format=${format || 0}&startDate=${startDate || ""}&domain=${process.env.NEXT_PUBLIC_APP_NAME?.toLowerCase() || "qwiket"}`;
            console.log("FETCH", url);
            const res = await fetch(url);
            const {success,sitemap} = await res.json();
            console.log("FETCHED", success, sitemap);

            context.res.write(sitemap);//.split(',').map(t=>`${t}\n`));
            context.res.end();


            /* //robots.txt handling:
             if (forum.indexOf("robots.txt") == 0) {
                 const sitemaps = await fetchAllSitemaps(process.env.DEFAULT_NEWSLINE || '', process.env.DEFAULT_FORUM || '', host, format);
                 const robots = sitemaps.map((t: any) => `Sitemap:  ${t}`).join('\n')
                 context.res.write(robots);//.split(',').map(t=>`${t}\n`));
                 context.res.end();
                 return { props: {} }
             }
 */

            return { props: {} }
        } catch (x) {
            console.log("FETCH STATIC PROPS ERROR", x);
            context.res.statusCode = 503;
            return {
                props: { error: 503 }
            }
        }
    }
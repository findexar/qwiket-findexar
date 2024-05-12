import { cookies, headers } from "next/headers";

import { revalidatePath } from "next/cache";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { SWRConfig, unstable_serialize } from 'swr'
import { unstable_serialize as us } from 'swr/infinite';
import { getAuth, buildClerkProps } from "@clerk/nextjs/server";

import { clerkClient } from "@clerk/nextjs";
import { SWRProvider } from '@/app/swr-provider'

import { initSessionClient } from '@/app/client';

import fetchMyTeam from '@/lib/fetchers/myteam';
import fetchLeagues from '@/lib/fetchers/leagues';
import fetchFavorites from '@/lib/fetchers/favorites';
import fetchSession from '@/lib/fetchers/session';
import fetchSlugStory from '@/lib/fetchers/slug-story';
import fetchMention from '@/lib/fetchers/mention';
import fetchMetaLink from '@/lib/fetchers/meta-link';
import fetchStories from '@/lib/fetchers/stories';
import fetchLeagueTeams from '@/lib/fetchers/league-teams';
import fetchTeamMentions from '@/lib/fetchers/team-mentions';
import fetchPlayerMentions from '@/lib/fetchers/player-mentions';
import fetchTeamPlayers from '@/lib/fetchers/team-players';
import { getLeagues } from '@/lib/api';
import { isbot } from '@/lib/is-bot';

import { ASlugStoryKey } from '@/lib/api';
import SPALayout from '@/components/spa';

import fetchData from '@/lib/fetchers/fetch-data';
//import { isbot } from '@/lib/isbot.js';
import type { Metadata, ResolvingMetadata } from 'next'
 
type Props = {
    params: { leagueid: string, teamid: string }
  searchParams: { [key: string]: string | string[] | undefined }
}
 
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  let { tab="", fbclid, utm_content, view = "mentions", id, story }:
    { fbclid: string, utm_content: string, view: string, tab: string, id: string, story: string } = searchParams as any;
    let findexarxid = id || "";
    let league = params.leagueid.toUpperCase();
    let teamid = params.teamid;
    /**
     * Fill an array of fetch promises for parallel execution
     * note: view - only on mobile, tab - on both
     * 
     */
    let amention,astory;
    if (findexarxid) {  // if a mention story is opened
      amention=await fetchMention({ type: "AMention", findexarxid });
    //  const metalink=await fetchMetaLink({ func: "meta", findexarxid, long: 1 });
    }
    if (story) { // if a digest story is opened
      astory=await fetchSlugStory({ type: "ASlugStory", slug: story });
    }
    //@ts-ignore
    const { summary: amentionSummary = "", league: amentionLeague = "", type = "", team: amentionTeam = "", teamName: amentionTeamName = "", name: amentionPlayer = "", image: amentionImage = "", date: amentionDate = "" } = amention ? amention : {};
    //@ts-ignore
    const { title: astoryTitle = "", site_name: astorySite_Name = "", authors: astoryAuthors = "", digest: astoryDigest = "", image: astoryImage = "", createdTime: astoryDate = "", mentions: mentions = [], image_width = 0, image_height = 0 } = astory ? astory : {};
    const astoryImageOgUrl = astoryImage ? `${process.env.NEXT_PUBLIC_SERVER}/api/og.png/${encodeURIComponent(astoryImage)}/${encodeURIComponent(astorySite_Name)}/${image_width}/${image_height}` : ``;
  
    //prep meta data for amention
    let ogUrl = '';
    if (amention && amentionLeague && amentionTeam && amentionPlayer) {
      ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${amentionLeague}/team/${amentionTeam}/player/${amentionPlayer}?id=${findexarxid}`;
    } else if (amention && amentionLeague && amentionTeam) {
      ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${amentionLeague}/team/${amentionTeam}?id=${findexarxid}`;
    } else if (amention && amentionLeague) {
      ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${amentionLeague}?id=${findexarxid}`;
    }
    else if (amention)
      ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub?id=${findexarxid}`;
    else
      ogUrl = `${process.env.NEXT_PUBLIC_SERVER}`;
    let ogTarget = '';
    if (amention && amentionLeague && amentionTeam && amentionPlayer && type == 'person')
      ogTarget = `${amentionPlayer} of ${amentionTeamName}`;
    else if (amention && amentionLeague && amentionTeam)
      ogTarget = `${amentionTeamName} on ${process.env.NEXT_PUBLIC_SITE_NAME}`;
  
    let ogDescription = amentionSummary ? amentionSummary : "Fantasy Sports Media Index.";
    let ogImage = astoryImageOgUrl ? astoryImageOgUrl : process.env.NEXT_PUBLIC_SITE_NAME == "Findexar" ? "https://findexar.com/findexar-logo.png" : "https://www.qwiket.com/QLogo.png";
    let ogTitle = ogTarget ? `${ogTarget}` : `${[process.env.NEXT_PUBLIC_SITE_NAME]} Sports Media Index`;
    if (astory) {
      ogUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${league}?${story ? `story=${story}` : ``}`
        : `${process.env.NEXT_PUBLIC_SERVER}/pub?${story ? `story=${story}` : ``}`;
      ogTitle = astoryTitle;
      ogDescription = astoryDigest.replaceAll('<p>', '').replaceAll('</p>', "\n\n");
      ogImage = astoryImageOgUrl;
    }
    const noindex = +(process.env.NEXT_PUBLIC_NOINDEX || "0");
    console.log("ogImage:",ogImage)
    return {
        title: ogTitle,
        openGraph: {
          title: ogTitle,
          description: ogDescription,
          url: ogUrl,
          images: [
            {
              url: ogImage,
              width: image_width,
              height: image_height,
              alt: ogTitle,
            }
          ],
          type: 'website'
        },
        robots: noindex ? 'noindex, nofollow' : 'index, follow',
        alternates: {
          canonical: ogUrl,
        },
        icons: {
          icon: process.env.NEXT_PUBLIC_APP_NAME == "Findexar" ? "/FiLogo.png" : "/QLogo.png",
          shortcut: process.env.NEXT_PUBLIC_APP_NAME == "Findexar" ? "/FiLogo.png" : "/QLogo.png",
         
        },
        
      }
}
export default async function Page({
    params,
    searchParams,
}: {
    params: { leagueid: string, teamid: string,name:string }
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    const t1 = new Date().getTime();
    //console.log("entered root page", t1)
    let sessionid = "";
    let dark = 0;
    try {
        const session = await fetchSession();
        //console.log("=>",session)
        sessionid = session.sessionid;
        dark = session.dark;
    }
    catch (x) {
        console.log("error fetching sessionid", x);
    }
    console.log("sessionid", sessionid);
    console.log("==============================================*****===>")
    const userId = '';
    let fallback: { [key: string]: any } = {}; // Add index signature
    const leaguesKey = { type: "leagues" };
    fallback[unstable_serialize(leaguesKey)] = fetchLeagues(leaguesKey);
    let headerslist = headers();
    let { tab, fbclid, utm_content, view = "mentions", id, story }:
        { fbclid: string, utm_content: string, view: string, tab: string, id: string, story: string } = searchParams as any;
    //let { userId }: { userId: string | null } = getAuth(context.req);
    let findexarxid = id || "";
    let pagetype = "player";
    let league = params.leagueid.toUpperCase();
    let teamid = params.teamid;
    let name = params.name.replaceAll('_', ' ').replaceAll('%20',' ');;
   
    console.log("league->", league)
    utm_content = utm_content || '';
    fbclid = fbclid || '';
    const ua = headerslist.get('user-agent') || "";
    const botInfo = isbot({ ua });
    let isMobile = Boolean(ua.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    ))
    view = view.toLowerCase();
    if (view == 'feed')
        view = 'mentions';
    console.log("VIEW:", view, isMobile)
    if (view == 'home')
        view = 'mentions';
    let calls: { key: any, call: Promise<any> }[] = [];

    /**
     * Fill an array of fetch promises for parallel execution
     * note: view - only on mobile, tab - on both
     * 
     */
    calls.push(await fetchLeagueTeams({ league }));
    if (findexarxid) {  // if a mention story is opened
        calls.push(await fetchMention({ type: "AMention", findexarxid }));
        calls.push(await fetchMetaLink({ func: "meta", findexarxid, long: 1 }));
    }
    if (story) { // if a digest story is opened
        calls.push(await fetchSlugStory({ type: "ASlugStory", slug: story }));
    }
    calls.push(await fetchTeamPlayers({ userId, sessionid,  teamid }));
   
    //if (view == 'mentions'&&tab!='myteam'&&tab!='fav') { //stories
    calls.push(await fetchPlayerMentions({ userId, sessionid, league, teamid,name }));
    //}
    await fetchData(t1, fallback, calls);
    // console.log("final fallback:",fallback)
    const key= { type: "league-teams", league };
   
    let teams=fallback[unstable_serialize(key)];
    let teamName=teams?.find((x:any)=>x.id==teamid)?.name;
  
    return (
        <SWRProvider value={{ fallback }}>
            <main className="w-full h-full" >
                <SPALayout dark={dark} view={view} tab={tab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} isMobile={isMobile} story={story} findexarxid={findexarxid} league={league} pagetype={pagetype} teamid={teamid} name={name} teamName={teamName}  />
            </main>
        </SWRProvider>
    );
}

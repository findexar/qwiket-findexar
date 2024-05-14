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
import fetchMyFeed from '@/lib/fetchers/myfeed';
import fetchLeagues from '@/lib/fetchers/leagues';
import fetchFavorites from '@/lib/fetchers/favorites';
//import fetchSession from '@/lib/fetchers/session';
import fetchSlugStory from '@/lib/fetchers/slug-story';
import fetchMention from '@/lib/fetchers/mention';
import fetchMetaLink from '@/lib/fetchers/meta-link';
import fetchStories from '@/lib/fetchers/stories';
import { getASlugStory } from '@/lib/fetchers/slug-story';
import { getAMention } from '@/lib/fetchers/mention';

import { getLeagues } from '@/lib/api';
import { isbot } from '@/lib/is-bot';

import { ASlugStoryKey } from '@/lib/api';
import SPALayout from '@/components/spa';

import fetchData from '@/lib/fetchers/fetch-data';
//import { isbot } from '@/lib/isbot.js';
import type { Metadata, ResolvingMetadata } from 'next'
 
type Props = {
  params: {}
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
    const league='';
    /**
     * Fill an array of fetch promises for parallel execution
     * note: view - only on mobile, tab - on both
     * 
     */
    let amention,astory;
    if (findexarxid) {  // if a mention story is opened
      amention=await getAMention({ type: "AMention", findexarxid });
    //  const metalink=await fetchMetaLink({ func: "meta", findexarxid, long: 1 });
    }
    if (story) { // if a digest story is opened
      astory=await getASlugStory({ type: "ASlugStory", slug: story });
    }

    //@ts-ignore
    const { summary: amentionSummary = "", league: amentionLeague = "", type = "", team: amentionTeam = "", teamName: amentionTeamName = "", name: amentionPlayer = "", image: amentionImage = "", date: amentionDate = "" } = amention ? amention : {};
    //@ts-ignore
    const { title: astoryTitle = "", site_name: astorySite_Name = "", authors: astoryAuthors = "", digest: astoryDigest = "", image: astoryImage = "", createdTime: astoryDate = "", mentions: mentions = [], image_width = 0, image_height = 0 } = astory ? astory : {};
    const astoryImageOgUrl = astoryImage ? `${process.env.NEXT_PUBLIC_SERVER}/api/og.png/${encodeURIComponent(astoryImage)}/${encodeURIComponent(astorySite_Name)}/${image_width}/${image_height}` : ``;

    //prep meta data for amention
    let ogUrl = '';
    if (amention && amentionLeague && amentionTeam && amentionPlayer) {
      ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}/${amentionTeam}/${amentionPlayer}?id=${findexarxid}`;
    } else if (amention && amentionLeague && amentionTeam) {
      ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}/${amentionTeam}?id=${findexarxid}`;
    } else if (amention && amentionLeague) {
      ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}?id=${findexarxid}`;
    }
    else if (amention)
      ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/?id=${findexarxid}`;
    else
      ogUrl = `${process.env.NEXT_PUBLIC_SERVER}`;
    let ogTarget = '';
    if (amention && amentionLeague && amentionTeam && amentionPlayer && type == 'person')
      ogTarget = `${amentionPlayer} of ${amentionTeamName}`;
    else if (amention && amentionLeague && amentionTeam)
      ogTarget = `${amentionTeamName} on ${process.env.NEXT_PUBLIC_APP_NAME}`;
  
    let ogDescription = amentionSummary ? amentionSummary : "Fantasy Sports Media Index.";
    let ogImage = astoryImageOgUrl ? astoryImageOgUrl : process.env.NEXT_PUBLIC_APP_NAME == "Findexar" ? "https://findexar.com/findexar-logo.png" : "https://www.qwiket.com/QLogo.png";
    let ogTitle = ogTarget ? `${ogTarget}` : `${[process.env.NEXT_PUBLIC_APP_NAME]} Sports Media Index`;
    if (astory) {
      ogUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/${league}?${story ? `story=${story}` : ``}`
        : `${process.env.NEXT_PUBLIC_SERVER}/?${story ? `story=${story}` : ``}`;
      ogTitle = astoryTitle;
      ogDescription = astoryDigest.replaceAll('<p>', '').replaceAll('</p>', "\n\n");
      ogImage = astoryImageOgUrl;
    }
    let  noindex = +(process.env.NEXT_PUBLIC_NOINDEX || "0");
           
   // console.log("ogImage:",ogImage)
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
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const fetchSession=async ()=>{
    "use server";
    let session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if(!session.sessionid){
        var randomstring = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        session.sessionid = randomstring();
        session.username="";
        session.isLoggedIn=false;
        session.dark=-1;
        console.log("********** action: NEW SESSION",session)
       // await session.save();
        console.log("after save")
    }

   return session;
}
  const t1 = new Date().getTime();

  let sessionid = "";
  let dark=0;
  try {
    
    const session = await fetchSession();
    console.log("=>", session)
    sessionid = session.sessionid;
    dark = session.dark;

  }
  catch (x) {
    console.log("error fetching sessionid", x);
  }
  console.log("sessionid", sessionid);

  const userId = '';
  let fallback: { [key: string]: any } = {}; // Add index signature
  const leaguesKey = { type: "leagues" };
  fallback[unstable_serialize(leaguesKey)] = fetchLeagues(leaguesKey);
  let headerslist = headers();
  let { tab="", fbclid, utm_content, view = "mentions", id, story }:
    { fbclid: string, utm_content: string, view: string, tab: string, id: string, story: string } = searchParams as any;
  //let { userId }: { userId: string | null } = getAuth(context.req);
  let findexarxid = id || "";
  let pagetype = "league";
  let league = "";
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
  if (findexarxid) {  // if a mention story is opened
    calls.push(await fetchMention({ type: "AMention", findexarxid }));
    calls.push(await fetchMetaLink({ func: "meta", findexarxid, long: 1 }));
  }
  if (story) { // if a digest story is opened
    calls.push(await fetchSlugStory({ type: "ASlugStory", slug: story }));
  }
 
  if (tab == 'fav' && view == 'mentions') { //favorites
    if(!story&&!findexarxid)
    calls.push(await fetchFavorites({ userId, sessionid, league, page: 0 }));
  }
  if (view == 'my fantasy team' || view == 'mentions') { //my feed
    if(!story&&!findexarxid)
    calls.push(await fetchMyTeam({ userId, sessionid, league }));
  }
  if (tab == 'myfeed' || view == 'mentions') { //my feed
    console.log("TAB=myfeed")
    if(!story&&!findexarxid)
    calls.push(await fetchMyFeed({ userId, sessionid, league }));
  }
  console.log("view:============>>>>>>>", view, tab, league)
  if (view == 'mentions' && tab != 'myfeed' && tab != 'fav') { //stories
    console.log("fetchStories",JSON.stringify({userId,sessionid,league}))
    if(!story&&!findexarxid)
    calls.push(await fetchStories({ userId, sessionid, league }));
  }
  await fetchData(t1, fallback, calls);
  //console.log("final fallback:", fallback);

  return (
    <SWRProvider value={{ fallback }}>
      <main className="w-full h-full" >
        <SPALayout dark={dark||0} view={view} tab={tab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} isMobile={isMobile} league="" story={story} findexarxid={findexarxid} pagetype={pagetype} />
      </main>
    </SWRProvider>
  );
}

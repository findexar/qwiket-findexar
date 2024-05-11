
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


import { getLeagues } from '@/lib/api';
import { isbot } from '@/lib/is-bot';

import { ASlugStoryKey } from '@/lib/api';
import SPALayout from '@/components/spa';

import fetchData from '@/lib/fetchers/fetch-data';
//import { isbot } from '@/lib/isbot.js';
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
    /* if(!session||!session.sessionid){
        const resp=await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/init-session`,{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({})
        });
        const respJson=await resp.json();
        session=respJson.session;
     }*/
   return session;
}
  const t1 = new Date().getTime();
  //console.log("entered root page", t1)
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
    calls.push(fetchMention({ type: "AMention", findexarxid }));
    calls.push(fetchMetaLink({ func: "meta", findexarxid, long: 1 }));
  }
  if (story) { // if a digest story is opened
    calls.push(fetchSlugStory({ type: "ASlugStory", slug: story }));
  }
 /* if (!isMobile || view == 'my team') { // if my team roster is opened
    console.log("my team=>",)
    calls.push(fetchMyTeam({ userId, sessionid, league }));
  }*/
  if (tab == 'fav' && view == 'mentions') { //favorites
    calls.push(await fetchFavorites({ userId, sessionid, league, page: 0 }));
  }
  if (view == 'my team' || view == 'mentions') { //my feed
    calls.push(await fetchMyTeam({ userId, sessionid, league }));
  }
  if (tab == 'myfeed' || view == 'mentions') { //my feed
    console.log("TAB=myfeed")
    calls.push(await fetchMyFeed({ userId, sessionid, league }));
  }
  console.log("view:============>>>>>>>", view, tab, league)
  if (view == 'mentions' && tab != 'myfeed' && tab != 'fav') { //stories
    console.log("fetchStories",JSON.stringify({userId,sessionid,league}))
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

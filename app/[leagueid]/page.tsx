import { cookies, headers } from "next/headers";

import { revalidatePath } from "next/cache";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";
import {SWRConfig,unstable_serialize } from 'swr'
import { unstable_serialize as us } from 'swr/infinite';
import { getAuth, buildClerkProps } from "@clerk/nextjs/server";

import { clerkClient } from "@clerk/nextjs";
import { SWRProvider } from '@/app/swr-provider'

import {initSessionClient} from '@/app/client';

import fetchMyTeam from '@/lib/fetchers/myteam';
import fetchMyFeed from '@/lib/fetchers/myfeed';
import fetchLeagues from '@/lib/fetchers/leagues';
import fetchFavorites from '@/lib/fetchers/favorites';
import fetchSession from '@/lib/fetchers/session';
import fetchSlugStory from '@/lib/fetchers/slug-story';
import fetchMention from '@/lib/fetchers/mention';
import fetchMetaLink from '@/lib/fetchers/meta-link';
import fetchStories from '@/lib/fetchers/stories';
import fetchLeagueTeams from '@/lib/fetchers/league-teams';

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
  params: { leagueid: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
 
  const t1 = new Date().getTime();
  //console.log("entered root page", t1)
  let sessionid="";
  let dark=0;
  try {
      const session = await fetchSession();
      //console.log("=>",session)
      sessionid=session.sessionid;
      dark = session.dark;
  }
  catch (x) {
    console.log("error fetching sessionid", x);
  }
  console.log("sessionid", sessionid);
  console.log("==============================================*****===>")
  const userId = '';
  let fallback: { [key: string]: any } = {}; // Add index signature
  const leaguesKey={type:"leagues"};
  fallback[unstable_serialize(leaguesKey)] = fetchLeagues(leaguesKey);
  let headerslist = headers();
  let { tab, fbclid, utm_content, view = "mentions", id, story }:
    { fbclid: string, utm_content: string, view: string, tab: string, id: string, story: string } = searchParams as any;
  //let { userId }: { userId: string | null } = getAuth(context.req);
  let findexarxid = id || "";
  let pagetype = "league";
  let league = params.leagueid.toUpperCase();
  console.log("league->",league)
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
  console.log("VIEW:", view,isMobile)
  if (view == 'home')
    view = 'mentions';
  let calls: { key: any, call: Promise<any> }[] = [];

  /**
   * Fill an array of fetch promises for parallel execution
   * note: view - only on mobile, tab - on both
   * 
   */
  console.log("***> view,tab",view,tab)
  calls.push(await fetchLeagueTeams({ league }));
  if (findexarxid) {  // if a mention story is opened
    calls.push(await fetchMention({ type: "AMention", findexarxid }));
    calls.push(await fetchMetaLink({ func: "meta", findexarxid, long: 1 }));
  }
  if (story) { // if a digest story is opened
    calls.push(await fetchSlugStory({ type: "ASlugStory", slug: story }));
  }
  /*if (!isMobile || view == 'my team') { // if my team roster is opened
    console.log("my team=>",)
    calls.push(await fetchMyTeam({ userId, sessionid, league }));
  }*/
  if (tab == 'fav' && view == 'mentions') { //favorites
    calls.push(await fetchFavorites({ userId, sessionid, league, page: 0 }));
  }
  if (view == 'my team' || view == 'mentions') { //my feed
    console.log("GET MY TEAM")
    calls.push(await fetchMyTeam({ userId, sessionid, league }));
  }
  if (tab == 'myfeed' || view == 'mentions') { //my feed
    console.log("TAB=myfeed")
    calls.push(await fetchMyFeed({ userId, sessionid, league }));
  }
  if (view == 'mentions'&&tab!='myteam'&&tab!='fav') { //stories
    calls.push(await fetchStories({ userId, sessionid, league}));
  }
  await fetchData(t1, fallback, calls);
 // console.log("final fallback:",fallback)
  return (
    <SWRProvider value={{ fallback }}>
      <main className="w-full h-full" >
      <SPALayout dark={dark} view={view} tab={tab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} isMobile={isMobile}  story={story} findexarxid ={findexarxid} league={league} pagetype={pagetype}/>
      </main>
      </SWRProvider>
      );
}

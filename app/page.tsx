import Image from "next/image";
import { cookies,headers } from "next/headers";
import { unstable_serialize } from 'swr'
import { unstable_serialize as us } from 'swr/infinite';
import { getAuth, buildClerkProps } from "@clerk/nextjs/server";
import { getIronSession } from "iron-session";
import { clerkClient } from "@clerk/nextjs";
import { SWRProvider } from './swr-provider'
import fetchMyTeam from '@/lib/server-fetch/myteam';
import fetchLeagues from '@/lib/server-fetch/leagues';
import fetchFacorites from '@/lib/server-fetch/favorites';
import fetchSessionId from '@/lib/server-fetch/sessionid';
import fetchSlugStory from '@/lib/server-fetch/slug-story';
import {getLeagues} from '@/lib/api';
import {isbot} from '@/lib/is-bot';

import { ASlugStoryKey } from '@/lib/api';


import fetchData from '@/lib/server-fetch/fetch-data';
//import { isbot } from '@/lib/isbot.js';
export default async function Page({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const sessionId = await fetchSessionId();
  const userId='';
  let fallback = {
    sessionId,
    userId,
    leagues:getLeagues(),
  }
  let headerslist=headers();
  let { tab, fbclid, utm_content, view = "mentions", id, story }:
    { fbclid: string, utm_content: string, view: string, tab: string, id: string, story: string } = searchParams as any;
  //let { userId }: { userId: string | null } = getAuth(context.req);
  let findexarxid = id || "";
  let pagetype = "league";
  let league="";
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
  console.log("VIEW:", view)
  if (view == 'home')
    view = 'mentions';
  let calls: { key: any, call: Promise<any> }[] = [];
  if (findexarxid) {
    amention = getAMention(getAMentionKey);
    metaLink = getMetaLink(metalinkKey);
    calls.push({ key: unstable_serialize(getAMentionKey), call: amention });
    calls.push({ key: unstable_serialize(metalinkKey), call: metaLink });
}
  if (story) {
    calls.push( fetchSlugStory({type: "ASlugStory", slug: story, noLoad: story == "" ? true : false}) );
  }
 
  if (!isMobile||view=='my team') {
      calls.push(fetchMyTeam({userId,sessionId,league}));
  }

  if (tab == 'fav' || tab == 'myteam') {
    if (view == 'mentions') {

    }
  }
  return (
    <SWRProvider value={fallback}>
      <main className="flex min-h-screen flex-col items-center justify-between p-24" >
        <h1>{JSON.stringify(searchParams)}</h1>
      </main>
    </SWRProvider>
  );
}

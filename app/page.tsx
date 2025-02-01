'use server';
import { headers } from "next/headers";
import { unstable_serialize } from 'swr';
import { auth, currentUser } from "@clerk/nextjs/server";
import { SWRProvider } from '@/app/swr-provider';

import fetchLeagues from '@lib/server-actions/leagues';
import fetchSession from '@lib/server-actions/session';
import fetchSlugStory from '@lib/server-actions/slug-story';
import fetchMention from '@lib/server-actions/mention';
import fetchMetaLink from '@lib/server-actions/meta-link';
import fetchStories from '@lib/server-actions/stories';
import fetchChat from "@lib/server-actions/chat";
import { getASlugStory } from '@lib/server-actions/slug-story';
import { isbot } from '@/lib/is-bot';
import SPALayout from '@/components/spa';
import { getAMention } from '@lib/server-actions/mention';
import fetchData from '@lib/server-actions/fetch-data';
import type { Metadata, ResolvingMetadata } from 'next';
import fetchUserAccount from "@lib/server-actions/account";
import { notFound } from 'next/navigation';

// Migration to Next.js 15
type Params = Promise<{}>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(
  { params, searchParams }: { params: Params, searchParams: SearchParams },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Read route params
  console.log("META searchParams", searchParams);
  const { id, story, tab, view, m, s = '0' } = await searchParams as any;
  let findexarxid = id || "";

  let amention, astory;
  if (findexarxid) {
    amention = await getAMention({ type: "AMention", findexarxid });
  }
  if (story) {
    astory = await getASlugStory({ type: "ASlugStory", slug: story });
  }
  if (m) {
    astory = await getASlugStory({ type: "ASlugStory", m });
  }

  const { summary: amentionSummary = "", league: amentionLeague = "", type = "", team: amentionTeam = "", teamName: amentionTeamName = "", name: amentionPlayer = "", image: amentionImage = "", date: amentionDate = "" } = amention || {};
  let {
    title: astoryTitle = "",
    site_name: astorySite_Name = "",
    authors: astoryAuthors = "",
    digest: astoryDigest = "",
    image: astoryImage = "",
    ogimage: astoryOgImage = "",
    createdTime: astoryDate = "",
    mentions: mentions = [],
    image_width = 1200,
    image_height = 1200
  } = astory || {};

  const astoryImageOgUrl = astoryOgImage ? astoryOgImage : astoryImage ? `${process.env.NEXT_PUBLIC_SERVER}/api/og.png/${encodeURIComponent(astoryImage)}/${encodeURIComponent(astorySite_Name)}/${image_width}/${image_height}` : ``;

  // Prepare meta data for amention
  let ogUrl = '';
  if (amention && amentionLeague && amentionTeam && amentionPlayer) {
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}/team/${amentionTeam}/player/${amentionPlayer}?id=${findexarxid}`;
  } else if (amention && amentionLeague && amentionTeam) {
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}/team/${amentionTeam}?id=${findexarxid}`;
  } else if (amention && amentionLeague) {
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}?id=${findexarxid}`;
  } else if (amention) {
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/?id=${findexarxid}`;
  } else {
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}`;
  }

  let ogTarget = '';
  if (amention && amentionLeague && amentionTeam && amentionPlayer && type == 'person') {
    ogTarget = `${amentionPlayer} of ${amentionTeamName}`;
  } else if (amention && amentionLeague && amentionTeam) {
    ogTarget = `${amentionTeamName} on ${process.env.NEXT_PUBLIC_APP_NAME}`;
  }

  let ogDescription = amentionSummary || "Sport News Monitor and AI Chat.";
  let ogImage = astoryImageOgUrl || '/q-logo-og-1200.png';
  if (!astoryImageOgUrl) image_height = 630;
  let ogTitle = ogTarget || `Qwiket AI`;
  if (astory) {
    ogUrl = story ? `${process.env.NEXT_PUBLIC_SERVER}/?story=${story}` : `${process.env.NEXT_PUBLIC_SERVER}/`;
    ogTitle = astoryTitle;
    ogDescription = astoryDigest.replaceAll('<p>', '').replaceAll('</p>', "\n\n");
    ogImage = astoryImageOgUrl;
  }
  const noindex = 1;

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
    robots: (noindex === 1 || s !== "1") ? 'noindex, follow' : 'index, follow',
    alternates: {
      canonical: ogUrl,
    },
    icons: {
      icon: [
        { url: "/q-logo-light-42.png", media: "(prefers-color-scheme: light)" },
        { url: "/q-logo-dark-42.png", media: "(prefers-color-scheme: dark)" }
      ],
      shortcut: [
        { url: "/q-logo-light-512.png", media: "(prefers-color-scheme: light)" },
        { url: "/q-logo-dark-512.png", media: "(prefers-color-scheme: dark)" }
      ],
    },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Params,
  searchParams: SearchParams
}) {
  console.log("searchParams=>");
  let { id, story, tab = "all", fbclid = "", utm_content = "", view = "mentions", m, cid = "", aid = "" } = await searchParams as any;
  const t1 = new Date().getTime();
  let headerslist = await headers();
  //console.log("headerslist", headerslist);
  const ua = headerslist.get('user-agent') || "";
  const botInfo = isbot({ ua });
  let bot = botInfo.bot || ua.match(/vercel|spider|crawl|curl|Googlebot/i);
  if (!ua) {
    bot = true;
  }
  let userId = "";
  try {
    let { userId: authId } = !bot ? await auth() : { userId: "" };
    userId = authId || "";
  } catch (x) {
    console.log("error fetching userId", x);
  }
  if (!userId) {
    userId = "";
  }
  let sessionid = "";
  let dark = 0;
  try {
    const session = await fetchSession();
    sessionid = session.sessionid;
    dark = session.dark;
  } catch (x) {
    console.log("error fetching sessionid", x);
  }

  let fallback: { [key: string]: any } = {};
  const leaguesKey = { type: "leagues" };
  fallback[unstable_serialize(leaguesKey)] = fetchLeagues(leaguesKey);

  let findexarxid = id || "";
  let pagetype = "home";

  let isMobile = Boolean(ua.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  ));
  view = view.toLowerCase();
  if (view == '' || view == 'main' || view == 'feed' || view == 'home') {
    view = 'mentions';
  }
  let calls: { key: any, call: Promise<any> }[] = [];

  let userInfo: { email: string } = { email: "" };
  if (userId) {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    userInfo.email = email || '';
  }
  if (userId) {
    calls.push(await fetchUserAccount({ type: "user-account", email: userInfo.email, bot: bot || false }, userId, sessionid, utm_content, ua, cid, aid));
  }

  if (findexarxid) {
    calls.push(await fetchMention({ type: "AMention", findexarxid }));
    calls.push(await fetchMetaLink({ func: "meta", findexarxid, long: 1 }));
  }

  if (story) {
    calls.push(await fetchSlugStory({ type: "ASlugStory", slug: story }));
  }
  if (m) {
    calls.push(await fetchSlugStory({ type: "ASlugStory", m }));
  }
  if (view == 'mentions' && tab != 'myteam' && tab != 'fav' && tab != 'chat') {
    if (!story && !findexarxid) {
      calls.push(await fetchStories({ league: "", userId, sessionid, type: tab == 'podcasts' ? 'v' : '' }));
    }
  }
  if (tab == 'chat') {
    calls.push(await fetchChat({ email: userInfo.email, type: "create-chat", league: "", teamid: "", athleteUUId: "", fantasyTeam: false, chatUUId: "" }, userId, sessionid));
  }
  console.log("*** *** *** ==> home SSR", tab, view);
  await fetchData(t1, fallback, calls);
  // console.log("*** *** *** ==> home SSR AFTER FETCH DATA", JSON.stringify(fallback));
  return (
    <SWRProvider value={{ fallback }}>
      <main className="w-full h-full">
        <SPALayout userInfo={userInfo} dark={dark} view={view} tab={tab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} bot={bot || false} isMobile={isMobile} story={story} findexarxid={findexarxid} m={m} pagetype={pagetype} ua={ua} />
      </main>
    </SWRProvider>
  );
}

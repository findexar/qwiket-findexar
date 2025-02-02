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
import fetchLeagueTeams from '@lib/server-actions/league-teams';
import fetchStories from '@lib/server-actions/stories';
import fetchLeagueMentions from '@lib/server-actions/league-mentions';
import fetchChat from "@lib/server-actions/chat";
import { getASlugStory } from '@lib/server-actions/slug-story';
import { isbot } from '@/lib/is-bot';
import SPALayout from '@/components/spa';
import { getAMention } from '@lib/server-actions/mention';
import fetchData from '@lib/server-actions/fetch-data';
import type { Metadata, ResolvingMetadata } from 'next';
import fetchUserAccount from "@lib/server-actions/account";
import { notFound, redirect } from 'next/navigation';
import { ssrPrepParams } from "@/lib/ssr";

// Migration to Next.js 15
type Params = Promise<{ leagueid: string }>;
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export async function generateMetadata(
  { params, searchParams }: { params: Params, searchParams: SearchParams },
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Read route params
  const { leagueid } = await params;
  const { id, story, tab, view, m, s = '0' } = await searchParams as any;
  let findexarxid = id || "";
  let league = leagueid.toUpperCase();
  if (!['NFL', 'MLB', 'NBA', 'NHL'].includes(league.toUpperCase())) {
    console.log("==> SSR PAGE.TSX FOUND invalid league");
    notFound();
  }

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
    ogUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/${league}?${story ? `story=${story}` : ``}` : `${process.env.NEXT_PUBLIC_SERVER}/?${story ? `story=${story}` : ``}`;
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
  searchParams
}: {
  params: Params,
  searchParams: SearchParams
}) {


  let { leagueid: leagueidParam } = await params;
  let { tab: tabParam = "", rtab: rtabParam = "", fbclid: fbclidParams = "", utm_content: utm_contentParams = "", view: viewParams = "", id: idParams = "", story: storyParams = "", m: mParams = "", cid: cidParams = "", aid: aidParams = "" }:
    { fbclid: string, utm_content: string, view: string, tab: string, rtab: string, id: string, story: string, m: string, cid: string, aid: string } = await searchParams as any;
  const { userInfo, dark, view, tab, rtab, fallback, fbclid, utm_content, bot, isMobile, story, findexarxid, m, league, pagetype, teamid, name, athleteUUId, teamName, ua } =
    await ssrPrepParams({ leagueid: leagueidParam, teamid: '', name: '', athleteUUId: '' }, { tab: tabParam, rtab: rtabParam, fbclid: fbclidParams, utm_content: utm_contentParams, view: viewParams, id: idParams, story: storyParams, m: mParams, cid: cidParams, aid: aidParams });

  return (
    <SWRProvider value={{ fallback }}>
      <main className="w-full h-full" >
        <SPALayout userInfo={userInfo} dark={dark} view={view} tab={tab} rtab={rtab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} bot={bot || false} isMobile={isMobile} story={story} findexarxid={findexarxid} m={m} league={league} pagetype={pagetype} teamid={teamid} name={name} athleteUUId={athleteUUId} teamName={teamName} ua={ua} />
      </main>
    </SWRProvider>
  );
}
import { headers } from "next/headers";
import { unstable_serialize } from 'swr';
import { auth, currentUser } from "@clerk/nextjs/server";
import { SWRProvider } from '@/app/swr-provider';

import fetchMyTeam from '@/lib/fetchers/my-team-actions';
import fetchMyFeed from '@/lib/fetchers/myfeed';
import fetchLeagues from '@/lib/fetchers/leagues';
import fetchFavorites from '@/lib/fetchers/favorites';
import fetchSession from '@/lib/fetchers/session';
import fetchSlugStory from '@/lib/fetchers/slug-story';
import fetchMention from '@/lib/fetchers/mention';
import fetchMetaLink from '@/lib/fetchers/meta-link';
import fetchStories from '@/lib/fetchers/stories';
import fetchLeagueTeams from '@/lib/fetchers/league-teams';
import fetchUserAccount from "@/lib/fetchers/account";
import { getASlugStory } from '@/lib/fetchers/slug-story';
import { isbot } from '@/lib/is-bot';
import { getAMention } from '@/lib/fetchers/mention';
import SPALayout from '@/components/spa';
import fetchData from '@/lib/fetchers/fetch-data';
import type { Metadata, ResolvingMetadata } from 'next';
import fetchChat from "@/lib/fetchers/chat";
import promiseUser from "@/lib/fetchers/account";
type Props = {
  params: { leagueid: string };
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  let {
    id,
    story
  }: {
    fbclid: string,
    utm_content: string,
    view: string,
    tab: string,
    id: string,
    story: string
  } = searchParams as any;

  let findexarxid = id || "";
  let league = params.leagueid.toUpperCase();
  let amention, astory;

  if (findexarxid) {
    amention = await getAMention({ type: "AMention", findexarxid });
  }

  if (story) {
    astory = await getASlugStory({ type: "ASlugStory", slug: story });
  }

  const {
    summary: amentionSummary = "",
    league: amentionLeague = "",
    type = "",
    team: amentionTeam = "",
    teamName: amentionTeamName = "",
    name: amentionPlayer = "",
    image: amentionImage = "",
    date: amentionDate = ""
  } = amention || {};

  const {
    title: astoryTitle = "",
    site_name: astorySite_Name = "",
    authors: astoryAuthors = "",
    digest: astoryDigest = "",
    image: astoryImage = "",
    createdTime: astoryDate = "",
    mentions: mentions = [],
    image_width = 0,
    image_height = 0
  } = astory || {};

  const astoryImageOgUrl = astoryImage ? `${process.env.NEXT_PUBLIC_SERVER}/api/og.png/${encodeURIComponent(astoryImage)}/${encodeURIComponent(astorySite_Name)}/${image_width}/${image_height}` : ``;

  let ogUrl = '';
  if (amention) {
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}/${amentionTeam}/${amentionPlayer}?id=${findexarxid}`;
  } else {
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}`;
  }

  let ogTarget = '';
  if (amention && type == 'person') {
    ogTarget = `${amentionPlayer} of ${amentionTeamName}`;
  } else if (amention) {
    ogTarget = `${amentionTeamName} on ${process.env.NEXT_PUBLIC_APP_NAME}`;
  }
  let ogImage = astoryImageOgUrl || '/q-logo-og-1200.png';
  let ogTitle = ogTarget || `${process.env.NEXT_PUBLIC_APP_NAME} Sports AI`;
  let ogDescription = amentionSummary || "Sport News Monitor and AI Chat.";
  if (astory) {
    ogUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/${league}?${story ? `story=${story}` : ``}` : `${process.env.NEXT_PUBLIC_SERVER}/?${story ? `story=${story}` : ``}`;
    ogTitle = astoryTitle;
    ogDescription = astoryDigest.replaceAll('<p>', '').replaceAll('</p>', "\n\n");
    ogImage = astoryImageOgUrl;
  }

  const indexable = findexarxid || story;
  let noindex = +(process.env.NEXT_PUBLIC_NOINDEX || indexable ? "0" : "1");

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
  params: { leagueid: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const t1 = new Date().getTime();
  let headerslist = headers();
  const ua = headerslist.get('user-agent') || "";

  const botInfo = isbot({ ua });
  let bot = botInfo.bot || ua.match(/vercel|spider|crawl|curl|Googlebot/i);
  if (!ua) {
    bot = true;
  }
  let userId = "";
  try {
    let { userId: authId } = !bot ? auth() : { userId: "" };
    userId = authId || "";
  } catch (x) {
    console.log("error fetching userId", x);
  }
  userId = userId || "";
  console.log("userId", userId);
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

  let {
    tab,
    fbclid = "",
    utm_content = "",
    view = "mentions",
    id,
    story,
    prompt = '',
    promptUUId = '',
    cid = '',
    aid = ''
  }: {
    fbclid: string,
    utm_content: string,
    view: string,
    tab: string,
    id: string,
    story: string,
    prompt: string,
    promptUUId: string,
    cid: string,
    aid: string
  } = searchParams as any;

  let findexarxid = id || "";
  let pagetype = "league";
  let league = params.leagueid.toUpperCase();
  /// console.log("league->", league);
  // console.log("utm_content->", utm_content);

  let isMobile = Boolean(ua.match(
    /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
  ));
  view = view.toLowerCase();
  if (view == 'main' || view == 'feed' || view == 'home') {
    view = 'mentions';
  }
  //console.log("VIEW:", view, isMobile);
  let calls: { key: any, call: Promise<any> }[] = [];

  //console.log("***> view,tab", view, tab);
  if (!story && !findexarxid) {
    calls.push(await fetchLeagueTeams({ league }));
  }

  let userInfo: { email: string } = { email: "" };
  if (userId) {
    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress;
    userInfo.email = email || '';
  }
  //console.log("==> isBot", bot);
  //console.log("==> ua", ua);
  if (!bot) {
    // console.log("SSR !isBot adding ==> fetchUserAccount", { type: "user-account", email: userInfo.email, bot: bot || false }, userId, sessionid, utm_content, ua, cid, aid);
    calls.push(await fetchUserAccount({ type: "user-account", email: userInfo.email, bot: bot || false }, userId, sessionid, utm_content, ua, cid, aid));
  }

  if (findexarxid) {
    calls.push(await fetchMention({ type: "AMention", findexarxid }));
    calls.push(await fetchMetaLink({ func: "meta", findexarxid, long: 1 }));
  }
  if (story) {
    calls.push(await fetchSlugStory({ type: "ASlugStory", slug: story }));
  }

  if (tab == 'fav' && view == 'mentions') {
    if (!story && !findexarxid) {
      calls.push(await fetchFavorites({ userId, sessionid, league, page: 0 }));
    }
  }
  if (view == 'my team' || view == 'mentions') {
    //console.log("GET MY TEAM");
    if (!story && !findexarxid) {
      calls.push(await fetchMyTeam({ userId, sessionid, league }));
    }
  }
  if (tab == 'myfeed' || view == 'mentions') {
    //  console.log("TAB=myfeed");
    if (!story && !findexarxid) {
      calls.push(await fetchMyFeed({ userId, sessionid, league }));
    }
  }
  if (view == 'mentions' && tab != 'myteam' && tab != 'fav') {
    if (!story && !findexarxid) {
      calls.push(await fetchStories({ userId, sessionid, league }));
    }
  }
  //  console.log("tab,view", tab, view);
  if (tab == 'chat') {
    // console.log("==> fetchChat", { type: "create-chat", league: league.toUpperCase(), teamid: "", athleteUUId: "", fantasyTeam: false, chatUUId: "" });
    //email is to break the SWR cache when the user switches accounts
    calls.push(await fetchChat({ email: userInfo.email, type: "create-chat", league: league.toUpperCase(), teamid: "", athleteUUId: "", fantasyTeam: false, chatUUId: "" }, userId, sessionid));

  }
  // console.log("==> SSRfetchUserAccount", JSON.stringify({ type: "user-account", userId, sessionid, utm_content, ua, bot }));

  await fetchData(t1, fallback, calls);

  return (
    <SWRProvider value={{ fallback }}>
      <main className="w-full h-full">
        <SPALayout userInfo={userInfo} dark={dark} view={view} tab={tab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} bot={bot || false} isMobile={isMobile} story={story} findexarxid={findexarxid} league={league} pagetype={pagetype} prompt={prompt} promptUUId={promptUUId} />
      </main>
    </SWRProvider>
  );
}

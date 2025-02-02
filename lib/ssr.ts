'use server';
import { headers } from "next/headers";
import { unstable_serialize } from 'swr'
import { auth, currentUser } from "@clerk/nextjs/server";
import { SWRProvider } from '@/app/swr-provider'

import fetchLeagues from '@lib/server-actions/leagues';
import fetchSession from '@lib/server-actions/session';
import fetchSlugStory from '@lib/server-actions/slug-story';
import fetchMention from '@lib/server-actions/mention';
import fetchMetaLink from '@lib/server-actions/meta-link';

import fetchLeagueTeams from '@lib/server-actions/league-teams';
import fetchPlayerMentions from '@lib/server-actions/player-mentions';
import fetchTeamPlayers from '@lib/server-actions/team-players';
import fetchStories from '@lib/server-actions/stories';
import { getASlugStory } from '@lib/server-actions/slug-story';
import { isbot } from '@/lib/is-bot'
import SPALayout from '@/components/spa';
import { getAMention } from '@lib/server-actions/mention';
import fetchData from '@lib/server-actions/fetch-data';
import type { Metadata, ResolvingMetadata } from 'next'
import fetchChat from "@lib/server-actions/chat";
import fetchUserAccount from "@lib/server-actions/account";
import { notFound } from 'next/navigation';
import fetchLeagueMentions from '@lib/server-actions/league-mentions';
import fetchTeamMentions from '@lib/server-actions/team-mentions';
import fetchMyTeam from '@lib/server-actions/my-team-actions';
import fetchMyFeed from '@lib/server-actions/myfeed';
import fetchFavorites from '@lib/server-actions/favorites';
type SSRParams = {
    leagueid?: string;
    teamid?: string;
    name?: string;
    athleteUUId?: string;
}
type SSRSearchParams = {
    fbclid?: string;
    utm_content?: string;
    view?: string;
    tab?: string;
    rtab?: string;
    id?: string;
    story?: string;
    m?: string;
    cid?: string;
    aid?: string;
}
type ssrResult = {
    userInfo: { email: string };
    dark: number;
    view: string;
    tab: string;
    rtab: string;
    fallback: { [key: string]: any };
    fbclid: string;
    utm_content: string;
    bot: boolean;
    isMobile: boolean;
    story: string;
    findexarxid: string;
    m: string;
    league: string;
    pagetype: string;
    teamid: string;
    name: string;
    athleteUUId: string;
    teamName: string;
    ua: string;
}
export const ssrPrepParams = async (params: SSRParams, searchParams: SSRSearchParams): Promise<ssrResult> => {
    let { leagueid = "", teamid = "", name = "", athleteUUId = "" } = params;
    let { tab = "", rtab = "", fbclid = "", utm_content = "", view = "", id = "", story = "", m = "", cid = "", aid = "" }:
        { fbclid: string, utm_content: string, view: string, tab: string, rtab: string, id: string, story: string, m: string, cid: string, aid: string } = await searchParams as any;
    console.log("********** ssrPrepParams", JSON.stringify({ params, searchParams }));
    const t1 = new Date().getTime();
    let headerslist = await headers();
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
    }
    catch (x) {
        console.log("error fetching sessionid", x);
    }
    let findexarxid = id || "";
    let pagetype = athleteUUId ? "player" : teamid ? "team" : "league";
    let league = leagueid.toUpperCase();
    if (league && !['NFL', 'MLB', 'NBA', 'NHL', ''].includes(league.toUpperCase())) {
        console.log("==> SSR PAGE.TSX FOUND invalid league");
        notFound();
    }
    name = name.replaceAll('_', ' ').replaceAll('%20', ' ').replace('!', '.');;

    let isMobile = Boolean(ua.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    ))
    view = view.toLowerCase();
    if (view == '' || view == 'main' || view == 'feed' || view == 'home')
        view = 'mentions';
    let calls: { key: any, call: Promise<any> }[] = [];

    /**
     * Fill an array of fetch promises for parallel execution
     * note: view - only on mobile, tab - on both
     * 
     */
    calls.push(await fetchLeagueTeams({ league }));

    let userInfo: { email: string } = { email: "" };
    if (userId) {
        const user = await currentUser();
        const email = user?.emailAddresses[0]?.emailAddress;
        userInfo.email = email || '';
    }
    if (userId) {
        calls.push(await fetchUserAccount({ type: "user-account", email: userInfo.email, bot: bot || false }, userId, sessionid, utm_content, ua, cid, aid));
    }


    if (findexarxid) {  // if a mention story is opened
        calls.push(await fetchMention({ type: "AMention", findexarxid }));
        calls.push(await fetchMetaLink({ func: "meta", findexarxid, long: 1 }));
    }
    if (story) { // if a digest story is opened
        calls.push(await fetchSlugStory({ type: "ASlugStory", slug: story }));
    }
    if (m) {
        calls.push(await fetchSlugStory({ type: "ASlugStory", m }));
    }
    if (!story && !findexarxid && !m)
        calls.push(await fetchTeamPlayers({ userId, sessionid, teamid }));

    //if (!story && !findexarxid && !m)
    //   calls.push(await fetchPlayerMentions({ userId, sessionid, league, teamid, name, athleteUUId }));

    /*if (tab == 'chat') {
        calls.push(await fetchChat({ type: "create-chat", league, teamid, athleteUUId, fantasyTeam: false, chatUUId: "" }, userId, sessionid));
    }*/
    // console.log("tab,view", tab, view);
    if (tab == 'chat') {
        calls.push(await fetchChat({ email: userInfo.email, type: "create-chat", league: league.toUpperCase(), teamid: "", athleteUUId: "", fantasyTeam: false, chatUUId: "" }, userId, sessionid));
        //TODO: get credits
    }
    console.log("*** *** *** ==> player SSR", teamid, athleteUUId, tab, view);
    if (view == 'mentions' && tab != 'myfeed' && tab != 'fav') {
        if (!story && !findexarxid) {
            console.log("**********fetchStories", userId, sessionid, league);
            calls.push(await fetchStories({ userId, sessionid, league, teamid, athleteUUId, type: tab == 'podcasts' ? 'v' : '' }));

            //calls.push(await fetchStories({ userId, sessionid, league }));
        }
    }
    if ((!rtab && !teamid && !athleteUUId || tab == 'mentions')) {
        if (!teamid && !athleteUUId)
            calls.push(await fetchLeagueMentions({ userId, sessionid, league }));
        else if (teamid && !athleteUUId)
            calls.push(await fetchTeamMentions({ userId, sessionid, league, teamid }));
        else if (teamid && athleteUUId)
            calls.push(await fetchPlayerMentions({ userId, sessionid, league, teamid, name, athleteUUId }));
    }
    if (!teamid && !athleteUUId && (tab == 'myteam' || view == 'my team')) {
        calls.push(await fetchMyTeam({ userId, sessionid, league }));
    }
    if (tab == 'myfeed' || (rtab == 'myfeed')) {
        console.log("********** fetchMyFeed", userId, sessionid, league);
        calls.push(await fetchMyFeed({ userId, sessionid, league }));
    }
    if (tab == 'fav' || rtab == 'fav') {
        console.log("********** fetchFav", userId, sessionid, league);
        calls.push(await fetchFavorites({ userId, sessionid, league }));
    }
    /* SSR FETCHES */

    let fallback: { [key: string]: any } = {}; // Add index signature
    const leaguesKey = { type: "leagues" };
    fallback[unstable_serialize(leaguesKey)] = fetchLeagues(leaguesKey);

    await fetchData(t1, fallback, calls);

    const key = { type: "league-teams", league };

    let teams = fallback[unstable_serialize(key)];
    let teamName = teams?.find((x: any) => x.id == teamid)?.name;
    console.log("==> common SSR", JSON.stringify({ teamName, teamid, athleteUUId, tab, view, fallback }));
    return { userInfo, dark, view, tab, rtab, fallback, fbclid, utm_content, bot, isMobile, story, findexarxid, m, league, pagetype, teamid, name, athleteUUId, teamName, ua };
}
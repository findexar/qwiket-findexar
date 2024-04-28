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
    params: { leagueid: string, teamid: string }
    searchParams: { [key: string]: string | string[] | undefined }
}) {

    const t1 = new Date().getTime();
    console.log("league,team", params.leagueid, params.teamid)
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
    console.log(" TEAM ==========*****===>")
    const userId = '';
    let fallback: { [key: string]: any } = {}; // Add index signature
    const leaguesKey = { type: "leagues" };
    fallback[unstable_serialize(leaguesKey)] = fetchLeagues(leaguesKey);
    let headerslist = headers();
    let { tab, fbclid, utm_content, view = "mentions", id, story }:
        { fbclid: string, utm_content: string, view: string, tab: string, id: string, story: string } = searchParams as any;
    //let { userId }: { userId: string | null } = getAuth(context.req);
    let findexarxid = id || "";
    let pagetype = "team";
    let league = params.leagueid.toUpperCase();
    let teamid = params.teamid;
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
        calls.push(fetchMention({ type: "AMention", findexarxid }));
        calls.push(fetchMetaLink({ func: "meta", findexarxid, long: 1 }));
    }
    if (story) { // if a digest story is opened
        calls.push(fetchSlugStory({ type: "ASlugStory", slug: story }));
    }
    if (!isMobile || view == 'my team') { // if my team roster is opened
        console.log("my team=>",)
        calls.push(fetchMyTeam({ userId, sessionid, league }));
    }
    if (tab == 'fav' && view == 'mentions') { //favorites
        calls.push(fetchFavorites({ userId, sessionid, league, page: 0 }));
    }
    if (tab == 'myteam' && view == 'mentions') { //my feed
        calls.push(fetchMyTeam({ userId, sessionid, league }));
    }
    //if (view == 'mentions'&&tab!='myteam'&&tab!='fav') { //stories
    calls.push(await fetchTeamMentions({ userId, sessionid, league, teamid }));
    //}
    await fetchData(t1, fallback, calls);
    // console.log("final fallback:",fallback)
    return (
        <SWRProvider value={{ fallback }}>
            <main className="w-full h-full" >
                <SPALayout dark={dark} view={view} tab={tab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} isMobile={isMobile} story={story} findexarxid={findexarxid} league={league} teamid={teamid} pagetype={pagetype} />
            </main>
        </SWRProvider>
    );
}

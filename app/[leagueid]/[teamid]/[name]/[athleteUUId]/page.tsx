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
import { ssrPrepParams, generateMetadata as ssrGenerateMetadata } from '@lib/ssr';

//migration to Next.js 15
type Params = Promise<{ leagueid: string, teamid: string, name: string, athleteUUId: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
export async function generateMetadata(
    { searchParams }: { searchParams: SearchParams },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const searchParamsSSR = await searchParams as any;
    return ssrGenerateMetadata({ searchParams: searchParamsSSR }, parent);
}
export default async function Page({
    params,
    searchParams
}: {
    params: Params,
    searchParams: SearchParams
}) {


    let { leagueid: leagueidParam, teamid: teamidParam, name: nameParam, athleteUUId: athleteUUIdParam } = await params;
    let { tab: tabParam = "", rtab: rtabParam = "", fbclid: fbclidParams = "", utm_content: utm_contentParams = "", view: viewParams = "", id: idParams = "", story: storyParams = "", m: mParams = "", cid: cidParams = "", aid: aidParams = "" }:
        { fbclid: string, utm_content: string, view: string, tab: string, rtab: string, id: string, story: string, m: string, cid: string, aid: string } = await searchParams as any;
    const { userInfo, dark, view, tab, rtab, fallback, fbclid, utm_content, bot, isMobile, story, findexarxid, m, league, pagetype, teamid, name, athleteUUId, teamName, ua } =
        await ssrPrepParams({ leagueid: leagueidParam, teamid: teamidParam, name: nameParam, athleteUUId: athleteUUIdParam }, { tab: tabParam, rtab: rtabParam, fbclid: fbclidParams, utm_content: utm_contentParams, view: viewParams, id: idParams, story: storyParams, m: mParams, cid: cidParams, aid: aidParams });

    return (
        <SWRProvider value={{ fallback }}>
            <main className="w-full h-full" >
                <SPALayout userInfo={userInfo} dark={dark} view={view} tab={tab} rtab={rtab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} bot={bot || false} isMobile={isMobile} story={story} findexarxid={findexarxid} m={m} league={league} pagetype={pagetype} teamid={teamid} name={name} athleteUUId={athleteUUId} teamName={teamName} ua={ua} />
            </main>
        </SWRProvider>
    );
}

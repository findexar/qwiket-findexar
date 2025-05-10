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
import { ssrPrepParams, generateMetadata as ssrGenerateMetadata, SSRParams, SSRSearchParams } from '@lib/ssr';

//migration to Next.js 15
type Params = Promise<{ leagueid: string, teamid: string, name: string, athleteUUId: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>
export async function generateMetadata(
    { params, searchParams }: { params: Params, searchParams: SearchParams },
    parent: ResolvingMetadata
): Promise<Metadata> {
    const paramsSSR: SSRParams = await params;
    const searchParamsSSR: SSRSearchParams = await searchParams as any;
    return ssrGenerateMetadata({ params: paramsSSR, searchParams: searchParamsSSR }, parent);
}

export default async function Page({
    params,
    searchParams
}: {
    params: Params,
    searchParams: SearchParams
}) {
    const paramsSSR: SSRParams = await params;
    const searchParamsSSR: SSRSearchParams = await searchParams as any;
    const { newSessionToSave, sessionid, page, today, cstory, cm, b, jsonld, prompt, promptUUId, userInfo, dark, view, tab, rtab, fallback, fbclid, utm_content, bot, isMobile, story, findexarxid, m, league, pagetype, teamid, name, athleteUUId, teamName, ua, relatedContent } =
        await ssrPrepParams(paramsSSR, searchParamsSSR);

    return (
        <SWRProvider value={{ fallback }}>
            <main className="w-full h-full" >
                {jsonld && jsonld.length > 0 ? <> <section>
                    {jsonld.map((jsonldItem, index) => (
                        <script
                            key={index}
                            type="application/ld+json"
                            dangerouslySetInnerHTML={{ __html: jsonldItem }}
                        />
                    ))}
                </section>
                    <article>
                        <SPALayout newSessionToSave={newSessionToSave} sessionid={sessionid} today={today} cstory={cstory} cm={cm} b={b} prompt={prompt} promptUUId={promptUUId} userInfo={userInfo} dark={dark} view={view} tab={tab} rtab={rtab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} bot={bot || false} isMobile={isMobile} story={story} findexarxid={findexarxid} m={m} league={league} pagetype={pagetype} teamid={teamid} name={name} athleteUUId={athleteUUId} teamName={teamName} ua={ua} relatedContent={relatedContent || undefined} page={page} />
                    </article>
                </>
                    :
                    <SPALayout newSessionToSave={newSessionToSave} sessionid={sessionid} today={today} cstory={cstory} cm={cm} b={b} prompt={prompt} promptUUId={promptUUId} userInfo={userInfo} dark={dark} view={view} tab={tab} rtab={rtab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} bot={bot || false} isMobile={isMobile} story={story} findexarxid={findexarxid} m={m} league={league} pagetype={pagetype} teamid={teamid} name={name} athleteUUId={athleteUUId} teamName={teamName} ua={ua} relatedContent={relatedContent || undefined} page={page} />
                }
            </main>
        </SWRProvider>
    );
}

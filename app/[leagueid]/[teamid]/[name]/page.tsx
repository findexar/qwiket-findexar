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

//migration to Next.js 15
type Params = Promise<{ leagueid: string, teamid: string, name: string }>
type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>

export default async function Page({
  params,
  searchParams
}: {
  params: Params,
  searchParams: SearchParams
}) {
  notFound();

}

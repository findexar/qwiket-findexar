import Image from "next/image";
import { cookies } from "next/headers";
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
//import { isbot } from '@/lib/isbot.js';
export default async function Page({
  params,
  searchParams,
  }: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
  }) {
    const sessionid = await fetchSessionId();
    let fallback={
      sessionid
    }
    let { tab, fbclid, utm_content, view = "mentions", id, story }:
    { fbclid: string, utm_content: string, view: string, tab: string, id: string, story: string } =searchParams as any;
//let { userId }: { userId: string | null } = getAuth(context.req);
 
  return (
    <SWRProvider value={fallback}>
    <main className="flex min-h-screen flex-col items-center justify-between p-24" >
      <h1>{JSON.stringify(searchParams)}</h1>
      </main>
      </SWRProvider>
  );   
}

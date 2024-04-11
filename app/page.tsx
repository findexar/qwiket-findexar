import Image from "next/image";
import { unstable_serialize } from 'swr'
import { unstable_serialize as us } from 'swr/infinite';
import { getAuth, buildClerkProps } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs";
import { SWRProvider } from './swr-provider'
//import { isbot } from '@/lib/isbot.js';
export default function Page({
  params,
  searchParams,
  }: {
  params: { slug: string }
  searchParams: { [key: string]: string | string[] | undefined }
  }) {


    let { tab, fbclid, utm_content, view = "mentions", id, story }:
    { fbclid: string, utm_content: string, view: string, tab: string, id: string, story: string } =searchParams as any;
//let { userId }: { userId: string | null } = getAuth(context.req);


  return (
    <SWRProvider>
    <main className="flex min-h-screen flex-col items-center justify-between p-24" >
      <h1>{JSON.stringify(searchParams)}</h1>
      </main>
      </SWRProvider>
  );   
}

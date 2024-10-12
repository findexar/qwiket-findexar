'use server';
import { unstable_serialize as us } from 'swr/infinite';
import { StoriesKey } from '@/lib/keys';
import { auth } from "@clerk/nextjs/server";
import fetchSession from './session';

const lake_api = process.env.NEXT_PUBLIC_LAKEAPI
const api_key = process.env.LAKE_API_KEY;;
interface FetchStoriesProps {
    userId: string;
    sessionid: string;
    league: string;
}

const fetchStories = async (key: StoriesKey, userId: string, sessionid: string) => {
    const { league, page } = key;
    const url = `${lake_api}/api/v50/findexar/get-stories?api_key=${api_key}&userid=${userId || ""}&league=${league}&sessionid=${sessionid}&page=${page}`;
    const t1 = Date.now();
    console.log("fetchStories", url);
    const fetchResponse = await fetch(url);
    const t2 = Date.now();

    console.log("fetchResponse", t2 - t1);
    const res = await fetchResponse.json();
    return res.stories;
}

const promiseStories = async ({ userId, sessionid, league }: FetchStoriesProps) => {
    console.log("promiseStories", userId, sessionid, league);
    let keyStories = (page: any) => {
        const keyFetchedStories: StoriesKey = { type: "fetch-stories", page: page, league }
        return keyFetchedStories;
    };
    console.log("StoriesKey:", keyStories);
    return { key: us(keyStories), call: fetchStories(keyStories(0), userId, sessionid) };
}
export const actionStories = async (key: StoriesKey) => {

    const session = await fetchSession();

    const { userId } = auth() || { userId: "" };

    const sessionid = session.sessionid;
    /* setTimeout(async () => {
         try {
             const cacheInitUrl = `${lake_api}/api/v50/findexar/init-cache?userid=${encodeURIComponent(userId || sessionid)}`;
             const cacheResponse = await fetch(cacheInitUrl);
             const cacheResult = await cacheResponse.json();
             if (cacheResult.success) {
                 console.log("Cache initialization for rosters started in background");
             } else {
                 console.error("Failed to initialize cache:", cacheResult.message);
             }
         } catch (error) {
             console.error("Error making API call to initialize rosters cache:", error);
         }
     }, 0);*/
    return fetchStories(key, userId || "", sessionid);
}

export default promiseStories;

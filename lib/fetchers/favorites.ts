'use server';
import { FavoritesKey } from "@/lib/keys";
import { unstable_serialize } from 'swr'
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";
import { auth } from "@clerk/nextjs/server";

const api_key = process.env.LAKE_API_KEY;;
interface FetchFavoritesProps {
    userId: string;
    sessionid: string;
    league: string;
    page: number;
}
const fetchFavorites = async (key: FavoritesKey, userId: string, sessionid: string) => {
    const { league, page } = key;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/get-favorites?api_key=${api_key}&userid=${userId}&sessionid=${sessionid}&league=${league}&page=${page}`;
    console.log("fetchFavorites",url);
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    console.log("RET fetchFavorites",res.mentions);
    return res.mentions;
}
const promiseFavoites = async ({ userId, sessionid, league = "", page }: FetchFavoritesProps) => {
    const key: FavoritesKey = { type: "favorites", league, page };
    return { key: unstable_serialize(key), call: fetchFavorites(key, userId, sessionid) };
}
export const actionFavorites = async (key: FavoritesKey) => {
    'use server';
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId } = auth() || { userId: "" };
 
    const sessionid = session.sessionid;
    console.log("actionFavorites",key,userId,sessionid);
    return  fetchFavorites(key, userId||"", sessionid);
}
export type FavoriteParams = { findexarxid: string };
const addFavorite = async ({ findexarxid }: FavoriteParams,userId:string,sessionid:string) => {
  
    userId=userId || sessionid;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/user/favorites/add?api_key=${api_key}&userid=${userId}&findexarxid=${encodeURIComponent(findexarxid as string||"")}`;
    console.log("add favorite:",url)
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    return res.success;
}
const removeFavorite = async ({ findexarxid}: FavoriteParams,userId:string,sessionid:string) => {

    userId=userId || sessionid;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/user/favorites/remove?api_key=${api_key}&userid=${userId}&findexarxid=${encodeURIComponent(findexarxid as string||"")}`;
   // console.log("remove my team member:",url)
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    //console.log("RET remove my team:",res.success)
    return res.success;
}
export const actionAddFavorite = async (props: FavoriteParams) => {
    'use server';
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId } = auth() || { userId: "" };
 
    const sessionid=session.sessionid;
    return addFavorite(props, userId||"",sessionid);
}

export const actionRemoveFavorite = async (props: FavoriteParams) => {
    'use server';
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const { userId } = auth() || { userId: "" };
 
    const sessionid=session.sessionid;
    return removeFavorite(props, userId||"",sessionid);
}

export default promiseFavoites;
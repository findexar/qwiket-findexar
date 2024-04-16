import { FavoritesKey } from "@/lib/keys";
import { unstable_serialize } from 'swr'
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions,SessionData } from "@/lib/session";

const api_key = process.env.LAKE_API_KEY;;
interface FetchFavoritesProps {
    userId: string;
    sessionid: string;
    league: string;
    page: number;
}
const fetchFavorites = async (key: FavoritesKey, userId: string, sessionid: string) => {
    const { league, page } = key;
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/get-favorites?api_key=${api_key}&userid=${userId}&sessionId=${sessionid}&league=${league}&page=${page}`;
    const fetchResponse = await fetch(url);
    const res = await fetchResponse.json();
    return res.mentions;
}
const promiseFavoites = ({ userId, sessionid, league = "", page }: FetchFavoritesProps) => {
    const key: FavoritesKey = { type: "favorites", league, page };
    return { key: unstable_serialize(key), call: fetchFavorites(key, userId, sessionid) };
}
export const actionFavorites = async (key: FavoritesKey) => {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    const userId = session.username ? session.username : "";
    const sessionid = session.sessionid;
    return fetchFavorites(key, userId, sessionid);
}
export default promiseFavoites;
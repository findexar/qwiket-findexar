import {FavoritesKey} from "../api";
import { unstable_serialize } from 'swr'
const api_key=process.env.LAKE_API_KEY;;
interface FetchFavoritesProps{
    userId:string;
    sessionid:string;
    league:string;
}
const fetchFavorites=async ({userId,sessionid,league=""}:FetchFavoritesProps)=>{
    const url=`${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/get-favorites?api_key=${api_key}&userid=${userId}&sessionId=${sessionid}&league=${league}`
    ;
    const fetchResponse = await fetch(url);
    const dataTrackListMembers = await fetchResponse.json();
    return dataTrackListMembers.members;
}
const promiseFavoites=({userId,sessionid,league=""}:FetchFavoritesProps)=>{
    const key:FavoritesKey= { type: "favorites", league, noLoad: false };
           
  return { key: unstable_serialize(key), call: fetchFavorites({userId,sessionid,league}) };
}
export default promiseFavoites;
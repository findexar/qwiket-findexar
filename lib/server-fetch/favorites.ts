
const api_key=process.env.LAKE_API_KEY;;
interface FetchFavoritesProps{
    userId:string;
    sessionId:string;
}
const fetchFavorites=async ({userId,sessionId}:FetchFavoritesProps)=>{
    const url=`${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/user/favorites/get?api_key=${api_key}&userid=${userId}&sessionId=${sessionId}`
    ;
    const fetchResponse = await fetch(url);
    const dataTrackListMembers = await fetchResponse.json();
    return dataTrackListMembers.members;
}
export default fetchFavorites;
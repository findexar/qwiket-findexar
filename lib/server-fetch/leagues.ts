const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;
interface FetchMyTeamProps{
    userId:string;
    sessionId:string;
    league:string;

}
const fetchLeagues=async ({userId,sessionId,league}:FetchMyTeamProps)=>{
    
    return ["NFL", "NHL", "MLB", "NBA"];
    
}
export default fetchLeagues;
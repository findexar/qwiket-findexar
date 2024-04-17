import { LeaguesKey } from "../keys";
const lake_api=process.env.NEXT_PUBLIC_LAKEAPI
const api_key=process.env.LAKE_API_KEY;;

const fetchLeagues= (key:LeaguesKey)=>{
    console.log("fetchLeagues",key);
    return ["NFL", "NHL", "MLB", "NBA"];
    
}
export default fetchLeagues;
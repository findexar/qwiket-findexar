import React from 'react';
import{useAppContext} from '@/lib/context';
import useSWR from 'swr';
import {LeagueTeamsKey} from '@/lib/keys'
import {actionFetchLeagueTeams} from '@/lib/fetchers/league-teams';
const Teams: React.FC = () => {
    const {league,fallback}=useAppContext();
    const key:LeagueTeamsKey={ type: "league-teams", league };
    const { data, error } = useSWR(key,actionFetchLeagueTeams,{fallback});
    if (error) return <div>failed to load</div>
    if (!data) return <div className="p-12">loading...</div>
  
    return <div className="w-full h-full ">
      <div className="pl-12 py-4 text-xl"> {league}</div>
      <div className="ml-12 border-l-solid border-l">{data.map((team:any)=>{
        return <div className="h-6 ml-8 my-2 dark:hover:text-yellow-200 hover:text-yellow-700 hover:cursor-pointer ">{team.name}</div>
      })}</div>  
    </div>
}
export default Teams;
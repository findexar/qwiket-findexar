import React, { useEffect, useState } from "react";
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite' 

import { styled } from "styled-components";

import { useAppContext } from '@/lib/context';
import Mentions from '@/components/func-components/mentions';
import { FavoritesKey } from '@/lib/keys';
import { actionFavorites } from '@/lib/fetchers/favorites';
import { actionFetchLeagueTeams } from '@/lib/fetchers/team-players';
interface Props {
}
const Fav: React.FC<Props> = () => {
    let {fallback, mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, teamid, player, teamName, setTeamName } = useAppContext();
    const [mentions,setMentions]=useState([]);
    const fetchMentionsKey = (pageIndex: number, previousPageData: any): FavoritesKey | null => {
        let key: FavoritesKey = { type: "favorites", page: pageIndex, league};
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    }
    // now swrInfinite code:
    const { data, error, mutate, size, setSize, isValidating, isLoading } = useSWRInfinite(fetchMentionsKey, actionFavorites, { initialSize: 1, revalidateAll: true,parallel:true,fallback })
    useEffect(()=>{
        console.log("new data",{league, data})
        setMentions(data ? [].concat(...data) : []);
    },[data])
   // console.log("client side data",{data})
   // let mentions = data ? [].concat(...data):[];
    console.log("client side favorites data",{data,mentions})
    //for mutate function
    const teamPlayersKey = { type: 'team-players', teamid }; // Adjust accordingly
    console.log("team-mentions teamPlayersKey",teamPlayersKey)
    const { data: players, error: playersError, mutate: mutatePlayers } = useSWR(teamPlayersKey, actionFetchLeagueTeams);

    const isLoadingMore =
        isLoading || (size > 0 && data && typeof data[size - 1] === "undefined")||false;
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < 25)||false;
    //const favoritesKey: FavoritesKey = { type: "Favorites", noUser, noLoad: tab != "fav" };
    //const { data: favoritesMentions, mutate: mutateFavorites } = useSWR(favoritesKey, getFavorites);

   /* if (tab == "fav") {
        mentions = favoritesMentions;
        if (!favoritesMentions || favoritesMentions.length == 0) {
            isReachingEnd = true;
            isEmpty = true;
        }
    }
    if (!view)
        view = "mentions";

   */
    return (<>
        {isEmpty && (
            <div className="bg-slate-100 mt-6 border border-slate-500 text-slate-700 px-4 py-3 rounded-lg shadow-md" role="alert">
               
                <p className="text-sm">Empty Favorites Feed - click on a star in the top right corner of a mention to save as a favorite.</p>
            </div>
        )}
        <Mentions mentions={mentions} setSize={setSize} size={size} error={error} isValidating={isValidating} isEmpty={isEmpty} isReachingEnd={isReachingEnd} isLoadingMore={isLoadingMore} mutate={mutate} mutatePlayers={mutatePlayers}/>
        </>)
}
export default Fav;
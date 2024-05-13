import React, { useEffect } from "react";
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite'
import { useAppContext } from '@/lib/context';
import Mentions from '@/components/func-components/mentions';
import { TeamMentionsKey } from '@/lib/keys';
import { actionTeamMentions } from '@/lib/fetchers/team-mentions';
import { actionFetchLeagueTeams } from '@/lib/fetchers/team-players';
interface Props {
}
const Stories: React.FC<Props> = () => {
    let { fallback, mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, teamid, player, teamName, setTeamName } = useAppContext();
    // const [mentions, setMentions] = React.useState([]);
    const fetchMentionsKey = (pageIndex: number, previousPageData: any): TeamMentionsKey | null => {
        let key: TeamMentionsKey = { type: "fetch-team-mentions", teamid, page: pageIndex, league };
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    }
    // now swrInfinite code:
    const { data, error, mutate, size, setSize, isValidating, isLoading } = useSWRInfinite(fetchMentionsKey, actionTeamMentions, { initialSize: 1, revalidateAll: true, parallel: true, fallback })
    /* useEffect(()=>{
         setMentions(data ? [].concat(...data) : []);
     },[data])*/
    let mentions = data ? [].concat(...data) : [];

    const teamPlayersKey = { type: 'team-players', teamid }; // Adjust accordingly
    console.log("team-mentions teamPlayersKey",teamPlayersKey)
    const { data: players, error: playersError, mutate: mutatePlayers } = useSWR(teamPlayersKey, actionFetchLeagueTeams);

     if(playersError){
        console.log("playersError",playersError)
     }
    const isLoadingMore =
        isLoading || (size > 0 && data && typeof data[size - 1] === "undefined") || false;
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < 25) || false;
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
        return <>
            {playersError && <div>{playersError}</div>}
            <Mentions mentions={mentions} setSize={setSize} size={size} error={error} isValidating={isValidating} isEmpty={isEmpty} isReachingEnd={isReachingEnd} isLoadingMore={isLoadingMore} mutate={mutate} mutatePlayers={mutatePlayers} />
            </>
}
export default Stories;
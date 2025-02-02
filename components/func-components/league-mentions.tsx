'use client'
import React, { useEffect } from "react";
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite'
import { useAppContext } from '@/lib/context';
import Mentions from '@/components/func-components/mentions';
import { LeagueMentionsKey } from '@/lib/keys';
import { actionLeagueMentions } from '@lib/server-actions/league-mentions';
import { actionFetchLeagueTeams } from '@lib/server-actions/team-players';
interface Props {
}
let lastMutate = 0;
let scrollY = 0;
const Stories: React.FC<Props> = () => {
    let { fallback, mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, teamid, player, teamName, setTeamName } = useAppContext();
    // const [mentions, setMentions] = React.useState([]);
    const fetchMentionsKey = (pageIndex: number, previousPageData: any): LeagueMentionsKey | null => {
        let key: LeagueMentionsKey = { type: "fetch-league-mentions", league: league?.toUpperCase() || '', page: pageIndex };
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    }
    // console.log("CLIENT====> fetchMentionsKey", fetchMentionsKey(0, null));
    // now swrInfinite code:
    const { data, error, mutate, size, setSize, isValidating, isLoading } = useSWRInfinite(fetchMentionsKey, actionLeagueMentions, { initialSize: 1, revalidateAll: true, parallel: true, fallback })
    /* useEffect(()=>{
         setMentions(data ? [].concat(...data) : []);
     },[data])*/


    let mentions = data ? [].concat(...data) : [];
    // console.log("stories", stories);
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (Date.now() - lastMutate > 60 * 1000 && (window.scrollY === 0)) {
                lastMutate = Date.now();
                mutate();
            }
        }, 20 * 1000); // Check every 20 secs

        return () => clearInterval(intervalId);
    }, [mutate]);
    useEffect(() => {
        const listener = () => {
            if (window.scrollY === 0) {
                if (lastMutate < Date.now() - 1000) {
                    mutate();
                }
                lastMutate = Date.now();
            }
        };

        function debounce(callbackFn: any, delay: number) {
            let timeoutId: NodeJS.Timeout | null = null;
            return function () {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(() => {
                    callbackFn.call();
                }, delay);
            };
        }

        window.addEventListener("scroll", debounce(listener, 100));
        return () => window.removeEventListener("scroll", listener);
    }, [scrollY]);

    const teamPlayersKey = { type: 'team-players', teamid }; // Adjust accordingly
    //console.log("team-mentions teamPlayersKey",teamPlayersKey)
    const { data: players, error: playersError, mutate: mutatePlayers } = useSWR(teamPlayersKey, actionFetchLeagueTeams);

    if (playersError) {
        console.log("playersError", playersError)
    }
    const isLoadingMore =
        isLoading || (size > 0 && data && typeof data[size - 1] === "undefined") || false;
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < 5) || false;
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
        <Mentions mentions={mentions} setSize={setSize} size={size} error={error} isValidating={isValidating} isEmpty={isEmpty} isReachingEnd={isReachingEnd} isLoadingMore={isLoadingMore} mutate={mutate} mutatePlayers={mutatePlayers} showImage={true} />
    </>
}
export default Stories;
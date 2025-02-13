import React, { useEffect } from "react";
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite'
import { styled } from "styled-components";
//import { getFavorites, FavoritesKey, FetchedMentionsKey, fetchMentions } from '@/lib/api';
import { useAppContext } from '@/lib/context';
import Mentions from '@/components/func-components/mentions';
import { PlayerMentionsKey } from '@/lib/keys';
import { actionPlayerMentions } from '@lib/server-actions/player-mentions';
import { TeamPlayersKey, MyTeamKey } from '@/lib/keys';
import { actionFetchLeagueTeams } from '@lib/server-actions/team-players';

// Add type at the top with other imports

interface Props {
}
const PlayerMentions: React.FC<Props> = () => {
    let { fallback, league, pagetype, teamid, player, athleteUUId, teamName, setTeamName } = useAppContext();
    // const [mentions, setMentions] = React.useState([]);
    const fetchMentionsKey = (pageIndex: number, previousPageData: any): PlayerMentionsKey | null => {
        let key: PlayerMentionsKey = { type: "fetch-player-mentions", teamid, page: pageIndex, league, name: player, athleteUUId };
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    }
    // now swrInfinite code:
    const { data, error, mutate, size, setSize, isValidating, isLoading } = useSWRInfinite(
        fetchMentionsKey,
        actionPlayerMentions,
        { initialSize: 1, revalidateAll: true, parallel: true, fallback }
    );
    /* useEffect(()=>{
         setMentions(data ? [].concat(...data) : []);
     },[data])*/
    let mentions = data ? [].concat(...data) : [];
    //  console.log("mentions", mentions);
    //for mutate function
    const teamPlayersKey = { type: 'team-players', teamid }; // Adjust accordingly
    // console.log("team-mentions teamPlayersKey",teamPlayersKey)
    const { data: players, error: playersError, mutate: mutatePlayers } = useSWR(teamPlayersKey, actionFetchLeagueTeams);

    const isLoadingMore =
        isLoading || (size > 0 && data && typeof data[size - 1] === "undefined") || false;
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < 5) || false;

    //console.log("mentions:",mentions)
    return (
        <Mentions mentions={mentions} setSize={setSize} size={size} error={error} isValidating={isValidating} isEmpty={isEmpty} isReachingEnd={isReachingEnd} isLoadingMore={isLoadingMore} mutate={mutate} mutatePlayers={mutatePlayers} showImage={false} />
    )
}
export default PlayerMentions;
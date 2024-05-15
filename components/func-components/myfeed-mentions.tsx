import React, { useEffect } from "react";
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite'
import { useAppContext } from '@/lib/context';
import Mentions from '@/components/func-components/mentions';
import { FetchMyFeedKey } from '@/lib/keys';
import { actionMyFeed } from '@/lib/fetchers/myfeed';
import { actionFetchLeagueTeams } from '@/lib/fetchers/team-players';

interface Props {
    league:string
}
const MyFeed: React.FC<Props> = ({league}) => {
    let { fallback, mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp,  pagetype, teamid, player, teamName, setTeamName } = useAppContext();
    //const [mentions, setMentions] = React.useState([]);
    const fetchMentionsKey = (pageIndex: number, previousPageData: any): FetchMyFeedKey | null => {
        let key: FetchMyFeedKey = { type: "fetch-my-feed", page: pageIndex, league };
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    }
    // now swrInfinite code:
    const { data, error, mutate, size, setSize, isValidating, isLoading } = useSWRInfinite(fetchMentionsKey, actionMyFeed, { initialSize: 1, revalidateAll: true, parallel: true, fallback })
    //  useEffect(() => {
    //    setMentions(data ? [].concat(...data) : []);
    //}, [data])
    let mentions = data ? [].concat(...data) : [];

    //for mutate function
    const teamPlayersKey = { type: 'team-players', teamid }; // Adjust accordingly
    console.log("team-mentions teamPlayersKey", teamPlayersKey)
    const { data: players, error: playersError, mutate: mutatePlayers } = useSWR(teamPlayersKey, actionFetchLeagueTeams);

    const isLoadingMore =
        isLoading || (size > 0 && data && typeof data[size - 1] === "undefined") || false;
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < 25) || false;
   
    return <>
        {isEmpty && (
            <div className="bg-slate-100 mt-1 mx-1 border border-slate-500 text-slate-700 px-4 py-3 rounded-lg shadow-md" role="alert">
               
                <p className="text-sm">Empty Fantasy Feed - perhaps your team is not yet created.</p>
            </div>
        )}
        <Mentions mentions={mentions} setSize={setSize} size={size} error={error} isValidating={isValidating} isEmpty={isEmpty} isReachingEnd={isReachingEnd} isLoadingMore={isLoadingMore} mutate={mutate} mutatePlayers={mutatePlayers} />
       
    </>
}
export default MyFeed;


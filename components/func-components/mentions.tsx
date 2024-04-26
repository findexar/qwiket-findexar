import React from "react";
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite'
import { styled } from "styled-components";
import { getFavorites, FavoritesKey, FetchedMentionsKey, fetchMentions } from '@/lib/api';
import { useAppContext } from '@/lib/context';
import Mention from "@/components/func-components/items/mention";
import LoadMore from "@/components/func-components/load-more";

const MentionsBody = styled.div`
    width:100%;
    height:100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items:flex-start;
`;

const MentionsOuterContainer = styled.div`
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    width:100%;
    height:100%;
    font-family: 'Roboto', sans-serif;
    padding-right:20px;
    padding-bottom:100px;
    @media screen and (max-width: 1199px) {
        display: none;
    }
`;

const MobileMentionsOuterContainer = styled.div`
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    height:100%;
    font-family: 'Roboto', sans-serif;
    align-content:flex-start;
    a{
        font-size: 18px;
      
        text-decoration: none;
        &:hover{
          color: var(--highlight);
        }   
    }
    @media screen and (min-width: 1200px) {
    display: none;
  }
`;

interface Props {
}
const Stories: React.FC<Props> = () => {
    let { mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, team, player, teamName, setTeamName } = useAppContext();

    const fetchMentionsKey = (pageIndex: number, previousPageData: any): FetchedMentionsKey | null => {
        let key: FetchedMentionsKey = { type: "FetchedMentions", teamid: team || "", name: player || "", noUser, page: pageIndex, league, myteam: tab == 'myteam' ? 1 : 0, noLoad: tab == "fav" || view != "mentions" };
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    }
    // now swrInfinite code:
    const { data, error: mentionsError, mutate, size, setSize, isValidating, isLoading } = useSWRInfinite(fetchMentionsKey, fetchMentions, { initialSize: 1, revalidateAll: true, parallel: true })
    let mentions = data ? [].concat(...data) : [];
    const isLoadingMore =
        isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < 25);
    const favoritesKey: FavoritesKey = { type: "Favorites", noUser, noLoad: tab != "fav" };
    const { data: favoritesMentions, mutate: mutateFavorites } = useSWR(favoritesKey, getFavorites);

    if (tab == "fav") {
        mentions = favoritesMentions;
        if (!favoritesMentions || favoritesMentions.length == 0) {
            isReachingEnd = true;
            isEmpty = true;
        }
    }
    if (!view)
        view = "mentions";

    const Mentions = mentions && mentions.map((m: any, i: number) => {
        return (
            <Mention
                mention={m}
                key={`mention${i}`}
                mutate={() => { mutate() }}
                handleClose={() => { }}
            />)
    });
    return (
        <>
            {!isMobile ?
                <MentionsOuterContainer>
                    <MentionsBody>
                        {Mentions}
                    </MentionsBody>
                    <LoadMore setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
                </MentionsOuterContainer>
                :
                <MobileMentionsOuterContainer>
                    <MentionsBody>
                        {Mentions}
                    </MentionsBody>
                    <LoadMore setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
                </MobileMentionsOuterContainer>
            }
        </>
    )
}
export default Stories;
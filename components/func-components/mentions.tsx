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
    padding-top:20px;
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
    mentions:any;
    setSize: any;
    size: number;
    error: any;
    isValidating: boolean;
    isEmpty: boolean;
    isReachingEnd: boolean;
    isLoadingMore: boolean;
    mutate: any;

}
const Mentions: React.FC<Props> = ({mentions,setSize,size,error,isValidating,isEmpty,isReachingEnd,isLoadingMore,mutate}) => {
    let { mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, team, player, teamName, setTeamName } = useAppContext();
 
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
export default Mentions;
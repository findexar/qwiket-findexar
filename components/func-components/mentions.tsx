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
   // height:100%;
    //display: flex;
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
    min-height:100%;
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
    mutatePlayers?: any;
}
const Mentions: React.FC<Props> = ({mentions,setSize,size,error,isValidating,isEmpty,isReachingEnd,isLoadingMore,mutate,mutatePlayers}) => {
    let { mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, team, player, teamName, setTeamName } = useAppContext();
 
    if (!view)
        view = "mentions";

    const Mentions = mentions && mentions.map((m: any, i: number) => {
        return (
            <Mention
                mention={m}
                key={`mention-${m.findexarxid}`}
                mutate={() => { mutate() }}
                handleClose={() => { }}
                mutatePlayers={mutatePlayers}
            />)
    });
    return (
        <>
            {!isMobile ?
                <MentionsOuterContainer>
                    <MentionsBody>
                        {Mentions}
                    </MentionsBody>
                    <LoadMore items={mentions} name="mentions"  setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
                </MentionsOuterContainer>
                :
                <div className="h-full"><MobileMentionsOuterContainer>
                    <MentionsBody>
                        {Mentions}
                    </MentionsBody>
                    <LoadMore items={mentions} name="mentions" setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
                </MobileMentionsOuterContainer></div>
            }
        </>
    )
}
export default Mentions;
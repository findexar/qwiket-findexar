'use client';
import React from "react";
import { styled } from "styled-components";
import { useAppContext } from '@/lib/context';
import Mention from "@/components/func-components/items/mention";
import LoadMore from "@/components/func-components/load-more";

const MentionsBody = styled.div`
    width:100%;
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
    @media screen and (max-width: 1024px) {
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
    @media screen and (min-width: 1025px) {
    display: none;
  }
`;

interface Props {
    mentions: any;
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
const Mentions: React.FC<Props> = ({ mentions, setSize, size, error, isValidating, isEmpty, isReachingEnd, isLoadingMore, mutate, mutatePlayers }) => {
    let { mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, team, player, teamName, setTeamName } = useAppContext();

    if (!view)
        view = "mentions";
    //   console.log("mention Mentions", mentions)

    // Check if mentions is not just an array of undefined
    const hasValidMentions = mentions && mentions.some((m: any) => m !== undefined);

    const Mentions = hasValidMentions ? mentions.map((m: any, i: number) => {
        if (!m)
            return null;
        return (
            <Mention
                mention={m}
                key={`mention-${m.findexarxid}`}
                mutate={() => { mutate() }}
                handleClose={() => { }}
                mutatePlayers={mutatePlayers}
            />)
    }) : null;
    //  console.log("REACT Mentions", Mentions, hasValidMentions);
    return (
        <div>
            <MentionsOuterContainer className="hidden lg:block">
                <MentionsBody>
                    {hasValidMentions ? Mentions : <p>No valid mentions available.</p>}
                </MentionsBody>
                <LoadMore items={mentions} name="mentions" setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
            </MentionsOuterContainer>
            <div className="h-full lg:hidden"><MobileMentionsOuterContainer>
                <MentionsBody>
                    {hasValidMentions ? Mentions : <p>No valid mentions available.</p>}
                </MentionsBody>
                <LoadMore items={mentions} name="mentions" setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
            </MobileMentionsOuterContainer></div>
        </div>
    )
}
export default Mentions;
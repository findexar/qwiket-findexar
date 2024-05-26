'use client';
import React, { use, useCallback, useEffect, useState } from "react";
import Link from 'next/link'
import useSWR from 'swr';
import useSWRInfinite from 'swr/infinite';

import { UserButton, SignInButton, SignedOut, SignedIn, RedirectToSignIn } from "@clerk/nextjs";
import { styled, useTheme } from "styled-components";

import { useAppContext } from '@/lib/context';
import { TeamPlayersKey, MyTeamKey } from '@/lib/keys';
import { actionFetchLeagueTeams } from '@/lib/fetchers/team-players';

import { actionRecordEvent } from "@/lib/actions";
import TeamAddIcon from "@/components/icons/usergroup-add";
import TeamRemoveIcon from "@/components/icons/usergroup-delete";
import { TeamMentionsKey } from '@/lib/keys';
import { actionTeamMentions } from '@/lib/fetchers/team-mentions';
import { PlayerMentionsKey } from '@/lib/keys';
import { actionPlayerMentions } from '@/lib/fetchers/player-mentions';
import { FetchMyFeedKey } from '@/lib/keys';
import { actionMyFeed } from '@/lib/fetchers/myfeed';
import { actionFetchMyTeam, actionAddMyTeamMember, actionRemoveMyTeamMember } from "@/lib/fetchers/my-team-actions";
import { MyTeamRosterKey } from '@/lib/keys';

declare global {
    interface Window {
        Clerk: any;
    }
}

const SidePlayer = styled.div<SideProps>`
    color:${props => props.$highlight ? 'var(--myteam)' : 'var(--text)'};
    padding-left:20px;
    width: 100%;
    &:hover{
        color:var(--highlight);
    }  
    margin: 4px;
    a{
        color:${props => props.$highlight ? 'var(--myteam)' : 'var(--text)'} !important;
        text-decoration: none;
        background-color:${props => props.$highlight ? 'var(--myteam-bg)' : 'var(--background)'} !important;
        &:hover{
            color:var(--highlight) !important;
        }
    }
`;

const TeamName = styled.div`
    height: 30px;
    width: 100%; 
    font-size: 20px;
    padding-top:2px;
    padding-bottom:35px;
`;

const MobileTeamName = styled.div`
    height: 40px;
    color:var(--text); 
    text-align: center;
    font-size: 20px;
    padding-top:12px;
    padding-bottom:35px;
`;

const SideGroup = styled.div`
    display:flex;
    width: 300px;
    height:31px;
    flex-direction:row;
    justify-content:space-between;
    padding-right:20px;
    align-items:center;
    border-left: 1px solid #aaa;
`;
interface SideProps {
    $highlight?: boolean;
}
const SideIcon = styled.div<SideProps>`
    width:20px;
    height:30px;
    color:${props => props.$highlight ? 'var(--selected))' : 'var(--link)'};  
`;

const SideButton = styled.div`
    width:40px;
`;

const SelectedSidePlayer = styled.div<SideProps>`
    color:${props => props.$highlight ? 'var(--selected)' : 'var(--selected)'};
    padding-left:20px;
    width: 100%;
    margin: 4px;
    a{
        color:${props => props.$highlight ? 'var(--selected)' : 'var(--selected)'} !important;//#ff8 !important;
        text-decoration: none;
        background-color:${props => props.$highlight ? 'var(--myteam-bg)' : 'var(--background)'} !important;
        &:hover{
            color:var(--highlight);
        }
    }
`;

const MobilePlayersPanel = styled.div`
    height:100%;
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    align-items:flex-start; 
    padding-left:20px;
    a{
        color:var(--text); // #eee;
        text-decoration: none;
        &:hover{
        color: var(--highlight);//#4f8;
        }
    }
`;
interface ScrollProps {
    $numPlayers: number;
}
const RightScroll = styled.div<ScrollProps>`
    position:sticky;
    height:auto !important;
    top:-${({ $numPlayers }) => $numPlayers > 60 ? $numPlayers * $numPlayers * 0.30 : $numPlayers * $numPlayers * 0.30}px;
    overflow-y: hidden;
    padding-bottom:20px;
    width:auto;
`;
interface Props {
}
const Players: React.FC<Props> = () => {
    const [signin, setSignin] = React.useState(false);
    const { fallback, mode, userId, isMobile, setLeague, setView, setTab, setPagetype, setTeamNae, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, teamid, player, teamName, setTeamName } = useAppContext();
    const teamPlayersKey: TeamPlayersKey = { type: 'team-players', teamid };
    //console.log("players teamPlayersKey", teamPlayersKey)
    const { data: players, error: playersError, isLoading: playersLoading, mutate: mutatePlayers } = useSWR(teamPlayersKey, actionFetchLeagueTeams, { fallback });
    const theme = useTheme();
    //this is to be able to mutate team mentions
    const fetchTeamMentionsKey = (pageIndex: number, previousPageData: any): TeamMentionsKey | null => {
        let key: TeamMentionsKey = { type: "fetch-team-mentions", teamid, page: pageIndex, league };
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    }
    const { data: mentions, error: mentionsError, mutate: mutateMentions, size: mentionsSize, setSize: setMentionsSize, isValidating: mentionsIsValidating, isLoading: mentionsIsLoading } = useSWRInfinite(fetchTeamMentionsKey, actionTeamMentions, { initialSize: 1, revalidateAll: true, parallel: true, fallback })
    //this is to be able to mutate player mentions
    const fetchPlayerMentionsKey = (pageIndex: number, previousPageData: any): PlayerMentionsKey | null => {
        let key: PlayerMentionsKey = { type: "fetch-player-mentions", teamid, page: pageIndex, league, name: player };
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    }
    // now swrInfinite code for player mentions:
    const { data: playerMentionsData, error: playerMentionsError, mutate: mutatePlayerMentions, size: playerMentionsSize, setSize: setPlayerMentionsSize, isValidating: playerMentionsIsValidating, isLoading: playerMentionsIsLoading } = useSWRInfinite(fetchPlayerMentionsKey, actionPlayerMentions, { initialSize: 1, revalidateAll: true, parallel: true, fallback })

    // Function to fetch my feed with pagination:
    const fetchMyFeedKey = (pageIndex: number, previousPageData: any): FetchMyFeedKey | null => {
        if (previousPageData && !previousPageData.length) return null; // reached the end
        let key: FetchMyFeedKey = { type: "fetch-my-feed", page: pageIndex, league };
        return key;
    }
    // now swrInfinite code:
    const { data, error, mutate: mutateMyFeed, size, setSize, isValidating, isLoading } = useSWRInfinite(fetchMyFeedKey, actionMyFeed, { initialSize: 1, revalidateAll: true, parallel: true, fallback })

    const trackerListMembersKey: MyTeamRosterKey = { type: "my-team-roster", league };
    const { data: trackerListMembers, error: trackerListError, isLoading: trackerListLoading, mutate: trackerListMutate } = useSWR(trackerListMembersKey, actionFetchMyTeam, { fallback });

    //@ts-ignore
    //const mode = theme.palette.mode;
    const palette = theme[mode].colors;
    // console.log("PLAYERS:",players,"key:",teamPlayersKey)
    const onPlayerNav = async (name: string) => {
        // console.log("onPlayerNav", name)
        setPagetype("player");
        setPlayer(name);
        setView("mentions");
        setTab("all");
        const url = `/${league}/${teamid}/${encodeURIComponent(name)}${params}${tp}`;
        //  console.log("replaceState", url)
        //  window.history.replaceState({}, "", url);
        await actionRecordEvent(
            'player-nav',
            `{"params":"${params}","player":"${name}"}`
        );
    }

    const PlayersNav = players && players?.map((p: { name: string, findex: string, mentions: string, tracked: boolean }, i: number) => {
        return <SideGroup className="h-6" key={`ewfggvfn-${p.name}`}>{p.name == player ?
            <SelectedSidePlayer $highlight={p.tracked}>
                <Link onClick={async () => { await onPlayerNav(p.name) }} href={`/${league}/${teamid}/${encodeURIComponent(p.name)}${params}`} >
                    {p.name} ({`${p.mentions ? p.mentions : 0}`})
                </Link>
            </SelectedSidePlayer>
            :
            <SidePlayer $highlight={p.tracked}>
                <Link onClick={async () => { await onPlayerNav(p.name) }} href={`/${league}/${teamid}/${encodeURIComponent(p.name)}${params}${tp}`} >
                    {p.name} ({`${p.mentions || 0}`})
                </Link>
            </SidePlayer>}
            <SideButton>
                <div className="mt-2"
                    onClick={async () => {
                        setPlayer(p.name);

                        if (p.tracked == true) {
                            console.log("TRACKED", p.name)
                            mutatePlayers(async (players: any) => {
                                return players.map((player: any) => {
                                    if (player.name == p.name) {
                                        player.tracked = false;
                                    }
                                    return player;
                                })
                            }, { revalidate: true });
                            await actionRemoveMyTeamMember({ member: p.name, teamid });
                            await actionRecordEvent(
                                'player-remove-myteam',
                                `{"params":"${params}","team":"${teamid}","player":"${p.name}"}`
                            );
                            mutateMentions();
                            mutateMyFeed();
                            mutatePlayerMentions();
                            trackerListMutate();
                        }
                        else {

                            console.log("after mutatePlayers");
                           
                            const response = await actionAddMyTeamMember({ member: p.name, teamid });
                            if (response.success) {
                                mutatePlayers(async (players: any) => {
                                    return players.map((player: any) => {
                                        if (player.name == p.name) {
                                            player.tracked = true;
                                        }
                                        return player;
                                    })
                                }, { revalidate: true });
                                await actionRecordEvent(
                                    'player-add-myteam',
                                    `{"params":"${params}","team":"${teamid}","player":"${p.name}"}`
                                );
                                mutateMentions();
                                mutateMyFeed();
                                mutatePlayerMentions();
                                trackerListMutate();
                            }

                        }
                    }} aria-label="Add new list">
                    <SideIcon $highlight={p.tracked}>
                        {p.tracked ? <TeamRemoveIcon className="h-6 w-6 opacity-60 hover:opacity-100 text-yellow-400" /> : <TeamAddIcon className="h-6 w-6 opacity-60 hover:opacity-100  text-teal-400" />}
                        {signin && <RedirectToSignIn />}
                    </SideIcon>
                </div>
            </SideButton>
        </SideGroup>
    });
    return (<>
        {!isMobile ?
            <RightScroll $numPlayers={players?.length}>
                <TeamName>{teamName}:</TeamName>
                {PlayersNav}
            </RightScroll>
            :
            <MobilePlayersPanel>
                <MobileTeamName>{teamName}</MobileTeamName>
                {PlayersNav}
            </MobilePlayersPanel>
        }
    </>
    );
}

export default Players;
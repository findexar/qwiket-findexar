'use client';
import React, { use, useCallback, useEffect, useState } from "react";
import Link from 'next/link'
import useSWR from 'swr';
import { UserButton, SignInButton, SignedOut, SignedIn, RedirectToSignIn } from "@clerk/nextjs";
import { styled, useTheme } from "styled-components";
import IconButton from '@mui/material/IconButton';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import PlaylistRemoveIcon from '@mui/icons-material/PlaylistRemove';
import {useAppContext} from '@/lib/context';
import {TeamPlayersKey,MyTeamKey} from '@/lib/keys';
import {actionFetchLeagueTeams} from '@/lib/fetchers/team-players';
import { actionAddMyTeamMember,actionRemoveMyTeamMember } from "@/lib/fetchers/my-team-actions";
import { actionRecordEvent } from "@/lib/actions";
import TeamAddIcon from "@/components/icons/usergroup-add";
import TeamRemoveIcon from "@/components/icons/usergroup-delete";

declare global {
    interface Window {
        Clerk: any;
    }
}

const SidePlayer = styled.div<SideProps>`
    color:${props => props.highlight ? 'var(--myteam)' : 'var(--text)'};
    padding-left:20px;
    width: 100%;
    &:hover{
        color:var(--highlight);
    }  
    margin: 4px;
    a{
        color:${props => props.highlight ? 'var(--myteam)' : 'var(--text)'} !important;
        text-decoration: none;
        background-color:${props => props.highlight ? 'var(--myteam-bg)' : 'var(--background)'} !important;
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
    highlight?: boolean;
}
const SideIcon = styled.div<SideProps>`
    width:20px;
    height:30px;
    color:${props => props.highlight ? 'var(--selected))' : 'var(--link)'};  
`;

const SideButton = styled.div`
    width:40px;
`;

const SelectedSidePlayer = styled.div<SideProps>`
    color:${props => props.highlight ? 'var(--selected)' : 'var(--selected)'};
    padding-left:20px;
    width: 100%;
    margin: 4px;
    a{
        color:${props => props.highlight ? 'var(--selected)' : 'var(--selected)'} !important;//#ff8 !important;
        text-decoration: none;
        background-color:${props => props.highlight ? 'var(--myteam-bg)' : 'var(--background)'} !important;
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
    top:-${({ $numPlayers }) => $numPlayers > 60 ? $numPlayers * $numPlayers * 0.30 : $numPlayers * $numPlayers *0.30}px;
    overflow-y: hidden;
    padding-bottom:20px;
    width:100%;
`;
interface Props {
}
const Players: React.FC<Props> = () => {
    const [signin, setSignin] = React.useState(false);
    const { fallback,mode,userId, isMobile, setLeague, setView, setTab, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, teamid, player, teamName, setTeamName } = useAppContext();
    const teamPlayersKey: TeamPlayersKey = { type: 'team-players', teamid };
    const { data: players, error, isLoading, mutate: mutatePlayers } = useSWR(teamPlayersKey, actionFetchLeagueTeams, { fallback });
    const theme = useTheme();
    
    //@ts-ignore
    //const mode = theme.palette.mode;
    const palette = theme[mode].colors;
    console.log("PLAYERS:",players,"key:",teamPlayersKey)
    const onPlayerNav = async (name: string) => {
        console.log("onPlayerNav", name)
        setPagetype("player");
        setPlayer(name);
        setView("mentions");
        setTab("all");
        await actionRecordEvent(
            'player-nav',
            `{"params":"${params}","player":"${name}"}`
        );
    }

    const PlayersNav = players && players?.map((p: { name: string, findex: string, mentions: string, tracked: boolean }, i: number) => {
        return <SideGroup className="h-6" key={`ewfggvfn-${i}`}>{p.name == player ?
            <SelectedSidePlayer highlight={p.tracked}>
                <Link onClick={async () => { await onPlayerNav(p.name) }} href={`/${league}/${teamid}/${encodeURIComponent(p.name)}${params}`} >
                    {p.name} ({`${p.mentions?p.mentions:0}`})
                </Link>
            </SelectedSidePlayer>
            :
            <SidePlayer highlight={p.tracked}>
                <Link onClick={async () => { await onPlayerNav(p.name) }} href={`/${league}/${teamid}/${encodeURIComponent(p.name)}${params}${tp}`} >
                    {p.name} ({`${p.mentions || 0}`})
                </Link>
            </SidePlayer>}
            <SideButton>
                <div className="mt-2"
                    onClick={async () => {
                        setPlayer(p.name);
                       /* if (window && window.Clerk) {
                            const Clerk = window.Clerk;
                            const user = Clerk.user;
                            const id = Clerk.user?.id;
                            if (!id) {
                                setSignin(true);
                                return;
                            }
                        }*/
                        if (p.tracked == true) {
                            console.log("TRACKED", p.name)
                            mutatePlayers((players: any) => {
                                return players.map((player: any) => {
                                    if (player.name == p.name) {
                                        player.tracked = false;
                                    }
                                    return player;
                                })
                            }, false);
                            await actionRemoveMyTeamMember({member:p.name,teamid});
                            await actionRecordEvent(
                                'player-remove-myteam',
                                `{"params":"${params}","team":"${teamid}","player":"${p.name}"}`
                            );
                        }
                        else {
                            mutatePlayers((players: any) => {
                                return players.map((player: any) => {
                                    if (player.name == p.name) {
                                        player.tracked = true;
                                    }
                                    return player;
                                })
                            }, false);
                            console.log("after mutatePlayers");
                            await actionAddMyTeamMember({member:p.name,teamid});
                            await actionRecordEvent(
                                'player-add-myteam',
                                `{"params":"${params}","team":"${teamid}","player":"${p.name}"}`
                            );
                        }
                    }} aria-label="Add new list">
                    <SideIcon highlight={p.tracked}>
                        {p.tracked ? <TeamRemoveIcon  className="h-6 w-6 hover:text-green-400 text-yellow-400"  /> : <TeamAddIcon  className="h-6 w-6  hover:text-green-400"/>}
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
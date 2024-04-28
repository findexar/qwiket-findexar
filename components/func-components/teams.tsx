import React, { useCallback, useEffect } from "react";
import Link from 'next/link'
import useSWR from 'swr';
import { styled } from "styled-components";
import { recordEvent } from '@/lib/api';
import { useAppContext } from '@/lib/context';
import { LeagueTeamsKey } from '@/lib/keys';
import { actionFetchLeagueTeams } from '@/lib/fetchers/league-teams';
const SideLeagueName = styled.div`
    height: 40px;
    width: 200px; 
    color:var(--text);
    font-size: 20px;
`;

const SideTeam = styled.div`
    height: 30px;
    padding-left:20px;
    border-left: 1px solid #aaa;
    padding-bottom:20px;
`;

const SelectedSideTeam = styled.div`
    height: 30px;
    color:var(--selected);
    padding-left:20px;
    border-left: 1px solid #aaa;
    a{
        color:var(--selected) !important;
        text-decoration: none;
        &:hover{
            color: var(--highlight);
        }
    }
`;

interface Props {
}
const Teams: React.FC<Props> = () => {
    const { fallback, mode, userId, isMobile, setLeague, setView, setTab, setPagetype, setTeamid, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, teamid, player, teamName, setTeamName } = useAppContext();

    const leagueTeamsKey: LeagueTeamsKey = { type: "league-teams", league };
    const { data: teams, error, isLoading } = useSWR(leagueTeamsKey, actionFetchLeagueTeams, { fallback });
    console.log("RENDER teams:", teamid, teamName)
    const onTeamNav = useCallback(async (id: string,name:string) => {
        setPagetype("team");
        setPlayer("");
        setTeamid(id);
        setTeamName(name);
        setView("mentions");
        setTab("all");
  
        /*await recordEvent(
          'team-nav',
          `{"params":"${params}","teamid":"${name}"}`
        );*/
    }, []);
    useEffect(() => {
        if (teams && teams.length > 0) {
            teams.find((t: { id: string, name: string }) => {
                if (t.id == teamid) {
                    setTeamName(t.name);
                    return true;
                }
            });
        }
    }, [teams, teamid]);

    let TeamsNav = null;
    if (teams && teams.length > 0)
        TeamsNav = teams?.map((t: { id: string, name: string }, i: number) => {
          /*  if (t.id == teamid)
                setTeamName(t.name);*/
            return t.id == teamid ? <SelectedSideTeam key={`sideteam-${i}`}>
                <Link onClick={async () => { await onTeamNav(t.id,t.name); }} href={`/${league}/${t.id}${params}`} >{t.name}</Link></SelectedSideTeam> : <SideTeam key={`sideteam-${i}`}><Link onClick={async () => { onTeamNav(t.id,t.name) }} href={`/${league}/${t.id}${params}`} >{t.name}</Link></SideTeam>
        });
    return (
        <><SideLeagueName>{league}:</SideLeagueName> {TeamsNav}</>
    )
}
export default Teams;
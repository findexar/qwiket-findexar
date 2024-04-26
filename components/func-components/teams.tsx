import React, { useCallback} from "react";
import Link from 'next/link'
import useSWR from 'swr';
import { styled } from "styled-components";
import { LeagueTeamsKey, getLeagueTeams, recordEvent } from '@/lib/api';
import { useAppContext } from '@/lib/context';

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
  const { mode, userId, isMobile, setLeague, setView, setTab, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, team, player, teamName, setTeamName } = useAppContext();

  const leagueTeamsKey: LeagueTeamsKey = { func: "leagueTeams", league: league || "", noLoad: pagetype == "landing" };
  const { data: teams, error, isLoading } = useSWR(leagueTeamsKey, getLeagueTeams);

  const onTeamNav = useCallback(async (name: string) => {
      setPagetype("team");
      setPlayer("");
      setTeam(name);
      setView("mentions");
      setTab("all");
      teams&&teams.find((t: { id: string, name: string }) => {
          if (t.id == name){
              setTeamName(t.name);
              return true;
          }
      })
      await recordEvent(
        'team-nav',
        `{"params":"${params}","teamid":"${name}"}`
      );
  }, [ params]);


  let TeamsNav = null;
  if (teams && teams.length > 0)
      TeamsNav = teams?.map((t: { id: string, name: string }, i: number) => {
          if (t.id == team)
              setTeamName(t.name);
          return t.id == team ? <SelectedSideTeam key={`sideteam-${i}`}>
              <Link onClick={async () => { await onTeamNav(t.id); }} href={`/pub/league/${league}/team/${t.id}${params}`} shallow>{t.name}</Link></SelectedSideTeam> : <SideTeam key={`sideteam-${i}`}><Link onClick={async () => { onTeamNav(t.id) }} href={`/pub/league/${league}/team/${t.id}${params}`} shallow>{t.name}</Link></SideTeam>
      });
  return (
    <><SideLeagueName>{league}:</SideLeagueName> {TeamsNav}</>
  )
}
export default Teams;
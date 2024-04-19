'use client';
import React from 'react';
import Header from './header';
import Desktop from './desktop';
import Mobile from './mobile';
import { AppWrapper } from '@/lib/context';

interface LeagueLayoutProps {
    fallback: any,
    isMobile: boolean,
    fbclid: string,
    utm_content: string,
    story: string,
    findexarxid: string,
    league?: string,
    view: string,
    tab: string,
    team?:string,
    player?:string,
    pagetype?: string
    
}
const LeagueLayout: React.FC<LeagueLayoutProps> = ({ view: startView, tab: startTab, fallback, isMobile, fbclid, utm_content, story, findexarxid, league: startLeague,team:startTeam="",player:startPlayer="",pagetype:startPagetype="league" }) => {
    const [tab, setTab] = React.useState(startTab||"");
    const [view, setView] = React.useState(startView||"");
    const [league, setLeague] = React.useState(startLeague);
    const [team, setTeam] = React.useState(startTeam);
    const [player, setPlayer] = React.useState(startPlayer);
    const [pagetype, setPagetype] = React.useState(startPagetype);
    console.log("()()()() league",league)
    let context = { tab, view, fallback };
    return (
        <AppWrapper setLeague={setLeague} setTab={setTab} setView={setView} params="" params2="" tp="" tp2="" fallback={fallback} isMobile={isMobile} fbclid={fbclid} utm_content={utm_content} slug={story} findexarxid={findexarxid} league={league} view={view} tab={tab} team={team} player={player} setTeam={setTeam} setPlayer={setPlayer} pagetype={pagetype} setPagetype={setPagetype} >
            <Header context={context} />
            <div ><Desktop />
            <Mobile /></div>
        </AppWrapper>)
}
export default LeagueLayout;
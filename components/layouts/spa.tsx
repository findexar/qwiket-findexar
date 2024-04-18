'use client';
import React from 'react';
import Header from './header';
import MainBody from './body';
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
    
}
const LeagueLayout: React.FC<LeagueLayoutProps> = ({ view: startView, tab: startTab, fallback, isMobile, fbclid, utm_content, story, findexarxid, league: startLeague,team:startTeam="",player:startPlayer="" }) => {
    const [tab, setTab] = React.useState(startView);
    const [view, setView] = React.useState(startTab);
    const [league, setLeague] = React.useState(startLeague);
    const [team, setTeam] = React.useState(startTeam);
    const [player, setPlayer] = React.useState(startPlayer);
    console.log("()()()() league",league)
    let context = { tab, view, fallback };
    return (
        <AppWrapper setLeague={setLeague} setTab={setTab} setView={setView} params="" params2="" tp="" tp2="" fallback={fallback} isMobile={isMobile} fbclid={fbclid} utm_content={utm_content} slug={story} findexarxid={findexarxid} league={league} pagetype="league" view={view} tab={tab} >
            <Header context={context} />
            <MainBody />
        </AppWrapper>)
}
export default LeagueLayout;
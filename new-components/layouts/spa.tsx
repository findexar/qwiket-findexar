'use client';
import React from 'react';
import { ThemeProvider as MuiTP } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
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
    teamid?: string,
    player?: string,
    pagetype?: string

}
const LeagueLayout: React.FC<LeagueLayoutProps> = ({ view: startView, tab: startTab, fallback, isMobile, fbclid, utm_content, story, findexarxid, league: startLeague, teamid: startTeam = "", player: startPlayer = "", pagetype: startPagetype = "league" }) => {
    const [tab, setTab] = React.useState(startTab || "");
    const [view, setView] = React.useState(startView || "");
    const [league, setLeague] = React.useState(startLeague);
    const [teamid, setTeamid] = React.useState(startTeam);
    const [player, setPlayer] = React.useState(startPlayer);
    const [pagetype, setPagetype] = React.useState(startPagetype);
    const [teamName, setTeamName] = React.useState("");
    const [localMode, setLocalMode] = React.useState('unknown');
    console.log("()()()() league", league)
    let context = { tab, view, fallback };
    const muiTheme = useTheme();
    return (
        
        <MuiTP theme={muiTheme}>
            <AppWrapper teamName={teamName} setTeamName={setTeamName} setLeague={setLeague} setTab={setTab} setView={setView} params="" params2="" tp="" tp2="" fallback={fallback} isMobile={isMobile} fbclid={fbclid} utm_content={utm_content} slug={story} findexarxid={findexarxid} league={league} view={view} tab={tab} teamid={teamid} player={player} setTeamid={setTeamid} setPlayer={setPlayer} pagetype={pagetype} setPagetype={setPagetype} mode={localMode} setMode={setLocalMode} >
                <Header context={context} />
                <div ><Desktop />
                    <Mobile /></div>
            </AppWrapper>
        </MuiTP>
    )
}
export default LeagueLayout;
'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head'
import { ThemeProvider as MuiTP } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import GlobalStyle from '@/components/globalstyles';
import { styled, ThemeProvider as StyledThemeProvider } from "styled-components";
/*import Header from './header';
import Desktop from './desktop';
import Mobile from './mobile';*/
//import { AppWrapper } from '@/lib/context';

import Header from "@/components/nav-components/header";
import Desktop from "@/components/nav-components/desktop";
import Mobile from "@/components/nav-components/mobile";
import { palette } from '@/lib/palette';
import { AppWrapper } from '@/lib/context';
import saveSession from '@/lib/fetchers/save-session';
import { Roboto } from 'next/font/google';

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
    team?: string,
    player?: string,
    pagetype?: string,
    dark: number,

}
const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '700'], style: ['normal', 'italic'] })

const LeagueLayout: React.FC<LeagueLayoutProps> = ({ view: startView, tab: startTab, fallback, isMobile, fbclid, utm_content, story, findexarxid, league: startLeague, team: startTeam = "", player: startPlayer = "", pagetype: startPagetype = "league", dark }) => {
    const [tab, setTab] = React.useState(startTab || "");
    const [view, setView] = React.useState(startView || "");
    const [league, setLeague] = React.useState(startLeague);
    const [teamid, setTeamid] = React.useState(startTeam);
    const [player, setPlayer] = React.useState(startPlayer);
    const [pagetype, setPagetype] = React.useState(startPagetype);
    const [teamName,setTeamName]=React.useState("");    
    const [localMode, setLocalMode] = React.useState(dark == -1 ? 'unknown' : dark == 1 ? 'dark' : 'light');

    console.log("()()()() league", league)

    const muiTheme = useTheme();
    useEffect(() => {
        document.body.setAttribute("data-theme", localMode);
    }, [localMode]);
    useEffect(() => {
        if (localMode == 'unknown') {
            const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
            const matches = matchMedia.matches;
            document.body.setAttribute("data-theme", matchMedia.matches ? 'dark' : 'light');
            setLocalMode(matchMedia.matches ? 'dark' : 'light');
            saveSession({dark:matchMedia.matches ? 1:0})

        }

    }, []);
    return (
        <MuiTP theme={muiTheme}>
            <StyledThemeProvider
                //@ts-ignore
                theme={palette}>
                <GlobalStyle $light={localMode == "light"} />
                <AppWrapper teamName={teamName} setTeamName={setTeamName} setLeague={setLeague} setTab={setTab} setView={setView} params="" params2="" tp="" tp2="" fallback={fallback} isMobile={isMobile} fbclid={fbclid} utm_content={utm_content} slug={story} findexarxid={findexarxid} league={league} view={view} tab={tab} teamid={teamid} player={player} setTeamid={setTeamid} setPlayer={setPlayer} pagetype={pagetype} setPagetype={setPagetype} mode={localMode} setMode={setLocalMode} >
                    <Head>
                        <meta name="theme-color" content={localMode == 'dark' ? palette.dark.colors.background : palette.light.colors.background} />
                        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
                    </Head>
                    <Header />
                    <div ><Desktop />
                        <Mobile /></div>
                </AppWrapper>
            </StyledThemeProvider>
        </MuiTP>
    )
}
export default LeagueLayout;
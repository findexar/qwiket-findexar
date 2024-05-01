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
  teamid?: string,
  name?: string,
  view: string,
  tab: string,
  pagetype?: string,
  dark: number,
  teamName?: string,

}
const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '700'], style: ['normal', 'italic'] })

const LeagueLayout: React.FC<LeagueLayoutProps> = ({ view: startView, tab: startTab, fallback, isMobile, fbclid, utm_content, story, findexarxid, league: startLeague, teamid: startTeamid = "", name: startName = "", pagetype: startPagetype = "league", dark, teamName: startTeamName = "" }) => {
  const [tab, setTab] = React.useState(startTab || "");
  const [view, setView] = React.useState(startView || "");
  const [league, setLeague] = React.useState(startLeague);
  const [teamid, setTeamid] = React.useState(startTeamid);
  const [player, setPlayer] = React.useState(startName);
  const [pagetype, setPagetype] = React.useState(startPagetype);
  const [teamName, setTeamName] = React.useState(startTeamName);
  const [localMode, setLocalMode] = React.useState(dark == -1 ? 'unknown' : dark == 1 ? 'dark' : 'light');
  const [params, setParams] = useState("");
  const [params2, setParams2] = useState("");
  const [tp, setTp] = useState("");
  const [tp2, setTp2] = useState("");
  // console.log("()()()() league", league)

  const muiTheme = useTheme();
  useEffect(() => {
    document.body.setAttribute("data-theme", localMode);
  }, [localMode]);
  useEffect(() => {
    let params = '';
    let params2 = ''
    let p: string[] = [];
    let p2: string[] = [];
    if (fbclid)
      p.push(`fbclid=${fbclid}`);
    if (utm_content)
      p.push(`utm_content=${utm_content}`);
    p2 = [...p];
    if (p.length > 0) {
      params = `?${p.join('&')}`;
    }
    if (p2.length > 0) {
      params2 = `&${p2.join('&')}`;
    }
    let tp = tab && tab != 'all' ? `&tab=${tab}` : '';
    let tp2 = tp;
    if (!params2)
      tp2 = tp.replace(/&/g, '?');
    if (!params)
      tp = tp.replace(/&/g, '?');

    setParams(params);
    setParams2(params2)
    setTp(tp);
    setTp2(tp2);
  }, [fbclid, utm_content, tab]);
  useEffect(() => {
    if (localMode == 'unknown') {
      const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
      const matches = matchMedia.matches;
      document.body.setAttribute("data-theme", matchMedia.matches ? 'dark' : 'light');
      setLocalMode(matchMedia.matches ? 'dark' : 'light');
      saveSession({ dark: matchMedia.matches ? 1 : 0 })
    }

  }, []);
  return (
    <MuiTP theme={muiTheme}>
      <StyledThemeProvider
        //@ts-ignore
        theme={palette}>
        <GlobalStyle $light={localMode == "light"} />
        <AppWrapper teamName={teamName} setTeamName={setTeamName} setLeague={setLeague} setTab={setTab} setView={setView} params={params} params2={params2} tp={tp} tp2={tp2} fallback={fallback} isMobile={isMobile} fbclid={fbclid} utm_content={utm_content} slug={story} findexarxid={findexarxid} league={league} view={view} tab={tab} teamid={teamid} player={player} setTeamid={setTeamid} setPlayer={setPlayer} pagetype={pagetype} setPagetype={setPagetype} mode={localMode} setMode={setLocalMode} >
          <main className={roboto.className} >
            <Head>
              <meta name="theme-color" content={localMode == 'dark' ? palette.dark.colors.background : palette.light.colors.background} />
              <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            </Head>
            <Header />
            <Desktop />
            <Mobile />
          </main>
        </AppWrapper>
      </StyledThemeProvider>
    </MuiTP>
  )
}
export default LeagueLayout;
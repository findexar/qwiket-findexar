'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import Script from 'next/script';
import { useSearchParams, usePathname } from 'next/navigation';
import GlobalStyle from '@/components/globalstyles';
import { ThemeProvider as StyledThemeProvider } from "styled-components";
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
  athleteUUId?: string,
  view: string,
  tab: string,
  pagetype?: string,
  dark: number,
  teamName?: string,
}

const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '700'], style: ['normal', 'italic'] });

const LeagueLayout: React.FC<LeagueLayoutProps> = ({
  view: startView,
  tab: startTab,
  fallback,
  isMobile,
  fbclid,
  utm_content,
  story,
  findexarxid: startFindexarxid,
  league: startLeague,
  teamid: startTeamid = "",
  name: startName = "",
  athleteUUId: startAthleteUUId = "",
  pagetype: startPagetype = "league",
  dark,
  teamName: startTeamName = ""
}) => {
  const [tab, setTab] = useState(startTab || "");
  const [view, setView] = useState(startView || "mentions");
  const [league, setLeague] = useState(startLeague);
  const [teamid, setTeamid] = useState(startTeamid);
  const [player, setPlayer] = useState(startName);
  const [athleteUUId, setAthleteUUId] = useState(startAthleteUUId);
  const [pagetype, setPagetype] = useState(startPagetype);
  const [teamName, setTeamName] = useState(startTeamName);
  const [findexarxid, setFindexarxid] = useState(startFindexarxid);
  const [slug, setSlug] = useState(story);
  const [localMode, setLocalMode] = useState(dark === -1 ? 'unknown' : dark === 1 ? 'dark' : 'light');
  const [params, setParams] = useState("");
  const [params2, setParams2] = useState("");
  const [tp, setTp] = useState("");
  const [tp2, setTp2] = useState("");
  //console.log("==> start spa", { startAthleteUUId });
  useEffect(() => {
    document.body.setAttribute("data-theme", localMode);
  }, [localMode]);

  useEffect(() => {
    const className = 'dark';
    const bodyClassList = document.body.classList;
    if (localMode === 'dark') {
      bodyClassList.add(className);
    } else {
      bodyClassList.remove(className);
    }
  }, [localMode]);

  useEffect(() => {
    let params = '';
    let params2 = '';
    let p = [];
    let p2 = [];
    if (fbclid) p.push(`fbclid=${fbclid}`);
    if (utm_content) p.push(`utm_content=${utm_content}`);
    p2 = [...p];
    if (p.length > 0) {
      params = `?${p.join('&')}`;
    }
    if (p2.length > 0) {
      params2 = `&${p2.join('&')}`;
    }
    let tp = tab /*&& tab !== 'all'*/ ? `&tab=${tab}` : '';

    let tp2 = tp;
    if (!params2) tp2 = tp.replace(/&/g, '?');
    if (!params) tp = tp.replace(/&/g, '?');
    console.log("==> view", view);
    if (view == "ai chat") {
      tp = `${tp}&view=ai%20chat`;
      console.log("==> set tp", tp);
    }
    setParams(params);
    setParams2(params2);
    setTp(tp);
    setTp2(tp2);
  }, [fbclid, utm_content, tab, view]);

  useEffect(() => {
    if (localMode === 'unknown') {
      const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
      const matches = matchMedia.matches;
      document.body.setAttribute("data-theme", matches ? 'dark' : 'light');
      setLocalMode(matches ? 'dark' : 'light');
      saveSession({ dark: matches ? 1 : 0 });
    }
  }, []);

  const query = useSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    const id = query?.get('id') || "";
    const qtab = query?.get('tab') || "";
    const qview = query?.get('view') || "mentions";
    const ssr = query?.getAll('ssr') || [];
    const top = query?.get('top') || "";
    const story = query?.get('story');

    if (story !== slug) {
      setSlug(story || "");
    }
    if (findexarxid !== id) {
      setFindexarxid(id);
    }
    if (top) {
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 0);
    }
    if (qtab !== tab) setTab(qtab);
    if (qview !== view) setView(qview);
    let parts = pathname?.split("/") || [];
    let qpagetype = 'league';
    let qleague = parts && parts.length > 1 ? parts[1] : '';
    let qteam = parts && parts.length > 2 ? parts[2] : '';
    let qplayer = parts && parts.length > 3 ? parts[3] : '';
    let qathleteUUId = parts && parts.length > 4 ? parts[4] : '';
    qplayer = qplayer.replaceAll('%20', ' ').replaceAll('_', ' ');;
    qleague = qleague.toUpperCase();
    if (view === 'landing') qpagetype = "landing";

    if (qteam) {
      qpagetype = "team";
      if (qplayer) {

        qpagetype = "player";
      }
    }
    setLeague(qleague);
    setTeamid(qteam);
    console.log("spa setPlayer", qplayer);
    setPlayer(qplayer);
    setAthleteUUId(qathleteUUId);
    setPagetype(qpagetype);
  }, [query]);
  //console.log(`==> spa`, { teamName, league, teamid, player, athleteUUId });
  return (
    <StyledThemeProvider theme={palette}>
      <GlobalStyle $light={localMode === "light"} />
      <AppWrapper
        teamName={teamName}
        setTeamName={setTeamName}
        setLeague={setLeague}
        setTab={setTab}
        setView={setView}
        params={params}
        params2={params2}
        tp={tp}
        tp2={tp2}
        fallback={fallback}
        isMobile={isMobile}
        fbclid={fbclid}
        utm_content={utm_content}
        slug={slug}
        findexarxid={findexarxid}
        league={league}
        view={view}
        tab={tab}
        teamid={teamid}
        player={player}
        athleteUUId={athleteUUId}
        setAthleteUUId={setAthleteUUId}
        setTeamid={setTeamid}
        setPlayer={setPlayer}
        pagetype={pagetype}
        setPagetype={setPagetype}
        mode={localMode}
        setMode={setLocalMode}
        setFindexarxid={setFindexarxid}
        setSlug={setSlug}
      >
        <main className={(localMode === "light" ? roboto.className : roboto.className + " dark") + " h-full "}>
          <Head>
            <meta name="theme-color" content={localMode === 'dark' ? palette.dark.colors.background : palette.light.colors.background} />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
            <link rel="apple-touch-icon" href={process.env.NEXT_PUBLIC_APP_NAME === "Findexar" ? "/FiLogo.png" : "/QLogo.png"} />
            <link rel="shortcut icon" href={process.env.NEXT_PUBLIC_APP_NAME === "Findexar" ? "/FiLogo.png" : "/QLogo.png"} type="image/png" />
            <meta name="theme-color" content={localMode === 'dark' ? palette.dark.colors.background : palette.light.colors.background} />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            {(pagetype !== 'league' || league || teamid || player) && <meta name="robots" content="noindex,nofollow" />}
            <link rel="shortcut icon" type="image/png" href={process.env.NEXT_PUBLIC_APP_NAME === "Findexar" ? "/FiLogo.png" : "/QLogo.png"} />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
          </Head>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_APP_NAME === "Findexar" ? 'G-LWYQDGSGWQ' : 'G-8ZWPQEPDPB'}`} strategy="afterInteractive" />
          <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_APP_NAME === "Findexar" ? 'G-LWYQDGSGWQ' : 'G-8ZWPQEPDPB'}', {
                page_path: window.location.pathname,
              });
            `,
          }} />
          <Header />
          <Desktop />
          <Mobile />
        </main>
      </AppWrapper>
    </StyledThemeProvider>
  );
};

export default LeagueLayout;

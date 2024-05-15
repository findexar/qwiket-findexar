'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head'
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { useSearchParams, usePathname } from 'next/navigation'
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
import { AMentionKey, MetaLinkKey } from '@/lib/keys';
import { actionAMention } from '@/lib/fetchers/mention';
import { ASlugStoryKey } from '@/lib/keys';
import { actionASlugStory } from '@/lib/fetchers/slug-story';
import Script from 'next/script';


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

const LeagueLayout: React.FC<LeagueLayoutProps> = ({ view: startView, tab: startTab, fallback, isMobile, fbclid, utm_content, story, findexarxid: startFindexarxid, league: startLeague, teamid: startTeamid = "", name: startName = "", pagetype: startPagetype = "league", dark, teamName: startTeamName = "" }) => {
  const [tab, setTab] = React.useState(startTab || "");
  const [view, setView] = React.useState(startView || "mentions");
  const [league, setLeague] = React.useState(startLeague);
  const [teamid, setTeamid] = React.useState(startTeamid);
  const [player, setPlayer] = React.useState(startName);
  const [pagetype, setPagetype] = React.useState(startPagetype);
  const [teamName, setTeamName] = React.useState(startTeamName);
  const [findexarxid, setFindexarxid] = React.useState(startFindexarxid);
  const [slug, setSlug] = React.useState(story);
  const router = useRouter();

  //const [mutatePlayers, setMutatePlayers] = React.useState<any>(undefined);
  const [localMode, setLocalMode] = React.useState(dark == -1 ? 'unknown' : dark == 1 ? 'dark' : 'light');
  const [params, setParams] = useState("");
  const [params2, setParams2] = useState("");
  const [tp, setTp] = useState("");
  const [tp2, setTp2] = useState("");
  // console.log("()()()() league", league)

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
  const query = useSearchParams();
  const pathname = usePathname();
  useEffect(() => {
    // Get the updated query params
    console.log("query effect",query,pathname)
    const updatedQueryParams = query;// new URLSearchParams(router.query as any as string);
    const story = updatedQueryParams?.get('story');
    if (story != slug){
      setSlug(story || "");
      console.log("setSlug",{story,slug})
    }
    const id = query?.get('id') || "";
    if (findexarxid != id) {
      setFindexarxid(id);
    }
  }, [query]);

  useEffect(() => {
    const findexarxid = query?.get('id') || "";
    const qtab = query?.get('tab') || "";
    const qview = query?.get('view') || "mentions";
    const ssr = query?.getAll('ssr') || [];
    const top=query?.get('top') || "";
    if(top){
      setTimeout(()=>{
        window.scrollTo(0, 0);
      },0)
    }
    console.log("top sparender:",top)
    setTab(qtab);
    setView(qview);
     let [arg1, arg2, arg3, arg4, arg5, arg6, arg7] = ssr;
    let parts=pathname?.split("/")||[]

    console.log("parts",parts)
     let qpagetype = 'league';
     let qleague = parts&&parts.length>1?parts[1]:'';
     let qteam = parts&&parts.length>2?parts[2]:'';
     let qplayer = parts&&parts.length>3?parts[3]:'';
    // qleague = arg2 || "";
     qleague=qleague.toUpperCase();
     if (view == 'landing')
       qpagetype = "landing";
 
     if (qteam) {
       qpagetype = "team";
       if (qplayer) {
         qplayer = qplayer.replaceAll('_', ' ');
         qpagetype = "player";
       }
     }
     else if (player) {  
       qplayer = qplayer.replaceAll('_', ' ');
       
     }
     console.log("processed parts:",{qleague,qteam,qplayer,qpagetype})
     setLeague(qleague);
     setTeamid(qteam);
     setPlayer(qplayer);
     setPagetype(qpagetype);
   //  setLocalFindexarxid(findexarxid);
  }, [query]);

  console.log("SPARENDER===>", { tab, view, league, teamid, player, pagetype, findexarxid, slug, query, pathname })
  return (

    <StyledThemeProvider
      //@ts-ignore //
      theme={palette}>
      <GlobalStyle $light={localMode == "light"} />
      <AppWrapper teamName={teamName} setTeamName={setTeamName} setLeague={setLeague} setTab={setTab} setView={setView} params={params} params2={params2} tp={tp} tp2={tp2} fallback={fallback} isMobile={isMobile} fbclid={fbclid} utm_content={utm_content} slug={slug} findexarxid={findexarxid} league={league} view={view} tab={tab} teamid={teamid} player={player} setTeamid={setTeamid} setPlayer={setPlayer} pagetype={pagetype} setPagetype={setPagetype} mode={localMode} setMode={setLocalMode} setFindexarxid={setFindexarxid} setSlug={setSlug}  >
        <main className={(localMode == "light" ? roboto.className : roboto.className + " dark") + " h-full"} >
          <Head>
            <meta name="theme-color" content={localMode == 'dark' ? palette.dark.colors.background : palette.light.colors.background} />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>

            <link rel="apple-touch-icon" href={process.env.NEXT_PUBLIC_APP_NAME == "Findexar" ? "/FiLogo.png" : "/QLogo.png"}></link>
            <link rel="shortcut icon" href={process.env.NEXT_PUBLIC_APP_NAME == "Findexar" ? "/FiLogo.png" : "/QLogo.png"} type="image/png" />
            <meta name="theme-color" content={localMode == 'dark' ? palette.dark.colors.background : palette.light.colors.background} />
            <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
            {(pagetype != 'league' || league || teamid || player) && <meta name="robots" content="noindex,nofollow" />}
            <link
              rel="shortcut icon"
              type="image/png"
              href={process.env.NEXT_PUBLIC_APP_NAME == "Findexar" ? "/FiLogo.png" : "/QLogo.png"}
            />
            <meta name="viewport" content="width=device-width, initial-scale=1" />

          </Head>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_APP_NAME == "Findexar" ? 'G-LWYQDGSGWQ' : 'G-8ZWPQEPDPB'}`} strategy="afterInteractive"></Script>
          <Script id="google-analytics" strategy="afterInteractive" dangerouslySetInnerHTML={{
            __html: `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_APP_NAME == "Findexar" ? 'G-LWYQDGSGWQ' : 'G-8ZWPQEPDPB'}', {
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

  )
}
export default LeagueLayout;

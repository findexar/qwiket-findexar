'use client';
import React, { useEffect, useState } from 'react';
import Head from 'next/head'
import useSWR from 'swr';

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
  const [view, setView] = React.useState(startView || "");
  const [league, setLeague] = React.useState(startLeague);
  const [teamid, setTeamid] = React.useState(startTeamid);
  const [player, setPlayer] = React.useState(startName);
  const [pagetype, setPagetype] = React.useState(startPagetype);
  const [teamName, setTeamName] = React.useState(startTeamName);
  const[findexarxid,setFindexarxid] = React.useState(startFindexarxid);
  const[slug,setSlug] = React.useState(story);


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


  const aMentionKey: AMentionKey = { type: "AMention", findexarxid };
  const { data: amention } = useSWR(aMentionKey, actionAMention, { fallback })
  const { summary: amentionSummary = "", league: amentionLeague = "", type = "", team: amentionTeam = "", teamName: amentionTeamName = "", name: amentionPlayer = "", image: amentionImage = "", date: amentionDate = "" } = amention ? amention : {};
  const aSlugStoryKey: ASlugStoryKey = { type: "ASlugStory", slug };
  let { data: aSlugStory } = useSWR(aSlugStoryKey, actionASlugStory);
  let astory = aSlugStory;
  const { title: astoryTitle = "", site_name: astorySite_Name = "", authors: astoryAuthors = "", digest: astoryDigest = "", image: astoryImage = "", createdTime: astoryDate = "", mentions: mentions = [], image_width = 0, image_height = 0 } = astory ? astory : {};
  const astoryImageOgUrl = astoryImage ? `${process.env.NEXT_PUBLIC_SERVER}/api/og.png/${encodeURIComponent(astoryImage || "")}/${encodeURIComponent(astorySite_Name || "")}/${image_width}/${image_height}` : ``;

  //prep meta data for amention
  let ogUrl = '';
  if (amention && amentionLeague && amentionTeam && amentionPlayer) {
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${amentionLeague}/team/${amentionTeam}/player/${amentionPlayer}?id=${findexarxid}`;
  } else if (amention && amentionLeague && amentionTeam) {
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${amentionLeague}/team/${amentionTeam}?id=${findexarxid}`;
  } else if (amention && amentionLeague) {
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${amentionLeague}?id=${findexarxid}`;
  }
  else if (amention)
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub?id=${findexarxid}`;
  else
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}`;
  let ogTarget = '';
  if (amention && amentionLeague && amentionTeam && amentionPlayer && type == 'person')
    ogTarget = `${amentionPlayer} of ${amentionTeamName}`;
  else if (amention && amentionLeague && amentionTeam)
    ogTarget = `${amentionTeamName} on ${process.env.NEXT_PUBLIC_APP_NAME}`;

  let ogDescription = amentionSummary ? amentionSummary : "Fantasy Sports Media Index.";
  let ogImage = astoryImageOgUrl ? astoryImageOgUrl : process.env.NEXT_PUBLIC_APP_NAME == "Findexar" ? "https://findexar.com/findexar-logo.png" : "https://www.qwiket.com/QLogo.png";
  let ogTitle = ogTarget ? `${ogTarget}` : `${[process.env.NEXT_PUBLIC_APP_NAME]} Sports Media Index`;
  if (astory) {
    ogUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${league}?${story ? `story=${story}` : ``}`
      : `${process.env.NEXT_PUBLIC_SERVER}/pub?${story ? `story=${story}` : ``}`;
    ogTitle = astoryTitle;
    ogDescription = astoryDigest.replaceAll('<p>', '').replaceAll('</p>', "\n\n");
    ogImage = astoryImageOgUrl;
  }
  const noindex = +(process.env.NEXT_PUBLIC_NOINDEX || "0");

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
            <link rel="canonical" href={ogUrl} />
            {(noindex == 1) && <meta name="robots" content="noindex,nofollow" />}
            <meta property="og:description" content={ogDescription} />
            <meta name="title" content={ogTitle} />
            <meta property="og:title" content={ogTitle} />
            <meta name="description" content={ogDescription} />
            <meta property="og:type" content="website" />
            <meta property="fb:appid" content="358234474670240" />
            <meta property="og:site_name" content={process.env.NEXT_PUBLIC_APP_NAME == "Finexar" ? "findexar.com" : "qwiket.com"} />
            <meta property="og:image" data-type="new3" content={ogImage} />
            <meta property="og:url" content={ogUrl} />

            <meta property="findexar:verify" content="findexar" />
            <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:site" content="@findexar" />
            <meta name='viewport' content='width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no' />
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

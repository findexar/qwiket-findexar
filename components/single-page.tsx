import React, { use, useCallback, useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
//next
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { Roboto } from 'next/font/google';
import Script from "next/script";
import useSWR from 'swr';
//styled-components
import { styled, ThemeProvider } from "styled-components";
//mui
import { Tabs, Tab, } from '@mui/material'
import { ThemeProvider as MuiTP } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
//stripe
import { useSubscription } from "use-stripe-subscription";
//other
import 'material-icons/iconfont/outlined.css';
import { palette } from '@/lib/palette';
import GlobalStyle from '@/components/globalstyles';
import { recordEvent, AMentionKey, getAMention, getASlugStory, ASlugStoryKey } from '@/lib/api';
import { AppWrapper } from '@/lib/context';

import Header from "@/components/nav-components/header";
import Desktop from "@/components/nav-components/desktop";
import Mobile from "@/components/nav-components/mobile";
import SubscriptionMenu from "./util-components/subscription-menu";

/*==========================================*/
interface LeaguesNavProps {
  selected: boolean;
}

const LeaguesTab = styled(Tab) <LeaguesNavProps>`
   color:${({ selected }) => selected ? 'var(--mobile-leagues-selected)' : 'var(--mobile-leagues-text)'} !important;
   :hover{
      color:var(--mobile-leagues-highlight) !important;
   }
`;
/*==========================================*/
interface Props {
  disable?: boolean;
  dark?: number;
  fbclid?: string;
  utm_content?: string;
  isbot?: number;
  isfb?: number;
  sessionid?: string;
  leagues: string[];
  league?: string;
  team?: string;
  player?: string;
  pagetype?: string;
  view: string;
  userId?: string;
  createdAt?: string;
  freeUser?: boolean;
  list?: string;
  t1: number;
  tab: string;
  mode: string;
  findexarxid: string;
  teamName: string;
  slug: string;
  tracker_filter: number;
}
const SubscriptionWrap = styled.div`
  margin-top:20px;
`;

const roboto = Roboto({ subsets: ['latin'], weight: ['300', '400', '700'], style: ['normal', 'italic'] })

const SinglePage: React.FC<Props> = (props) => {
  let { teamName: tn, findexarxid, slug = "", tab, t1, fbclid = "", isbot, freeUser, createdAt, userId, utm_content, dark, leagues, league = "", team = "", pagetype = "league", player = "", view = "" } = props;

  const [localTeam, setLocalTeam] = useState(team);
  const [localPlayer, setLocalPlayer] = useState(player);
  const [localPageType, setLocalPageType] = useState(pagetype || 'landing');
  const [localLeague, setLocalLeague] = useState(league.toUpperCase());
  const [subscriptionPrompt, setSubscriptionPrompt] = useState(false);
  const [dismiss, setDismiss] = useState(false);
  const [hardStop, setHardStop] = useState(false);
  const [params, setParams] = useState("");
  const [params2, setParams2] = useState("");
  const [localUserId, setLocalUserId] = useState(userId || "");
  const [tp, setTp] = useState("");
  const [tp2, setTp2] = useState("");
  const [localTab, setLocalTab] = React.useState(tab);
  const [localMode, setLocalMode] = React.useState(dark == -1 ? 'unknown' : dark == 1 ? 'dark' : 'light');
  const [localFindexarxid, setLocalFindexarxid] = React.useState(findexarxid || "");
  const [localSlug, setLocalSlug] = React.useState(slug || "");
  const [localView, setLocalView] = useState(view.toLowerCase());
  const [teamName, setTeamName] = useState(tn);
  const router = useRouter();
  const muiTheme = useTheme();
  const fullScreen = useMediaQuery(muiTheme.breakpoints.down('md'));
  const isMobile = useMediaQuery('(max-width:1199px)');
  const { isLoaded: isClerkLoaded, isSignedIn, user } = useUser();

  //console.log("isSignedIn:", isSignedIn, "isLoaded:", isClerkLoaded, "user:", user);

  useEffect(() => {
    if (isClerkLoaded && isSignedIn) {
      if (user.id != localUserId)
        setLocalUserId(user.id);
    }
  }, [isClerkLoaded, isSignedIn, user]);

  useEffect(() => {
    document.body.setAttribute("data-theme", localMode);
  }, [localMode]);

  useEffect(() => {
    setLocalTeam(team);
  }, [team]);

  useEffect(() => {
    setLocalPlayer(player);
  }, [player]);

  useEffect(() => {
    console.log("setPagetype:", pagetype)
    setLocalPageType(pagetype);
  }, [pagetype]);

  useEffect(() => {
    setLocalLeague(league.toUpperCase());
  }, [league]);


  view = view ? view.toLowerCase() : "";
  const subscriptionObject = useSubscription();
  const {
    isLoaded,
    products,
    subscription,
    redirectToCheckout,
    redirectToCustomerPortal,
  } = subscriptionObject;

  useEffect(() => {
    if (isLoaded && !freeUser) {
      if (!subscription && userId) {
        const now = new Date().getTime();
        const diff: number = (now - (+(createdAt || 0))) / 1000;

        if (diff > 10000 * 24 * 3600) { // if account created over three days ago, hard stop
          console.log("hard stop");
          setSubscriptionPrompt(true);
          setHardStop(true);
        }
        else if (diff > 7 * 24 * 3600) {
          console.log("soft stop");
          setSubscriptionPrompt(true);
        }
      }
    }
  }, [isLoaded, subscription, products, userId, createdAt, freeUser]);

 
  useEffect(() => {
    setLocalView(view.toLowerCase());

  }, [view]);

  let v = (!localView || localView == "home") ? "mentions" : localView;
  v = v.toLowerCase();

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
    let tp = localTab && localTab != 'all' ? `&tab=${localTab}` : '';
    let tp2 = tp;
    if (!params2)
      tp2 = tp.replace(/&/g, '?');
    if (!params)
      tp = tp.replace(/&/g, '?');

    setParams(params);
    setParams2(params2)
    setTp(tp);
    setTp2(tp2);
  }, [fbclid, utm_content, localTab]);

  useEffect(() => {
    if (t1 > 0) {
      const t2 = new Date().getTime();
      recordEvent(`spa-loaded-time`, `{"fbclid":"${fbclid}","utm_content":"${utm_content}", "slug":"${slug}", "findexarxid":"${findexarxid}","t1":"${t1}","time":"${t2 - t1 || 0}"}`).then(() => { });
    }
  }, [fbclid, t1, utm_content, slug, findexarxid]);

  useEffect(() => {
    if (pagetype != 'landing') {
      try {
        recordEvent(`spa-enter`, `{"fbclid":"${fbclid}","isbot":"${isbot}","league":"${league}", "team":"${team}", "player":"${player}", "pagetype":"${pagetype}", "view":"${view}", "userId":"${localUserId}", "slug":"${slug}", "findexarxid":"${findexarxid}","utm_content":"${utm_content}"}`)
          .then((r: any) => {
            console.log("recordEvent", r);
          });
      } catch (x) {
        console.log('recordEvent', x);
      }
    }
  }, [pagetype, league, team, player, view, fbclid, utm_content, isbot, localUserId]);

  useEffect(() => {
    if (localMode == 'unknown') {
      const matchMedia = window.matchMedia("(prefers-color-scheme: dark)");
      const matches = matchMedia.matches;
      document.body.setAttribute("data-theme", matchMedia.matches ? 'dark' : 'light');
      setLocalMode(matchMedia.matches ? 'dark' : 'light');
    }

  }, []);

  console.log("PAGE state:", { userId, localUserId, v, localMode, localPageType, localLeague, localTeam, localPlayer, params, params2 })

  const aMentionKey: AMentionKey = { type: "AMention", findexarxid: localFindexarxid, noLoad: localFindexarxid !== "" ? false : true };
  const { data: amention } = useSWR(aMentionKey, getAMention)
  const { summary: amentionSummary = "", league: amentionLeague = "", type = "", team: amentionTeam = "", teamName: amentionTeamName = "", name: amentionPlayer = "", image: amentionImage = "", date: amentionDate = "" } = amention ? amention : {};
  const aSlugStoryKey: ASlugStoryKey = { type: "ASlugStory", slug: localSlug, noLoad: localSlug == "" ? true : false };
  let { data: aSlugStory } = useSWR(aSlugStoryKey, getASlugStory);
  let astory = aSlugStory;
  const { title: astoryTitle = "", site_name: astorySite_Name = "", authors: astoryAuthors = "", digest: astoryDigest = "", image: astoryImage = "", createdTime: astoryDate = "", mentions: mentions = [], image_width = 0, image_height = 0 } = astory ? astory : {};
  const astoryImageOgUrl = astoryImage ? `${process.env.NEXT_PUBLIC_SERVER}/api/og.png/${encodeURIComponent(astoryImage || "")}/${encodeURIComponent(astorySite_Name || "")}/${image_width}/${image_height}` : ``;

  //prep meta data for amention
  let ogUrl = '';
  if (amention && amentionLeague && amentionTeam && amentionPlayer)
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${amentionLeague}/team/${amentionTeam}/player/${amentionPlayer}?id=${localFindexarxid}`;
  else if (amention && amentionLeague && amentionTeam)
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${amentionLeague}/team/${amentionTeam}?id=${localFindexarxid}`;
  else if (amention && amentionLeague)
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${amentionLeague}?id=${localFindexarxid}`;
  else if (amention)
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/pub?id=${localFindexarxid}`;
  else
    ogUrl = `${process.env.NEXT_PUBLIC_SERVER}`;
  let ogTarget = '';
  if (amention && amentionLeague && amentionTeam && amentionPlayer && type == 'person')
    ogTarget = `${amentionPlayer} of ${amentionTeamName}`;
  else if (amention && amentionLeague && amentionTeam)
    ogTarget = `${amentionTeamName} on ${process.env.NEXT_PUBLIC_SITE_NAME}`;

  let ogDescription = amentionSummary ? amentionSummary : "Fantasy Sports Media Index.";
  let ogImage = astoryImageOgUrl ? astoryImageOgUrl : process.env.NEXT_PUBLIC_SITE_NAME == "Findexar" ? "https://findexar.com/findexar-logo.png" : "https://www.qwiket.com/QLogo.png";
  let ogTitle = ogTarget ? `${ogTarget}` : `${[process.env.NEXT_PUBLIC_SITE_NAME]} Sports Media Index`;
  if (astory) {
    ogUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${league}?${localSlug ? `story=${localSlug}` : ``}`
      : `${process.env.NEXT_PUBLIC_SERVER}/pub?${localSlug ? `story=${localSlug}` : ``}`;
    ogTitle = astoryTitle;
    ogDescription = astoryDigest.replaceAll('<p>', '').replaceAll('</p>', "\n\n");
    ogImage = astoryImageOgUrl;
  }
  const noindex = +(process.env.NEXT_PUBLIC_NOINDEX || "0");
  return (
    <>
      <Head>
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
       <meta name="theme-color" content={localMode == 'dark' ? palette.dark.colors.background : palette.light.colors.background} />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
         {(pagetype != 'league' || league || team || player) && <meta name="robots" content="noindex,nofollow" />}
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
      <MuiTP theme={muiTheme}>
        <main className={roboto.className} >
          <ThemeProvider
            //@ts-ignore
            theme={palette}>
            <GlobalStyle $light={localMode == "light"} />
            <AppWrapper userId={localUserId} isMobile={isMobile} setUserId={setLocalUserId} params={params} params2={params2} tp={tp} tp2={tp2} findexarxid={localFindexarxid} view={v} tab={localTab} noUser={!localUserId} mode={localMode} setMode={setLocalMode} pagetype={localPageType} setLeague={setLocalLeague} setPagetype={setLocalPageType} setPlayer={setLocalPlayer} setTeam={setLocalTeam} setTab={setLocalTab} setView={setLocalView} league={localLeague.toUpperCase()} team={localTeam} player={localPlayer} fbclid={fbclid} utm_content={utm_content} teamName={teamName} setTeamName={setTeamName} slug={localSlug} setSlug={setLocalSlug}>
              <Header leagues={leagues} />
              {!dismiss && subscriptionPrompt && <SubscriptionWrap><SubscriptionMenu products={products} redirectToCheckout={redirectToCheckout}
                redirectToCustomerPortal={redirectToCustomerPortal}
                setDismiss={(val: boolean) => { setDismiss(val); }} hardStop={hardStop} /></SubscriptionWrap>}
              {!isMobile && !hardStop && <Desktop />}
              {isMobile && !hardStop && <Mobile />}
            </AppWrapper>
          </ThemeProvider>
        </main>
      </MuiTP>
    </>
  )
}

export default SinglePage;
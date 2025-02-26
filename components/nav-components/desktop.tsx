'use client'
import React, { useCallback, useEffect, useMemo } from "react";
import { styled } from "styled-components";
import Landing from "@/components/func-components/landing";
import Teams from "@/components/func-components/teams";
import Welcome from "@/components/func-components/welcome";
import Readme from "@/components/func-components/readme";
import TeamMentions from "@/components/func-components/team-mentions";
import PlayerMentions from "@/components/func-components/player-mentions";
import MyfeedMentions from "@/components/func-components/myfeed-mentions";
import FavMentions from "@/components/func-components/fav-mentions";
import Stories from "@/components/func-components/stories";
import Chat from "@/components/func-components/chat";
import MyTeam from "@/components/func-components/myteam";
import Players from "@/components/func-components/players";
import { useAppContext } from '@/lib/context';
import TertiaryTabs from "@/components/nav-components/tertiary-tabs";
import MentionOverlay from "@/components/func-components/mention-overlay";
import StoryOverlay from "@/components/func-components/story-overlay";
import { actionRecordEvent } from "@lib/server-actions/event";
import LeagueMentions from "../func-components/league-mentions";
import PromptsComponent from "../func-components/prompts";
import Blog from "@/components/func-components/blog";
import BlogArticle from "@/components/func-components/blog-article";
const PageWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
`;

const Page = styled.div`
  max-width: 1800px;
  @media screen and (max-width: 2200px) {
    max-width: 1600px;
  }
  @media screen and (max-width: 1800px) {
    max-width: 1300px;
  }
  @media screen and (max-width: 1400px) {
    max-width: 1200px;
  }
  @media screen and (max-width: 1300px) {
    max-width: 900px;
  }
`;

const ContainerWrap = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 1000px;
  height: auto;
  width: 100%;
  font-family: 'Roboto', sans-serif;
  font-size: 14px;
  margin-top: 12px;
  color: var(--text);
  @media screen and (max-width: 1023px) {
    //display: none;

  }
  @media screen and (min-width: 1600px) {
    font-size: 18px;
  }
  @media screen and (min-width: 1800px) {
    font-size: 19px;
  }
  @media screen and (min-width: 2000px) {
    font-size: 20px;
  }
`;

const MainPanel = styled.div`
  display: flex;
  position: relative;
  flex-direction: row;
  justify-content: flex-start;
  height: 100%;
  min-height: 100vh;
`;

const LeftPanel = styled.div`
  min-width: 300px;
  max-width: 300px;
  height: auto !important;
  background-color: var(--background);
  padding-top: 18px;
  padding-left: 20px;
  flex-grow: 1;
  a {
    color: var(--text);
    text-decoration: none;
    &:hover {
      color: var(--highlight);
    }
  }
  overflow-y: hidden;
  overflow-x: hidden;
 
  max-height: 750vh;
  position: sticky;
 // top: -1550px;
  @media screen and (max-width: 1200px) {
    top: -300px;
    min-width: 200px;
    width: 250px;
  }
`;

const CenterPanel = styled.div`
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding-top: 10px;
  padding-bottom: 40px;
  height: auto;
  flex-grow: 2;
  width: 400px;
  min-width: 420px;
  
  @media screen and (min-width: 1200px) {
    width: 600px;
    min-width: 600px;
  }
  @media screen and (min-width: 1300px) {
    width: 6500px;
    min-width: 650px;
  }
  
  @media screen and (min-width: 1600px) {
    width: 700px;
    min-width: 700px;
  }
  @media screen and (min-width: 1800px) {
    width: 900px;
    min-width: 900px;
  }
  
  @media screen and (min-width: 2400px) {
    width: 1000px;
    min-width: 1000px;
  }
`;

const RightPanel = styled.div`
  width: 350px;
  padding-left: 20px;
  //flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding-top: 10px;
  a {
    color: var(--text);
    text-decoration: none;
    &:hover {
      color: var(--highlight);
    }
  }
  @media screen and (max-width: 1400px) {
    min-width: 300px;
    width: 300px;
  }
  @media screen and (max-width: 1200px) {
    min-width: 300px;
    width: 300px;
  }
`;

interface Props { }

const Desktop: React.FC<Props> = () => {
  const {
    teamid,
    slug, m, cm, cstory, b, tab: initialTab, rtab: initialRtab, view: initialView, setView, setTab, setRtab, fbclid, utm_content, player, athleteUUId, params, league, pagetype, findexarxid, bot
  } = useAppContext();
  const [loading, setLoading] = React.useState(false);
  const [localFindexarxid, setLocalFindexarxid] = React.useState(findexarxid);
  let tab = initialTab || "all";
  let rtab = initialRtab || "";
  let view = initialView || "";

  //  console.log("==> view", view, tab);
  if (tab === 'chat') {
    view = 'mentions';
  }
  //if (tab == 'mentions')
  //  tab = '';

  // console.log("==> rtab", { rtab, tab, initialRtab, initialTab });
  //console.log("==> teamid, player, athleteUUId", teamid, player, athleteUUId);
  useEffect(() => {
    setLocalFindexarxid(findexarxid);
  }, [findexarxid]);

  const onTabNav = (option: any) => {
    const newTab = option.tab;
    /* const tabParam = newTab !== 'all' ? params ? `&tab=${newTab}&rtab=${rtab}` : `?tab=${newTab}&rtab=${rtab}` : '';
     const newPath = league ? `/${league}${params}${tabParam}` : params ? `/${params}${tabParam}` : `/?tab=${newTab}&rtab=${rtab}`;
     window.history.pushState({}, "", newPath);*/
    setTimeout(() => setTab(newTab), 0);
    //setLoading(true);
    if (rtab !== '') {
      setTimeout(() => setRtab(rtab), 0);
    }
    setView("mentions");
    if (!bot) {
      setTimeout(async () => await actionRecordEvent('tab-nav', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","tab":"${newTab}"}`), 1);
    }
  }
  useEffect(() => {
    setLoading(false);
  }, [tab]);
  const onRTabNav = (option: any) => {
    const newTab = option.tab;
    /* const tabParam = (tab !== 'all' && tab != '') ? params ? `&tab=${tab}&rtab=${newTab}` : `?tab=${tab}&rtab=${newTab}` : params ? `&rtab=${newTab}` : `?rtab=${newTab}`;
     const newPath = league ? `/${league}${params}${tabParam}` : params ? `/${params}${tabParam}` : `/${tabParam}`;
     window.history.pushState({}, "", newPath);
    */ // console.log("==> newPath", newPath);*/
    setTimeout(() => setRtab(newTab), 0);
    if (tab !== '') {
      setTimeout(() => setTab(tab), 0);
    }
    //setView("mentions");
    if (!bot) {
      setTimeout(async () => await actionRecordEvent('rtab-nav', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","rtab":"${newTab}"}`), 1);
    }
  }
  const onTeamPlayerTabNav = useCallback((option: any) => {
    const newTab = option.tab;
    /*const tabParam = newTab !== 'mentions' ? params ? `&tab=${newTab}` : `?tab=${newTab}` : '';
    const newPath = player ? `/${league}/${teamid}/${player}/${athleteUUId}${params}${tabParam}` : params ? `/${league}/${teamid}/${params}${tabParam}` : `/${league}/${teamid}?tab=${newTab}`;
    window.history.pushState({}, "", newPath);*/
    setTimeout(() => setTab(newTab), 0);
    setView("mentions");
    if (!bot) {
      setTimeout(async () => await actionRecordEvent('tab-nav', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","tab":"${newTab}"}`), 1);
    }
  }, [bot, fbclid, utm_content]);

  const teamPlayerTabPath = (tab: string) => {

    const tabParam = tab !== 'all' ? params ? `${params}&tab=${tab}${rtab ? `&rtab=${rtab}` : ""}` : `?tab=${tab}${rtab ? `&rtab=${rtab}` : ""}` : '';
    //const newPath = league ? `/${league}${params}${tabParam}` : params ? `/${params}${tabParam}` : `/?tab=${tab}&rtab=${rtab}`;
    const newPath = `/${league}/${teamid}/${pagetype === "player" ? `/${player}/${athleteUUId}` : ""}${tabParam}`;
    return newPath;
  }
  const tabPath = (tab: string) => {
    const tabParam = tab !== 'all' ? params ? `${params}&tab=${tab}${rtab ? `&rtab=${rtab}` : ""}` : `?tab=${tab}${rtab ? `&rtab=${rtab}` : ""}` : '';
    const newPath = league ? `/${league}${tabParam}` : `/${tabParam}`;
    return newPath;


  }
  const rtabPath = (tab: string, rtab: string) => {

    const tabParam = (tab !== 'all' && tab != '') ? params ? `${params}&tab=${tab}&rtab=${rtab}` : `?tab=${tab}&rtab=${rtab}` : params ? `${params}&rtab=${rtab}` : `?rtab=${rtab}`;
    const newPath = league ? `/${league}${params}${tabParam}` : `/${tabParam}`;
    return newPath;

  };
  // tab = tab || 'all';
  console.log("==> pagetype", pagetype, tab, view, cstory, cm);
  let noshow = (cstory || cm) && tab !== 'blog';
  return (
    <div className="lg:block hidden h-full w-full">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-white border-opacity-30 border-t-white"></div>
        </div>
      )}
      <ContainerWrap>
        {localFindexarxid && <MentionOverlay setDismiss={() => setView("mentions")} mutate={() => { }} />}
        {(slug || m || cm) && !cstory && !cm && <StoryOverlay idx={"desktop"} setDismiss={() => setView("mentions")} mutate={() => { }} />}
        <PageWrap>
          <Page>
            {pagetype === "landing" ? <Landing /> : (
              <MainPanel>
                <LeftPanel>
                  {league ? <Teams /> : <Welcome />}
                </LeftPanel>
                <CenterPanel>
                  {pagetype === "league" && view !== 'about' && (
                    <TertiaryTabs
                      options={[
                        { name: `Articles`, tab: 'all', disabled: false, link: tabPath('all') },
                        { name: `Podcasts`, tab: 'podcasts', disabled: false, link: tabPath('podcasts') },
                        { name: `AI`, tab: 'chat', disabled: false, link: tabPath('chat') },
                        { name: "MyTeam", tab: "myteam", disabled: false, link: tabPath('myteam') },
                        { name: "Blog", tab: "blog", disabled: false, link: tabPath('blog') },
                      ]}
                      onChange={onTabNav}
                      selectedOptionName={tab}
                    />
                  )}
                  {(pagetype === "team" || pagetype === "player") && view !== 'about' && (
                    <TertiaryTabs
                      options={[
                        { name: `Articles`, tab: 'all', disabled: false, link: teamPlayerTabPath('all') },
                        { name: `Podcasts`, tab: 'podcasts', disabled: false, link: teamPlayerTabPath('podcasts') },
                        { name: `AI Chat`, tab: 'chat', disabled: false, link: teamPlayerTabPath('chat') },
                        { name: `@`, tab: 'mentions', disabled: false, link: teamPlayerTabPath('mentions') },
                        { name: "?", tab: "prompts", disabled: false, link: teamPlayerTabPath('prompts') },
                      ]}
                      onChange={onTeamPlayerTabNav}
                      selectedOptionName={tab}
                    />
                  )}
                  {(cstory || cm) && tab !== 'blog' && <StoryOverlay idx={"desktop"} setDismiss={() => setView("mentions")} mutate={() => { }} incolumn={true} />}
                  {(pagetype === "team" || (pagetype === "league" && tab === "myteam")) && (tab === "mentions" || tab === "") && !noshow ? <TeamMentions /> : null}
                  {pagetype === "player" && (tab === "mentions" || tab === "") && !noshow ? <PlayerMentions /> : null}
                  {pagetype === "league" && view !== 'about' && (tab === 'all' || tab === '') && !noshow ? <Stories /> : null}
                  {pagetype === "team" && view !== 'about' && (tab === 'all' || tab === '') && !noshow ? <Stories /> : null}
                  {pagetype === "player" && view !== 'about' && (tab === 'all' || tab === '') && !noshow ? <Stories /> : null}
                  {pagetype === "league" && view !== 'about' && (tab === 'podcasts' || tab === '') && !noshow ? <Stories type="v" /> : null}
                  {pagetype === "team" && view !== 'about' && (tab === 'podcasts' || tab === '') && !noshow ? <Stories type="v" /> : null}
                  {pagetype === "player" && view !== 'about' && (tab === 'podcasts' || tab === '') && !noshow ? <Stories type="v" /> : null}

                  {view === 'about' && !noshow && <Readme />}
                  {(pagetype === 'league' && tab === 'chat') && !noshow && <Chat source="desktop" />}
                  {(pagetype === 'team' || pagetype === 'player') && (tab === 'chat') && !noshow && <Chat source="desktop" />}
                  {(pagetype === 'league' && tab === 'myteam') && !noshow && <MyTeam />}
                  {(pagetype === 'team' || pagetype === 'player') && (tab === 'prompts') && !noshow && <PromptsComponent />}
                  {(pagetype === 'league' && tab === 'blog' && !b) && !noshow && <Blog />}
                  {(pagetype === 'league' && tab === 'blog' && b) && !noshow && <BlogArticle />}

                </CenterPanel>
                <RightPanel>
                  {pagetype === 'league' && (<>
                    <TertiaryTabs
                      options={[
                        { name: `@`, tab: '', disabled: false, link: rtabPath(tab, '') },
                        { name: "MyFeed", tab: "myfeed", disabled: false, link: rtabPath(tab, 'myfeed') },
                        { name: "Favorites", tab: "fav", disabled: false, link: rtabPath(tab, 'fav') }
                      ]}
                      onChange={onRTabNav}
                      selectedOptionName={rtab}
                    />
                    {pagetype === "league" && rtab === "myfeed" && <MyfeedMentions league={league} />}
                    {pagetype === "league" && rtab === "fav" && <FavMentions />}
                    {pagetype === "league" && rtab === "" && <LeagueMentions />}

                  </>
                  )}
                  {(pagetype === 'team' || pagetype === 'player') && <Players />}
                </RightPanel>
              </MainPanel>
            )}
          </Page>
        </PageWrap>
      </ContainerWrap>
    </div >
  )
}
export default Desktop;

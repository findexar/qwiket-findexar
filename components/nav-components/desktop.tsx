'use client'
import React, { useEffect } from "react";
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
  @media screen and (mox-width: 1400px) {
    max-width: 1200px;
  }
  @media screen and (mox-width: 1300px) {
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
    display: none;
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
  min-width: 400px;
  
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
    slug, m, tab: initialTab, rtab: initialRtab, view: initialView, setView, setTab, setRtab, fbclid, utm_content, player, athleteUUId, params, league, pagetype, findexarxid, bot
  } = useAppContext();

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
    const tabParam = newTab !== 'all' ? params ? `&tab=${newTab}&rtab=${rtab}` : `?tab=${newTab}&rtab=${rtab}` : '';
    const newPath = league ? `/${league}${params}${tabParam}` : params ? `/${params}${tabParam}` : `/?tab=${newTab}&rtab=${rtab}`;
    window.history.pushState({}, "", newPath);
    setTimeout(() => setTab(newTab), 0);
    if (rtab !== '') {
      setTimeout(() => setRtab(rtab), 0);
    }
    setView("mentions");
    if (!bot) {
      setTimeout(async () => await actionRecordEvent('tab-nav', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","tab":"${newTab}"}`), 1);
    }
  }
  const onRTabNav = (option: any) => {
    const newTab = option.tab;
    const tabParam = (tab !== 'all' && tab != '') ? params ? `&tab=${tab}&rtab=${newTab}` : `?tab=${tab}&rtab=${newTab}` : params ? `&rtab=${newTab}` : `?rtab=${newTab}`;
    const newPath = league ? `/${league}${params}${tabParam}` : params ? `/${params}${tabParam}` : `/${tabParam}`;
    window.history.pushState({}, "", newPath);
    // console.log("==> newPath", newPath);
    setTimeout(() => setRtab(newTab), 0);
    if (tab !== '') {
      setTimeout(() => setTab(tab), 0);
    }
    //setView("mentions");
    if (!bot) {
      setTimeout(async () => await actionRecordEvent('rtab-nav', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","rtab":"${newTab}"}`), 1);
    }
  }
  const onTeamPlayerTabNav = (option: any) => {
    const newTab = option.tab;
    const tabParam = newTab !== 'mentions' ? params ? `&tab=${newTab}` : `?tab=${newTab}` : '';
    const newPath = player ? `/${league}/${teamid}/${player}/${athleteUUId}${params}${tabParam}` : params ? `/${league}/${teamid}/${params}${tabParam}` : `/${league}/${teamid}?tab=${newTab}`;
    window.history.pushState({}, "", newPath);
    setTimeout(() => setTab(newTab), 0);
    setView("mentions");
    if (!bot) {
      setTimeout(async () => await actionRecordEvent('tab-nav', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","tab":"${newTab}"}`), 1);
    }
  }
  // tab = tab || 'all';
  //console.log("==> pagetype", pagetype, tab, view);
  return (
    <div className="lg:block hidden h-full w-full">
      <ContainerWrap>
        {localFindexarxid && <MentionOverlay setDismiss={() => setView("mentions")} mutate={() => { }} />}
        {(slug || m) && <StoryOverlay idx={"desktop"} setDismiss={() => setView("mentions")} mutate={() => { }} />}
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
                        { name: `Articles`, tab: 'all', disabled: false },
                        { name: `Podcasts`, tab: 'podcasts', disabled: false },
                        { name: `AI Chat`, tab: 'chat', disabled: false },
                        { name: "MyTeam", tab: "myteam", disabled: false },

                      ]}
                      onChange={onTabNav}
                      selectedOptionName={tab}
                    />
                  )}
                  {(pagetype === "team" || pagetype === "player") && view !== 'about' && (
                    <TertiaryTabs
                      options={[
                        { name: `Articles`, tab: 'all', disabled: false },
                        { name: `Podcasts`, tab: 'podcasts', disabled: false },
                        { name: `AI Chat`, tab: 'chat', disabled: false },
                        { name: `@`, tab: 'mentions', disabled: false },



                      ]}
                      onChange={onTeamPlayerTabNav}
                      selectedOptionName={tab}
                    />
                  )}

                  {(pagetype === "team" || (pagetype === "league" && tab === "myteam")) && (tab === "mentions" || tab === "") ? <TeamMentions /> : null}
                  {pagetype === "player" && (tab === "mentions" || tab === "") && <PlayerMentions />}
                  {pagetype === "league" && view !== 'about' && (tab === 'all' || tab === '') && <Stories />}
                  {pagetype === "team" && view !== 'about' && (tab === 'all' || tab === '') && <Stories />}
                  {pagetype === "player" && view !== 'about' && (tab === 'all' || tab === '') && <Stories />}
                  {pagetype === "league" && view !== 'about' && (tab === 'podcasts' || tab === '') && <Stories type="v" />}
                  {pagetype === "team" && view !== 'about' && (tab === 'podcasts' || tab === '') && <Stories type="v" />}
                  {pagetype === "player" && view !== 'about' && (tab === 'podcasts' || tab === '') && <Stories type="v" />}

                  {view === 'about' && <Readme />}
                  {(pagetype === 'league' && tab === 'chat') && <Chat source="desktop" />}
                  {(pagetype === 'team' || pagetype === 'player') && (tab === 'chat') && <Chat source="desktop" />}
                  {(pagetype === 'league' && tab === 'myteam') && <MyTeam />}

                </CenterPanel>
                <RightPanel>
                  {pagetype === 'league' && (<>
                    <TertiaryTabs
                      options={[
                        { name: `@`, tab: '', disabled: false },
                        { name: "MyFeed", tab: "myfeed", disabled: false },
                        { name: "Favorites", tab: "fav", disabled: false }
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
    </div>
  )
}
export default Desktop;

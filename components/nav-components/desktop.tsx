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
import { actionRecordEvent as recordEvent } from "@/lib/actions";

const PageWrap = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

const Page = styled.div`
  max-width: 1200px;
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
  @media screen and (max-width: 1024px) {
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
  padding-top: 18px;
  max-height: 150vh;
  position: sticky;
  top: -400px;
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
  flex-grow: 1;
  width: 600px;
  min-width: 600px;
  @media screen and (min-width: 1600px) {
    width: 800px;
  }
  @media screen and (max-width: 1200px) {
    width: 540px;
    min-width: 500px;
  }
`;

const RightPanel = styled.div`
  min-width: 300px;
  padding-left: 20px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  padding-top: 18px;
  a {
    color: var(--text);
    text-decoration: none;
    &:hover {
      color: var(--highlight);
    }
  }
  @media screen and (max-width: 1200px) {
    min-width: 200px;
    width: 250px;
  }
`;

interface Props { }

const Desktop: React.FC<Props> = () => {
  const {
    teamid,
    slug, tab: initialTab, view: initialView, setView, setTab, fbclid, utm_content, player, athleteUUId, params, league, pagetype, findexarxid
  } = useAppContext();

  const [localFindexarxid, setLocalFindexarxid] = React.useState(findexarxid);
  const tab = initialTab || "";
  const view = initialView || "mentions";
  //console.log("==> teamid, player, athleteUUId", teamid, player, athleteUUId);
  useEffect(() => {
    setLocalFindexarxid(findexarxid);
  }, [findexarxid]);

  const onTabNav = (option: any) => {
    const newTab = option.tab;
    const tabParam = newTab !== 'all' ? params ? `&tab=${newTab}` : `?tab=${newTab}` : '';
    const newPath = league ? `/${league}${params}${tabParam}` : params ? `/${params}${tabParam}` : `/?tab=${newTab}`;
    window.history.pushState({}, "", newPath);
    setTimeout(() => setTab(newTab), 0);
    setView("mentions");
    setTimeout(async () => await recordEvent('tab-nav', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","tab":"${newTab}"}`), 1);
  }
  const onTeamPlayerTabNav = (option: any) => {
    const newTab = option.tab;
    const tabParam = newTab !== 'mentions' ? params ? `&tab=${newTab}` : `?tab=${newTab}` : '';
    const newPath = player ? `/${league}/${teamid}/${player}/${athleteUUId}${params}${tabParam}` : params ? `/${league}/${teamid}/${params}${tabParam}` : `/${league}/${teamid}?tab=${newTab}`;
    window.history.pushState({}, "", newPath);
    setTimeout(() => setTab(newTab), 0);
    setView("mentions");
    setTimeout(async () => await recordEvent('tab-nav', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","tab":"${newTab}"}`), 1);
  }
  // console.log("==> pagetype", pagetype, tab);
  return (
    <div className="lg:block hidden h-full w-full">
      <ContainerWrap>
        {localFindexarxid && <MentionOverlay setDismiss={() => setView("mentions")} mutate={() => { }} />}
        {slug && <StoryOverlay idx={"desktop"} setDismiss={() => setView("mentions")} mutate={() => { }} />}
        <PageWrap>
          <Page>
            {pagetype === "landing" ? <Landing /> : (
              <MainPanel>
                <LeftPanel>
                  {league ? <Teams /> : <Welcome />}
                </LeftPanel>
                <CenterPanel>
                  {pagetype === "league" && view !== 'faq' && (
                    <TertiaryTabs
                      options={[
                        { name: `${league || 'All'} Stories`, tab: 'all', disabled: false },

                        { name: `AI Chat`, tab: 'chat', disabled: false },
                        { name: "My Feed", tab: "myfeed", disabled: false },
                        { name: "Favorites", tab: "fav", disabled: false }
                      ]}
                      onChange={onTabNav}
                      selectedOptionName={tab}
                    />
                  )}
                  {(pagetype === "team" || pagetype === "player") && view !== 'faq' && (
                    <TertiaryTabs
                      options={[
                        { name: `Press Mentions`, tab: 'mentions', disabled: false },
                        { name: `AI Chat`, tab: 'chat', disabled: false },


                      ]}
                      onChange={onTeamPlayerTabNav}
                      selectedOptionName={tab}
                    />
                  )}
                  {(pagetype === "team" || (pagetype === "league" && tab === "myteam")) && (tab === "mentions" || tab === "") ? <TeamMentions /> : null}
                  {pagetype === "league" && tab === "myfeed" && <MyfeedMentions league={league} />}
                  {pagetype === "league" && tab === "fav" && <FavMentions />}
                  {pagetype === "player" && (tab === "mentions" || tab === "") && <PlayerMentions />}
                  {pagetype === "league" && view !== 'faq' && (tab === 'all' || tab === '') && <Stories />}
                  {view === 'faq' && <Readme />}
                  {(pagetype === 'league' && tab === 'chat') && <Chat source="desktop" />}
                  {(pagetype === 'team' || pagetype === 'player') && (tab === 'chat') && <Chat source="desktop" />}


                </CenterPanel>
                <RightPanel>
                  {pagetype === 'league' && <MyTeam />}
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

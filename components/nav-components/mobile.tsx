'use client'
import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useRouter } from 'next/navigation'
import { styled } from "styled-components";

import MentionIcon from '@/components/icons/at';
import TeamIcon from '@/components/icons/people';
import ListIcon from '@/components/icons/list';
import ContactSupportIcon from '@/components/icons/support';
import PlayerIcon from '@/components/icons/person';

import Landing from "@/components/func-components/landing";
import Teams from "@/components/func-components/teams";

import Readme from "@/components/func-components/readme";
import Stories from "@/components/func-components/stories";
import MyTeam from "@/components/func-components/myteam";
import Players from "@/components/func-components/players";
import { useAppContext } from '@/lib/context';
import SecondaryTabs from "@/components/nav-components/secondary-tabs";
import TertiaryTabs from "@/components/nav-components/tertiary-tabs";
import MentionOverlay from "@/components/func-components/mention-overlay";
import StoryOverlay from "@/components/func-components/story-overlay";
import { actionRecordEvent } from "@lib/server-actions/event";
import MyfeedMentions from "@/components/func-components/myfeed-mentions";
import FavMentions from "@/components/func-components/fav-mentions";
import TeamMentions from "@/components/func-components/team-mentions";
import PlayerMentions from "@/components/func-components/player-mentions";
import Chat from "@/components/func-components/chat";
import LeagueMentions from "../func-components/league-mentions";
import { isGenerator } from "framer-motion";
import Prompts from "../func-components/prompts";
import Blog from "@/components/func-components/blog";
import BlogArticle from "@/components/func-components/blog-article";

const FadeTransition = styled.div<{ $isVisible: boolean }>`
  opacity: ${props => props.$isVisible ? 1 : 0};
  transition: opacity 0.3s ease-in-out;
`;

const LoadingSpinner = styled.div`
  // Add your loading spinner styles here
`;

const MobileContainerWrap = styled.div`
    display: flex;
    background-color: var(--background);
    flex-direction: column;
    height: 100%;
    width: 100%;
    font-family: 'Roboto', sans-serif;
    border-top: 1px solid #ccc;
    @media screen and (min-width: 1024px) {
      display: none;
    }
`;

const LeftMobilePanel = styled.div`
    width: 100%;
    min-height:1600px;
    display: flex;
    flex-direction: column;
    padding-left: 20px;
    align-items: flex-start; 
    padding-top: 18px;
    a {
        color: var(--text);
        text-decoration: none;
        &:hover {
            color: var(--highlight);
        }
    }
`;

const CenterPanel = styled.div`
    position: relative;
    width: 100%;
    min-height: 1600px !important;
    max-width: 1000px;
    background-color: var(--background);
    margin-right: auto;
    margin-left: auto;
    overflow-y: auto;
    overflow-x: hidden;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    padding-top: 0px;
    height: auto;
    flex-grow: 1;
    padding-bottom: 200px;
`;

const RightAlignWrapper = styled.div`
    display: flex;
    justify-content: space-around;
    width: 100%;
    
   
`;

interface Props { }

const Mobile: React.FC<Props> = () => {
    const router = useRouter();
    const { tab, rtab, view, cm, cstory, setView, setTab, setRtab, params2, tp2, fbclid, utm_content, params, league, pagetype, teamid, slug, m, findexarxid, bot, player, athleteUUId } = useAppContext();
    const [localFindexarxid, setLocalFindexarxid] = React.useState(findexarxid);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Use useMemo to memoize complex calculations or derived values
    const currentTab = React.useMemo(() => tab || "all", [tab]);
    const currentView = React.useMemo(() => view == '' ? 'mentions' : view || 'mentions', [view]);
    //console.log("==> mobile page", pagetype);
    // Use useCallback for event handlers
    const onTabNav = React.useCallback(async (option: any, level: number) => {
        /*  setIsVisible(false);
          setIsLoading(true);
          //console.log("==> mobile onTabNav", { option, level });
          // Wait for fade out
          await new Promise(resolve => setTimeout(resolve, 300));
  */
        const tab = option.tab;
        // setTab(tab);
        setIsLoading(true);
        if (rtab !== '') {
            setTimeout(() => setRtab(rtab), 0);
        }
        /*      // setView("main");
              let tp = tab != 'all' ? params ? `&tab=${tab}` : `?tab=${tab}` : ``;
              router.push(league ? `/${league}${level == 1 ? `/${teamid}` : level == 2 ? `/${teamid}/${player}/${athleteUUId}` : ``}${params}${tp}` : params ? `/${params}${tp}` : `/?tab=${tab}`);
              window.history.pushState({}, "", league ? `/${league}${level == 1 ? `/${teamid}` : level == 2 ? `/${teamid}/${player}/${athleteUUId}` : ``}${params}${tp}` : params ? `/${params}${tp}` : `/?tab=${tab}`);
      */
        if (!bot) {
            await actionRecordEvent(
                'tab-nav',
                `{"fbclid":"${fbclid}","utm_content":"${utm_content}","tab":"${tab}", "level":"${level}","rtab":"${rtab}"}`
            );
        }

        // Simulate content loading
        await new Promise(resolve => setTimeout(resolve, 300));


        setIsVisible(true);
    }, [fbclid, utm_content, league, params, setTab, setView, router]);

    useEffect(() => {
        setIsLoading(false);
    }, [tab]);
    const onRTabNav = (option: any) => {
        const newTab = option.tab;
        /* const tabParam = (tab !== 'all' && tab != '') ? params ? `&tab=${tab}&rtab=${newTab}` : `?tab=${tab}&rtab=${newTab}` : params ? `&rtab=${newTab}` : `?rtab=${newTab}`;
         const newPath = league ? `/${league}${params}${tabParam}` : params ? `/${params}${tabParam}` : `/${tabParam}`;
         window.history.pushState({}, "", newPath);
         */
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
    const onViewNav = React.useCallback(async (option: { name: string, access: string }) => {
        let name = option.name.toLowerCase();
        if (name == 'main') {
            name = '';
        }

        /* if (name == 'main' || name == 'feed' || name == 'home') {
             name = 'mentions';
             if (currentView != 'mentions') {
                 setView('mentions');
             }
         }*/
        setView(name);
        /*  if (!teamid) {
              window.history.replaceState({}, "", league ? `/${league}?view=${encodeURIComponent(name)}${params2}${tp2.replace('?', '&')}` : `/?view=${encodeURIComponent(name)}${params2}${tp2.replace('?', '&')}`);
          }
          else {
              window.history.replaceState({}, "", `/${league}/${teamid}?view=${encodeURIComponent(name)}${params2}${tp2.replace('?', '&')}`);
          }*/
        await actionRecordEvent(
            'view-nav',
            `{"fbclid":"${fbclid}","utm_content":"${utm_content}","view":"${name}"}`
        );
    }, [teamid, league, params2, tp2, fbclid, utm_content]);

    const tabPath = (tab: string) => {
        const leaguePath = league ? `/${league}` : `/`;
        const teamPath = leaguePath + (teamid ? `/${teamid}` : ``);
        const playerPath = teamPath + (player ? `/${player}/${athleteUUId}` : ``);
        const tabParam = tab !== 'all' ? params ? `${params}&tab=${tab}${rtab ? `&rtab=${rtab}` : ""}` : `?tab=${tab}${rtab ? `&rtab=${rtab}` : ""}` : '';
        const newPath = playerPath + tabParam;
        console.log("==> tabPath", { leaguePath, teamPath, playerPath, tabParam, newPath });
        return newPath;
    }

    const viewPath = (view: string) => {
        if (view == 'main') {
            view = '';
        }
        const leaguePath = league ? `/${league}` : `/`;
        const teamPath = leaguePath + (teamid ? `/${teamid}` : ``);
        const playerPath = teamPath + (player ? `/${player}/${athleteUUId}` : ``);
        const viewParam = view !== '' ? params ? `${params}&view=${encodeURIComponent(view)}` : `?view=${encodeURIComponent(view)}` : `${params ? params : ''}`;
        const newPath = playerPath + viewParam;
        console.log("==> viewPath", { leaguePath, teamPath, playerPath, viewParam, newPath });
        return newPath;
    }

    const rtabPath = (tab: string, rtab: string) => {
        const leaguePath = league ? `/${league}` : `/`;
        const teamPath = leaguePath + (teamid ? `/${teamid}` : ``);
        const playerPath = teamPath + (player ? `/${player}/${athleteUUId}` : ``);
        const tabParam = (tab !== 'all' && tab != '') ? params ? `${params}&tab=${tab}&rtab=${rtab}` : `?tab=${tab}&rtab=${rtab}` : params ? `${params}&rtab=${rtab}` : `?rtab=${rtab}`;
        const newPath = playerPath + tabParam;
        return newPath;

    };
    // Preload content
    /*  useEffect(() => {
          // Preload components or data here
      }, [tab, view]);*/
    // console.log("==> pagetype", pagetype, view, tab);
    let noshow = (cstory || cm) && tab !== 'blog';
    return (
        <div className="block lg:hidden h-full">

            <MobileContainerWrap>
                {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-white border-opacity-30 border-t-white"></div>
                    </div>
                )}
                {pagetype == "league" && league &&
                    <SecondaryTabs options={[{ name: "Teams", icon: <TeamIcon fontSize="small" />, link: viewPath('teams') }, { name: "Main", icon: <MentionIcon fontSize="small" />, link: viewPath('') }, { name: "My Team", icon: <ListIcon fontSize="small" />, link: viewPath('my team') }]} onChange={async (option: any) => { await onViewNav(option) }} selectedOptionName={view} />
                }

                {pagetype == "landing" && <Landing />}
                {pagetype == "league" && !league && <SecondaryTabs options={[{ name: "Main", icon: <MentionIcon fontSize="small" />, access: "pub", link: viewPath('') }, { name: "My Team", icon: <ListIcon fontSize="small" />, access: "pub", link: viewPath('my team') }, { name: "About", icon: <ContactSupportIcon fontSize="small" />, access: "pub", link: viewPath('about') }]} onChange={async (option: any) => { await onViewNav(option); }} selectedOptionName={view} />
                }
                {(pagetype == "team" || pagetype == "player") && <SecondaryTabs options={[{ name: "Teams", icon: <TeamIcon />, link: viewPath('teams') }, { name: "Main", icon: <MentionIcon />, link: viewPath('') }, { name: "Players", icon: <PlayerIcon />, link: viewPath('players') }]} onChange={async (option: any) => {
                    //console.log(option);
                    await onViewNav(option);
                }} selectedOptionName={view} />}

                {pagetype == "league" && (view == "mentions" || view == '') &&

                    <TertiaryTabs
                        options={[
                            { name: `Stories`, tab: 'all', disabled: false, link: tabPath('all') },
                            { name: `Podcasts`, tab: 'podcasts', disabled: false, link: tabPath('podcasts') },
                            { name: "AI", tab: "chat", disabled: false, link: tabPath('chat') },
                            { name: `@`, tab: "mentions", disabled: false, link: tabPath('mentions') },
                            { name: "Blog", tab: "blog", disabled: false, link: tabPath('blog') },
                        ]}
                        onChange={async (option: any) => { await onTabNav(option, 0); }}
                        selectedOptionName={tab}
                    />

                }
                {pagetype == "team" && (view == "mentions" || view == '') &&

                    <TertiaryTabs
                        options={[
                            { name: `Stories`, tab: 'all', disabled: false, link: tabPath('all') },
                            { name: `Podcasts`, tab: 'podcasts', disabled: false, link: tabPath('podcasts') },
                            { name: "AI", tab: "chat", disabled: false, link: tabPath('chat') },
                            { name: `@`, tab: 'mentions', disabled: false, link: tabPath('mentions') },
                            { name: `?`, tab: 'prompts', disabled: false, link: tabPath('prompts') }
                        ]}
                        onChange={async (option: any) => { await onTabNav(option, 1); }}
                        selectedOptionName={tab}
                    />

                }
                {pagetype == "player" && (view == "mentions" || view == '') &&

                    <TertiaryTabs
                        options={[
                            { name: `Stories`, tab: 'all', disabled: false, link: tabPath('all') },
                            { name: `Podcasts`, tab: 'podcasts', disabled: false, link: tabPath('podcasts') },
                            { name: "AI", tab: "chat", disabled: false, link: tabPath('chat') },
                            { name: `@`, tab: 'mentions', disabled: false, link: tabPath('mentions') },
                            { name: `?`, tab: 'prompts', disabled: false, link: tabPath('prompts') }
                        ]}
                        onChange={async (option: any) => { await onTabNav(option, 2); }}
                        selectedOptionName={tab}
                    />

                }
                {pagetype == "league" && tab == 'mentions' && (view == "mentions" || view == '') &&
                    <div className="w-full bg-slate-200 dark:bg-slate-800">
                        <RightAlignWrapper>
                            <TertiaryTabs
                                level="secondary"
                                options={[
                                    { name: ` @ `, tab: '', disabled: false, link: rtabPath(tab, '') },
                                    { name: "My Feed", tab: "myfeed", disabled: false, link: rtabPath(tab, 'myfeed') },
                                    { name: "Favorites", tab: "fav", disabled: false, link: rtabPath(tab, 'fav') }
                                ]}
                                onChange={async (option: any) => { await onRTabNav(option); }}
                                selectedOptionName={rtab}
                            />
                        </RightAlignWrapper>
                    </div>
                }

                {currentView == 'teams' &&
                    <LeftMobilePanel>
                        <Teams />
                    </LeftMobilePanel>
                }

                {currentView == 'mentions' && <CenterPanel>
                    {(cstory || cm) && tab !== 'blog' && <StoryOverlay idx={"desktop"} setDismiss={() => setView("mentions")} mutate={() => { }} incolumn={true} />}

                    {pagetype == "team" && tab == "mentions" ? <TeamMentions /> : null}
                    {pagetype == "player" && tab == "mentions" && <PlayerMentions />}
                    {(pagetype == "league" || pagetype == "team" || pagetype == "player") && currentTab == "all" ? <Stories /> : null}
                    {(pagetype == "league" || pagetype == "team" || pagetype == "player") && currentTab == "podcasts" ? <Stories type="v" /> : null}
                    {pagetype === "league" && tab == "mentions" && rtab === "myfeed" && <MyfeedMentions league={league} />}
                    {pagetype === "league" && tab == "mentions" && rtab === "fav" && <FavMentions />}
                    {pagetype === "league" && tab == "mentions" && rtab === "" && <LeagueMentions />}
                    {pagetype === "team" && tab == "prompts" && <Prompts />}
                    {pagetype === "player" && tab == "prompts" && <Prompts />}

                    {false && pagetype == "league" && tab == "myfeed" ? <MyfeedMentions league={league} /> : null}
                    {false && pagetype == "league" && tab == "fav" ? <FavMentions /> : null}
                    {tab == 'chat' && <Chat source="mobile" />}
                    {(pagetype === 'league' && tab === 'blog' && !cstory) && !noshow && <Blog />}
                    {(pagetype === 'league' && tab === 'blog' && cstory) && !noshow && <BlogArticle />}

                </CenterPanel>}
                {view == 'about' && <Readme />}
                {view == 'my team' && <MyTeam />}
                {view == 'players' && <Players />}

                {localFindexarxid && <MentionOverlay setDismiss={(dismiss: boolean) => { setView("mentions"); }} mutate={() => { }} />}
                {(slug || m) && !cstory && !cm && tab !== 'blog' && <StoryOverlay idx="mobile" setDismiss={(dismiss: boolean) => { setView("mentions"); }} mutate={() => { }} />}
            </MobileContainerWrap >
        </div>
    )
}

export default Mobile;
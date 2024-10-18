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
import { actionRecordEvent as recordEvent } from "@/lib/actions";
import MyfeedMentions from "@/components/func-components/myfeed-mentions";
import FavMentions from "@/components/func-components/fav-mentions";
import TeamMentions from "@/components/func-components/team-mentions";
import PlayerMentions from "@/components/func-components/player-mentions";
import Chat from "@/components/func-components/chat";

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

interface Props { }

const Mobile: React.FC<Props> = () => {
    const router = useRouter();
    const { tab, view, setView, setTab, params2, tp2, fbclid, utm_content, params, league, pagetype, teamid, slug, findexarxid } = useAppContext();
    const [localFindexarxid, setLocalFindexarxid] = React.useState(findexarxid);
    const [isLoading, setIsLoading] = useState(false);
    const [isVisible, setIsVisible] = useState(true);

    // Use useMemo to memoize complex calculations or derived values
    const currentTab = React.useMemo(() => tab || "all", [tab]);
    const currentView = React.useMemo(() => view == 'main' ? 'mentions' : view || 'mentions', [view]);

    // Use useCallback for event handlers
    const onTabNav = React.useCallback(async (option: any) => {
        setIsVisible(false);
        setIsLoading(true);

        // Wait for fade out
        await new Promise(resolve => setTimeout(resolve, 300));

        const tab = option.tab;
        setTab(tab);
        // setView("main");
        let tp = tab != 'all' ? params ? `&tab=${tab}` : `?tab=${tab}` : ``;
        router.push(league ? `/${league}${params}${tp}` : params ? `/${params}${tp}` : `/?tab=${tab}`)
        window.history.pushState({}, "", league ? `/${league}${params}${tp}` : params ? `/${params}${tp}` : `/?tab=${tab}`);

        await recordEvent(
            'tab-nav',
            `{"fbclid":"${fbclid}","utm_content":"${utm_content}","tab":"${tab}"}`
        );

        // Simulate content loading
        await new Promise(resolve => setTimeout(resolve, 300));

        setIsLoading(false);
        setIsVisible(true);
    }, [fbclid, utm_content, league, params, setTab, setView, router]);

    const onViewNav = React.useCallback(async (option: { name: string, access: string }) => {
        let name = option.name.toLowerCase();
        if (name == 'main' || name == 'feed' || name == 'home') {
            name = 'mentions';
            if (currentView != 'mentions') {
                setView('mentions');
            }
        }
        setView(name);
        if (!teamid) {
            window.history.replaceState({}, "", league ? `/${league}?view=${encodeURIComponent(name)}${params2}${tp2.replace('?', '&')}` : `/?view=${encodeURIComponent(name)}${params2}${tp2.replace('?', '&')}`);
        }
        else {
            window.history.replaceState({}, "", `/${league}/${teamid}?view=${encodeURIComponent(name)}${params2}${tp2.replace('?', '&')}`);
        }
        await recordEvent(
            'view-nav',
            `{"fbclid":"${fbclid}","utm_content":"${utm_content}","view":"${name}"}`
        );
    }, [teamid, league, params2, tp2, fbclid, utm_content, setView]);

    // Preload content
    /*  useEffect(() => {
          // Preload components or data here
      }, [tab, view]);*/
  //  console.log("==> pagetype", pagetype);
    return (
        <div className="block lg:hidden h-full">
            <MobileContainerWrap>
                {pagetype == "league" && league &&
                    <SecondaryTabs options={[{ name: "Teams", icon: <TeamIcon fontSize="small" /> }, { name: "Main", icon: <MentionIcon fontSize="small" /> }, { name: "My Team", icon: <ListIcon fontSize="small" /> }]} onChange={async (option: any) => { await onViewNav(option) }} selectedOptionName={view} />
                }

                {pagetype == "landing" && <Landing />}
                {pagetype == "league" && !league && <SecondaryTabs options={[{ name: "Main", icon: <MentionIcon fontSize="small" />, access: "pub" }, { name: "My Team", icon: <ListIcon fontSize="small" />, access: "pub" }, { name: "FAQ", icon: <ContactSupportIcon fontSize="small" />, access: "pub" }]} onChange={async (option: any) => { await onViewNav(option); }} selectedOptionName={view} />
                }
                {(pagetype == "team" || pagetype == "player") && <SecondaryTabs options={[{ name: "Teams", icon: <TeamIcon /> }, { name: "Main", icon: <MentionIcon /> }, { name: "Players", icon: <PlayerIcon /> }]} onChange={async (option: any) => { console.log(option); await onViewNav(option); }} selectedOptionName={view} />}

                {pagetype == "league" && (view == "mentions" || view == '') && <TertiaryTabs options={[{ name: `${league ? league : 'All'} Stories`, tab: 'all', disabled: false }, { name: "AI Chat", tab: "chat", disabled: false }, { name: "My Feed", tab: "myfeed", disabled: false }, { name: "Favorites", tab: "fav", disabled: false }]} onChange={async (option: any) => { await onTabNav(option); }} selectedOptionName={tab} />}

                {currentView == 'teams' &&
                    <LeftMobilePanel>
                        <Teams />
                    </LeftMobilePanel>
                }
                {currentView == 'mentions' && <CenterPanel>
                    {pagetype == "team" && tab != "chat" ? <TeamMentions /> : null}
                    {pagetype == "player" && tab != "chat" && <PlayerMentions />}
                    {pagetype == "league" && currentTab == "all" ? <Stories /> : null}
                    {pagetype == "league" && tab == "myfeed" ? <MyfeedMentions league={league} /> : null}
                    {pagetype == "league" && tab == "fav" ? <FavMentions /> : null}
                    {tab == 'chat' && <Chat source="mobile" />}

                </CenterPanel>}
                {view == 'faq' && <Readme />}
                {view == 'my team' && <MyTeam />}
                {view == 'players' && <Players />}

                {localFindexarxid && <MentionOverlay setDismiss={(dismiss: boolean) => { setView("mentions"); }} mutate={() => { }} />}
                {slug && <StoryOverlay idx="mobile" setDismiss={(dismiss: boolean) => { setView("mentions"); }} mutate={() => { }} />}
            </MobileContainerWrap >
        </div>
    )
}

export default Mobile;
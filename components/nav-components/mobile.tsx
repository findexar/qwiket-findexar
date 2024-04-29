'use client'
import React, { useEffect, useCallback } from "react";
import { useRouter } from 'next/navigation'
import { styled, ThemeProvider } from "styled-components";

import MentionIcon from '@mui/icons-material/AlternateEmailOutlined';
import TeamIcon from '@mui/icons-material/PeopleAltOutlined';
import ListIcon from '@mui/icons-material/ListOutlined';
import ContactSupportIcon from '@mui/icons-material/ContactSupport';
import PlayerIcon from '@mui/icons-material/PersonPinOutlined';

import Landing from "@/components/func-components/landing";
import Teams from "@/components/func-components/teams";

import Readme from "@/components/func-components/readme";
import Mentions from "@/components/func-components/team-mentions";
import Stories from "@/components/func-components/stories";
import MyTeam from "@/components/func-components/myteam";
import Players from "@/components/func-components/players";
import { useAppContext } from '@/lib/context';
import SecondaryTabs from "@/components/nav-components/secondary-tabs";
import TertiaryTabs from "@/components/nav-components/tertiary-tabs";
import MentionOverlay from "@/components/func-components/mention-overlay";
import StoryOverlay from "@/components/func-components/story-overlay";
import { actionRecordEvent as recordEvent } from "@/lib/actions";

const MobileContainerWrap = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 100%;
    font-family: 'Roboto', sans-serif;
    border-top: 1px solid #ccc;
    @media screen and (min-width: 1200px) {
      display: none;
    }
`;

const LeftMobilePanel = styled.div`
    width:100%;
    display:flex;
    flex-direction:column;
    padding-left:20px;
    align-items:flex-start; 
    padding-top:18px;
    a{
        color: var(--text);
        text-decoration: none;
        &:hover{
            color:var(--highlight);
        }
    }
`;

const CenterPanel = styled.div`
    position:relative;
    width:100%;
    max-width:1000px;
    margin-right:auto;
    margin-left:auto;
    overflow-y: auto;
    overflow-x: hidden;
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    align-items:flex-start;
    padding-top:18px;
    height:auto;
    flex-grow:1;
    padding-bottom:60px;
`;

const SideLeagueName = styled.div`
    height: 40px;
    width: 200px; 
    color:var(--text);
    font-size: 20px;
`;
interface Props {
}

const Mobile: React.FC<Props> = () => {
    const router = useRouter();
    let { tab, view, mode, userId, isMobile, setLeague, setView, setTab, params2, tp2, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, team, player, teamName } = useAppContext();

    tab = tab || "all";
    const onTabNav = async (option: any) => {
        const tab = option.tab;
        setTab(tab);
        setView("mentions");
        let tp = tab != 'all' ? params ? `&tab=${tab}` : `?tab=${tab}` : ``;
        router.push(league ? `/${league}${params}${tp}` : params ? `/${params}${tp}` : `/?tab=${tab}`)
        await recordEvent(
            'tab-nav',
            `{"fbclid":"${fbclid}","utm_content":"${utm_content}","tab":"${tab}"}`
        );
    }

    const onViewNav = useCallback(async (option: { name: string, access: string }) => {
        let name = option.name.toLowerCase();
        if (name == 'feed')
            name = 'mentions';

        setView(name);
        if (!team)
            router.replace(league ? `/${league}?view=${encodeURIComponent(name)}${params2}${tp2.replace('?', '&')}` : `/?view=${encodeURIComponent(name)}${params2}${tp2.replace('?', '&')}`)
        else
            router.replace(`/${league}/${team}?view=${encodeURIComponent(name)}${params2}${tp2.replace('?', '&')}`);

        await recordEvent(
            'view-nav',
            `{"fbclid":"${fbclid}","utm_content":"${utm_content}","view":"${name}"}`
        );
    }, [fbclid, utm_content,  league, params2, tp2]);

    return (
        <MobileContainerWrap>
            {pagetype == "landing" && <Landing />}
            {pagetype == "league" && !league && <SecondaryTabs options={[{ name: "Feed", icon: <MentionIcon fontSize="small" />, access: "pub" }, { name: "My Team", icon: <ListIcon fontSize="small" />, access: "pub" }, { name: "Readme", icon: <ContactSupportIcon fontSize="small" />, access: "pub" }]} onChange={async (option: any) => { await onViewNav(option); }} selectedOptionName={view} />
            }
            {pagetype == "league" && league &&
                <SecondaryTabs options={[{ name: "Teams", icon: <TeamIcon fontSize="small" /> }, { name: "Feed", icon: <MentionIcon fontSize="small" /> }, { name: "My Team", icon: <ListIcon fontSize="small" /> }]} onChange={async (option: any) => { await onViewNav(option) }} selectedOptionName={view} />
            }
            {(pagetype == "team" || pagetype == "player") && <SecondaryTabs options={[{ name: "Teams", icon: <TeamIcon /> }, { name: "Feed", icon: <MentionIcon /> }, { name: "Players", icon: <PlayerIcon /> }]} onChange={async (option: any) => { console.log(option); await onViewNav(option); }} selectedOptionName={view} />}
            {view == 'mentions' && <TertiaryTabs options={[{ name: `${league ? league : 'All'} Stories`, tab: 'all', disabled: false }, { name: "My Feed", tab: "myteam", disabled: !userId }, { name: "Favorites", tab: "fav", disabled: !userId }]} onChange={async (option: any) => { await onTabNav(option); }} selectedOptionName={tab} />}

            {view == 'teams' &&
                <LeftMobilePanel>
                    <Teams />
                </LeftMobilePanel>
            }
            {view == 'mentions' && <CenterPanel>
                {pagetype == "league" && tab == "all" ? <Stories /> : <Mentions />}
            </CenterPanel>}
            {view == 'readme' && <Readme />}
            {view == 'my team' && <MyTeam />}
            {view == 'players' && <Players />}
            <MentionOverlay setDismiss={(dismiss: boolean) => { setView("mentions"); }} mutate={() => { }} />
            <StoryOverlay setDismiss={(dismiss: boolean) => { setView("mentions"); }} mutate={() => { }} />
        </MobileContainerWrap >
    )
}

export default Mobile;
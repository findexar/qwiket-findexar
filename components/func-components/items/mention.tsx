'use client';
import React, { useEffect, useCallback, useState, useMemo, useRef } from "react";
import useSWR from 'swr';
import Link from 'next/link';
import { useUser } from "@clerk/nextjs";
import { styled, useTheme } from "styled-components";
//import { RWebShare } from "react-web-share";
//import { WebShareApi } from 'react-web-share';
import FacebookIcon from '@/components/icons/facebook';
import XIcon from '@/components/icons/twitter';
import StarOutlineIcon from '@/components/icons/star-outline';
import StarIcon from '@/components/icons/star';
import IosShareIcon from '@/components/icons/share';
import ContentCopyIcon from '@/components/icons/content-copy';
import IconChevronUp from '@/components/icons/chevron-up';
import IconChevronDown from '@/components/icons/chevron-down';

import { MetaLinkKey, getMetaLink } from '@/lib/api';
import { convertToUTCDateString, convertToReadableLocalTime } from "@/lib/date-convert";
import useCopyToClipboard from '@/lib/copy-to-clipboard';
import { useAppContext } from '@/lib/context';
import { actionRecordEvent } from "@lib/server-actions/event";
import TeamAddIcon from "@/components/icons/usergroup-add";
import TeamRemoveIcon from "@/components/icons/usergroup-delete";
import { actionFetchMyTeam, actionAddMyTeamMember, actionRemoveMyTeamMember } from "@lib/server-actions/my-team-actions";
import { actionAddFavorite, actionRemoveFavorite } from "@lib/server-actions/favorites";

import { MyTeamRosterKey,/* UserSubscriptionKey as SubscriptionKey */ } from '@/lib/keys';
import Toast from '@/components/func-components/toaster';
import ErrorBoundary from '@/components/util-components/error-boundary';
import CustomImage from '@/components/util-components/custom-image';
declare global {
    interface Window {
        Clerk: any;
    }
}
interface MentionsProps {
    $hideit?: boolean;
    $noborder?: boolean;
}

interface SideProps {
    $highlight?: boolean;
}
const SideIcon = styled.div<SideProps>`
    width:20px;
    height:30px;
    margin-left:20px;
    color:${props => props.$highlight ? 'var(--selected))' : 'var(--link)'};  
`;

const MentionWrap = styled.div<MentionsProps>`
    width: 100%;
    min-height: 100px;
    background-color: var(--mention-bg); /* Previously: var(--mention-border); */
    flex-direction: row;
    justify-content: flex-start;
    align-items: flex-start;
    border: 1px solid #ccc;
    border-radius: 2px;
    padding: 4px;
  
    font-size: 16px;

    a {
        color: var(--mention-text);
        text-decoration: none;
        &:hover {
           color: var(--mention-text);
        }   
    }
    p {
        margin-top: 4px ;
        padding-bottom: 4px;
    }
    display: ${props => props.$hideit ? 'none' : 'flex'};
    @media screen and (max-width: 1199px) {
        display: none;
    }
`;

const MobileMentionWrap = styled.div<MentionsProps>` 
    min-height:100px;
    width:100%;
    display:${props => props.$hideit ? 'none' : 'flex'};
    flex-direction: row;
    justify-content: flex-start;
    align-items:flex-start;
    border: 1px solid #ccc;
    border-radius: 5px;
    margin-top:2px;
    margin-bottom:2px;
    color:var(--text);
    &:hover{
        color: var(--mention-text);
    } 
    a{
        color:var(--mention-text);
        text-decoration: none;
        &:hover{
           color: var(--mention-text);
        }   
    }
    @media screen and (min-width: 1200px) {
        display: none;
  }
`;

const MentionSummary = styled.div`
    width:100%;
    border-radius: 30px;
    font-size: 15px;
    padding-left:10px;
    padding-right:10px;
    color:var(--text);
    background-color: var(--mention-bg); 
    &:hover{
        background-color:var(--mention-high-bg);
    } 
    border-radius: 5px 5px 5px 5px;
    @media screen and (max-width: 1199px) {
       margin:0px;
  }
`;

const Icon = styled.span`
    color:var(--mention-text);
    opacity:0.6;
    cursor:pointer;
    &:hover{
        opacity:0.9;
        color: var(--highlight);
    }
`;

const ExtendedMention = styled.div`
    margin:20px;
    border-radius: 10px;
    font-size: 15px;
    padding:20px;
    background-color:var(--background);
    &:hover{
            background-color: var(--background)
    } 
    display:flex;
    flex-direction:column;
    a{
        font-size:15px;    
    }
`;

const MobileExtendedMention = styled.div`
    margin-top:10px;
    margin-bottom:10px;
    border-radius: 10px;
    font-size: 15px;
    padding:12px;
    background-color:var(--background);
    &:hover{
            background-color: var(--background)
    }
    display:flex;
    flex-direction:column;
    a{
        font-size:15px;
      
    }
`;

const Body = styled.div`
    font-size: 15px;
    margin-bottom: 14px;
    flex: 2 1 auto;
    line-height:1.4;
    a{
        font-size:15px;
    }
`;

const Title = styled.div`
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
`;

const Digest = styled.div`
    font-size: 15px;
    display:flex;
`;

const ArticleDigest = styled.div`
    font-size: 18px;
    padding-top:10px;
`;

const ImageWrapper = styled.div`
    margin-top:20px;
    flex: 1 1 auto;
    max-width: 100%;
`;

const Topline = styled.div`
    display:flex;
    min-height:24px;
    flex-direction:row;
    justify-content :space-between ;
    align-items:center;
    margin-bottom:4px; 
`;

const ImageStyled = styled.img`
    width:100%;
    height: auto;
    object-fit: cover;
    margin-bottom: 20px;
`;

const Authors = styled.div`
    margin-right:20px;
    margin-bottom: 10px;
`;

const SiteName = styled.div`
    margin-right:20px;  
    margin-bottom: 10px;
`;

const Byline = styled.div`
    font-size: 15px;  
    width:100%;
    display: flex;
    justify-content: flex-start;
`;

const HorizontalContainer = styled.div`
    display: flex;
    align-items:flex-start;
    flex-wrap: wrap;   
    a{
        font-size:15px;     
    }
`;

const Atmention = styled.div`
    font-size: 13px;  
    margin-top:2px; 
    display:flex;
    align-items:center;
`;

const Atmention2 = styled.div`
    font-size: 13px;  
    text-align:right; 
    height:30px;
`;

const MobileAtmention2 = styled.div`
    font-size: 13px;  
    height:30px;
    margin-bottom:-20px;
`;

const ShareContainer = styled.div`
    margin-top:10px;
    margin-left:4px;
    margin-right:4px;
    height:20px;
    width:100%;
    display:flex;
    justify-content:flex-start;

    font-size: 18x;  
    
    opacity:0.6;
    cursor:pointer;
    color:var(--mention-text);
    :hover{
        opacity:1;
        color: var(--highlight);
    }
    :hover:active{
        opacity:1;
        color:var(--highlight);
    }
`;

const ShareContainerInline = styled.span`
    height:10px;
    opacity:0.6;
    cursor:pointer;
    margin-left:10px;
   
    color:var(--mention-text);
    :hover{
        opacity:1;
        color: var(--highlight);
    }
    :hover:active{
        opacity:1;
        color:var(--highlight);
    }
`;

const ShareGroup = styled.div`
    display:flex;
    flex-direction:row;
    justify-content:flex-start;
    align-items:flex-start;
    width:auto;
    height:40px;
    margin-top:10px;
`;

const BottomLine = styled.div`
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    align-items:flex-end;
    margin-top:-14px;
    margin-bottom:8px;
    width:100%;
`;

const LocalDate = styled.div`
    font-size: 12px;
`;

const SummaryWrap = styled.div`
    display:flex;
    justify-content: space-between;
    width:'100%';
    line-height: 1.2;
   
    font-size:15px;
    a{
        font-size:15px;
      
    }
    @media screen and (max-width: 1199px) {
        padding-bottom:10px;
  }  
`;

const ImageTextWrapper = styled.div`
    img {
        float: left;
        margin-right: 12px;
        margin-bottom: 8px;
        width: 64px;
        height: 64px;
        border-radius: 50%;
        object-fit: cover;
    }
`;

const PromptsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
  margin-bottom: 10px;
`;

const PromptTag = styled(Link) <{ $isDarkMode: boolean }>`
  background-color: ${props => props.$isDarkMode ? '#34063b' : '#CFE0C2'};
  color: ${props => props.$isDarkMode ? '#E0E000' : '#4E342E'};
  padding: 2px 10px;
  border-radius: 16px;
  font-size: 11px !important;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
  @media screen and (max-width: 1199px) {
    font-size: 13px !important;
  }
  a{
    font-size: 11px !important;
    color: ${props => props.$isDarkMode ? '#E0E000' : '#4E342E'} !important;
    @media screen and (max-width: 1199px) {
        font-size: 13px !important;
    }
  }
  &:hover {
    background-color: ${props => props.$isDarkMode ? '#795548' : '#FFCCBC'};
    color: ${props => props.$isDarkMode ? '#FFFFFF' : '#3E2723'};
  }
`;

interface Props {
    mention: any,
    linkType?: string;
    startExtended?: boolean;
    mutate: any;
    mini?: boolean;
    handleClose: () => void;
    mutatePlayers?: any;
    showImage?: boolean;
}

const Mention: React.FC<Props> = ({ mini, startExtended, linkType, mention, mutate, handleClose, mutatePlayers, showImage }) => {
    const { setAthleteUUId, setFindexarxid, setSlug, fallback, bot, league: ll, mode, utm_content, params, tp, pagetype, setTeamid, setTeamName, userAccount } = useAppContext();
    const isDarkMode = mode === 'dark';
    const [toastMessage, setToastMessage] = useState("");
    const [toastIcon, setToastIcon] = useState(<></>);
    let { league, type, team, teamName, name, athleteUUId, date, url, findex, summary, findexarxid, fav, tracked, image, prompts, timecode, uuid } = mention;
    athleteUUId = athleteUUId || "inactive";
    linkType = linkType || 'final';
    mini = mini || false;
    const [expanded, setExpanded] = React.useState(startExtended);
    const [localDate, setLocalDate] = React.useState(convertToUTCDateString(date));
    const [localFav, setLocalFav] = React.useState(fav);
    const [localTracked, setLocalTracked] = React.useState(tracked);
    const [hide, setHide] = React.useState(false);
    const [signin, setSignin] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [digestCopied, setDigestCopied] = React.useState(false);
    const [value, copy] = useCopyToClipboard();
    const theme = useTheme();
    const trackerListMembersKey: MyTeamRosterKey = { type: "my-team-roster", league: ll };
    const { data: trackerListMembers, error: trackerListError, isLoading: trackerListLoading, mutate: myTeamMutate } = useSWR(
        trackerListMembersKey,
        actionFetchMyTeam,
        { fallback }
    );
    const [isVisible, setIsVisible] = useState(false);
    const mentionRef = useRef<HTMLDivElement | null>(null);
    const mobileMentionRef = useRef<HTMLDivElement | null>(null);
    const [loading, setLoading] = useState(false);

    const isCid = useMemo(() => {
        return userAccount?.cid && userAccount?.cid.length > 0;
    }, [userAccount]);

    const shareUrls = useMemo(() => {
        const prepName = encodeURIComponent(name.replace(/\./g, '!'));
        const baseUrl = `${process.env.NEXT_PUBLIC_SERVER}/`;
        const cidParam = isCid ? `&aid=${userAccount.cid}` : '';
        const typeSpecificPath = type == 'person'
            ? `${league}/${encodeURIComponent(team)}/${encodeURIComponent(prepName)}/${athleteUUId}`
            : `${league}/${encodeURIComponent(team)}/${athleteUUId}`;

        /*  return {
              share: `${baseUrl}${typeSpecificPath}?id=${findexarxid}&utm_content=sharelink${cidParam}`,
              twitter: `${baseUrl}${typeSpecificPath}?id=${findexarxid}&utm_content=xlink${cidParam}`,
              facebook: `${baseUrl}${typeSpecificPath}?id=${findexarxid}&utm_content=fblink${cidParam}`,
          };*/
        if (uuid) {
            return {
                share: `${baseUrl}${typeSpecificPath}?m=${uuid}&utm_content=sharelink${cidParam}`,
                twitter: `${baseUrl}${typeSpecificPath}?m=${uuid}&utm_content=xlink${cidParam}`,
                facebook: `${baseUrl}${typeSpecificPath}?m=${uuid}&utm_content=fblink${cidParam}`,
            };
        }
        else {
            return {
                share: `${baseUrl}${typeSpecificPath}?id=${findexarxid}&utm_content=sharelink${cidParam}`,
                twitter: `${baseUrl}${typeSpecificPath}?id=${findexarxid}&utm_content=xlink${cidParam}`,
                facebook: `${baseUrl}${typeSpecificPath}?id=${findexarxid}&utm_content=fblink${cidParam}`,
            };
        }
    }, [type, league, team, name, athleteUUId, findexarxid, isCid, userAccount]);

    const socialLinks = useMemo(() => {
        return {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(summary?.substring(0, 230) || "" + '...')}&url=${shareUrls.twitter}&via=findexar`,
            facebook: `https://www.facebook.com/sharer.php?kid_directed_site=0&sdk=joey&u=${encodeURIComponent(shareUrls.facebook)}&t=${encodeURIComponent('Findexar')}&quote=${encodeURIComponent(summary.substring(0, 140) + '...')}&hashtag=%23findexar&display=popup&ref=plugin&src=share_button`,
        };
    }, [summary, shareUrls]);

    const localUrl = useMemo(() => {
        team = team || "external";
        const prepName = encodeURIComponent(name);
        return uuid ? type == 'person'
            ? `/${league}/${team}/${prepName}/${athleteUUId}?m=${uuid}`
            : `/${league}/${team}?m=${uuid}`
            : type == 'person'
                ? `/${league}/${team}/${prepName}/${athleteUUId}?id=${findexarxid}`
                : `/${league}/${team}?id=${findexarxid}`;
    }, [type, league, team, name, athleteUUId, findexarxid]);

    const bottomLink = useMemo(() => {
        team = team || "external";
        let link = type == 'person'
            ? `/${league}/${team}/${encodeURIComponent(name)}/${athleteUUId}`
            : `/${league}/${team}`;
        if (linkType == 'final')
            link += `${params.includes('?') ? '&' : '?'}top=1`;
        return link.replace('&tab=all', '').replace('&tab=myfeed', '');
    }, [type, league, team, name, athleteUUId, linkType, params]);

    useEffect(() => {
        setLocalTracked(tracked);
    }, [tracked]);
    useEffect(() => {
        setLocalFav(fav);
    }, [fav]);
    useEffect(() => {
        setExpanded(startExtended);
    }, [startExtended, url]);

    useEffect(() => {
        setTimeout(() => {
            setDigestCopied(false);
        }
            , 2000);
    }, [digestCopied]);

    useEffect(() => {
        setTimeout(() => {
            setCopied(false);
        }
            , 2000);
    }, [copied]);

    useEffect(() => {
        setExpanded(startExtended);
    }, [startExtended]);

    useEffect(() => {
        setLocalFav(fav);
    }, [fav]);

    useEffect(() => {
        if (!summary || summary.length < 6 || !date || !url) {
            setHide(true);
            mutate();
        }
        if (summary && summary.length > 6 && date && url) {
            setHide(false);
        }
    }, [summary, mutate, date, url]);

    //prepare urls:
    const prepName = encodeURIComponent(name.replace(/\./g, '!'));//name?.replaceAll(' ', '_') || "";
    team = team || "external";
    let shareUrl = (type == 'person' ? `${process.env.NEXT_PUBLIC_SERVER}/${league}/${encodeURIComponent(team)}/${encodeURIComponent(prepName)}/${athleteUUId}?id=${findexarxid}&utm_content=sharelink` : `${league}/${encodeURIComponent(team)}?id=${findexarxid}&utm_content=sharelink`);

    const twitterShareUrl = `${process.env.NEXT_PUBLIC_SERVER}/` + (type == 'person' ? `${league}/${encodeURIComponent(team)}/${encodeURIComponent(prepName)}/${athleteUUId}?id=${findexarxid}&utm_content=xlink` : `/${league}/${encodeURIComponent(team)}?id=${findexarxid}&utm_content=xlink`);
    const fbShareUrl = `${process.env.NEXT_PUBLIC_SERVER}/` + (type == 'person' ? `${league}/${encodeURIComponent(team)}/${encodeURIComponent(prepName)}/${athleteUUId}?id=${findexarxid}&utm_content=fblink` : `/${league}/${encodeURIComponent(team)}?id=${findexarxid}&utm_content=fblink`);

    //console.log("====Mention    ", mention);
    const renderPrompts = (device: string) => {
        if (!prompts || prompts.length === 0) return null;
        const param = "?tab=chat";
        return (
            <PromptsContainer>
                {prompts.map((p: any, index: number) => {
                    const promptUrl = (type == 'person' ? `/${league}/${encodeURIComponent(team)}/${encodeURIComponent(name)}/${athleteUUId}${param}&prompt=${encodeURIComponent(p.prompt)}&promptUUId=${p.promptUUId}` : `/${league}/${encodeURIComponent(team)}${param}&prompt=${encodeURIComponent(p.prompt)}&promptUUId=${p.promptUUId}`);
                    // console.log("promptUrl", promptUrl, name, athleteUUId);
                    return (
                        <PromptTag
                            key={`prompt-${index}`}
                            href={`${promptUrl}`}
                            $isDarkMode={isDarkMode}
                            style={{ textDecoration: 'none', fontSize: 11 }}
                            scroll={true}
                            onClick={async () => { await onPromptNav(name, athleteUUId, team, teamName, promptUrl) }}
                        >
                            {p.prompt}
                        </PromptTag>
                    )
                })
                }
            </PromptsContainer >
        );
    };

    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(summary?.substring(0, 230) || "" + '...')}&url=${twitterShareUrl}&via=findexar`;
    summary = summary || "";
    // Normalize summary to ensure it's safe for URI encoding
    summary = summary.normalize("NFKC");
    const fbLink = `https://www.facebook.com/sharer.php?kid_directed_site=0&sdk=joey&u=${encodeURIComponent(fbShareUrl)}&t=${encodeURIComponent('Findexar')}&quote=${encodeURIComponent(summary.substring(0, 140) + '...')}&hashtag=%23findexar&display=popup&ref=plugin&src=share_button`;
    const tgLink = `${process.env.NEXT_PUBLIC_SERVER}` + localUrl;
    const mentionsKey: MetaLinkKey = { func: "meta", findexarxid, long: startExtended ? 1 : 1 };
    const meta: any = useSWR(
        mentionsKey,
        getMetaLink,
        { fallback }
    ).data;
    let digest = meta?.digest || "";
    const { isLoaded, isSignedIn, user } = useUser();
    const [openLimitAccountModal, setOpenLimitAccountModal] = useState(false);
    const [openLimitSubscriptionModal, setOpenLimitSubscriptionModal] = useState(false);

    useEffect(() => {
        try {
            setLocalDate(convertToReadableLocalTime(date));
        }
        catch (x) {
            console.log("EXCEPTION CONVERTING DATE");
        }
    }, [date])

    const onMentionNav = useCallback(async (name: string, athleteUUId: string, team: string, teamName: string, url: string) => {
        setLoading(true);
        if (!mini) {
            console.log("onMentionNav", { name, athleteUUId, team, teamName, url });
            /* setTeamid(team);
             if (athleteUUId) {
                 setAthleteUUId(athleteUUId);
                 setName(name);
             }
             setTeamName(teamName);
             window.history.replaceState({}, "", url);
 */
        }
        let pgt = type == 'person' ? 'player' : 'team';
        if (!bot) {
            await actionRecordEvent(
                'mention-nav',
                `{"params":"${params}","league":"${league}","team":"${team}","name":"${name}", "athleteUUId":"${athleteUUId}", "pagetype":"${pgt}"}`
            );
        }
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, [league, team, type, params]);
    const onPromptNav = useCallback(async (name: string, athleteUUId: string, team: string, teamName: string, url: string) => {
        setLoading(true);
        if (!mini) {
            console.log("onPromptNav", { name, athleteUUId, team, teamName, url });
            //  setTeamid(team);
            /* if (athleteUUId) {
             setAthleteUUId(athleteUUId);
             setName(name);
         }*/
            //  setTeamName(teamName);
            window.history.replaceState({}, "", url);

        }
        let pgt = type == 'person' ? 'player' : 'team';
        if (!bot) {
            await actionRecordEvent(
                'mention-nav',
                `{"params":"${params}","league":"${league}","team":"${team}","name":"${name}", "athleteUUId":"${athleteUUId}", "pagetype":"${pgt}"}`
            );
        }
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    }, [league, team, type, params]);


    const onExtended = useCallback(async (on: boolean) => {

        await actionRecordEvent(
            'mention-extended',
            `{"on":"${on}","name":"${name}","summary","${summary}","url":"${url}","params":"${params}"}`
        );
    }, [params]);

    const onHover = useCallback((label: string) => {
        try {
            if (!bot) {
                actionRecordEvent(`mention-hover`, `{"utm_content":"${utm_content}","label":"${label}","name":"${name}","url":"${encodeURI(url)}","params":"${params}"}`)
                    .then((r: any) => {
                    });
            }
        } catch (x) {
            console.log('actionRecordEvent', x);
        }
    }, [params]);

    const onShare = useCallback((url: string) => {
        try {
            /*
             <RWebShare
                                data={{
                                    text: summary,
                                    url: shareUrls.share,
                                    title: `${process.env.NEXT_PUBLIC_APP_NAME}`,
                                }}
                                onClick={async () => await onShare(url)}
                            >
                            */

            if (navigator.share) {
                navigator.share({
                    title: `${process.env.NEXT_PUBLIC_APP_NAME}`,
                    text: summary,
                    url: shareUrls.share,
                });
            }

            if (!bot) {
                actionRecordEvent(`mention-share`, `{"name":"${name}","url","${url}","params":"${params}"}`)
                    .then((r: any) => {
                        //console.log("actionRecordEvent", r);
                    });
            }
        } catch (x) {
            console.log('actionRecordEvent', x);
        }
    }, []);

    const onClick = useCallback((url: string) => {
        try {
            if (!bot) {
                actionRecordEvent(`mention-story-click`, `{"name":"${name}","url","${url}","params":"${params}"}`)
                    .then((r: any) => {
                        // console.log("actionRecordEvent", r);
                    });
            }
        } catch (x) {
            console.log('actionRecordEvent', x);
        }
    }, [params]);

    const onCopyClick = useCallback(() => {
        setCopied(true);
        copy(summary);
    }, [summary]);

    const onDigestCopyClick = useCallback(() => {
        setDigestCopied(true);
        copy(digest);
    }, [digest]);

    const iconClick = useCallback(async () => {
        if (localTracked == true) {
            setToastMessage("Player removed from the Team");
            setToastIcon(<TeamRemoveIcon className="h-6 w-6 opacity-60 hover:opacity-100 text-grey-4000" />);
            setLocalTracked(false);
            await actionRemoveMyTeamMember({ member: name, teamid: team, athleteUUId: athleteUUId });

            if (mutate)
                mutate();
            if (myTeamMutate)
                myTeamMutate();
            if (mutatePlayers) {
                mutatePlayers(async (players: any) => {
                    return players.map((player: any) => {
                        if (player.name == name) {
                            player.tracked = false;
                        }
                        return player;
                    })
                }, { revalidate: true });
            }
            if (!bot) {
                await actionRecordEvent(
                    'mention-remove-myteam',
                    `{"params":"${params}","team":"${team}","player":"${name}", "athleteUUId": "${athleteUUId}"}`
                );
            }
        }
        else {
            const response = await actionAddMyTeamMember({ member: name, teamid: team, athleteUUId: athleteUUId });
            if (response.success) {
                setToastMessage("Player added to the Fantasy Team");
                setToastIcon(<TeamAddIcon className="h-6 w-6 opacity-60 hover:opacity-100  text-grey-400" />);
                setLocalTracked(true);

                if (mutate)
                    mutate();
                if (myTeamMutate)
                    myTeamMutate();
                if (mutatePlayers) {
                    mutatePlayers(async (players: any) => {
                        return players.map((player: any) => {
                            if (player.name == name) {
                                player.tracked = true;
                            }
                            return player;
                        })
                    }, { revalidate: true });
                }
                if (!bot) {
                    await actionRecordEvent(
                        'mention-add-myteam',
                        `{"params":"${params}","team":"${team}","player":"${name}"}`
                    );
                }
            }
            else {
                const { error, maxUser, maxSubscription } = response;
                if (error) {
                    setToastMessage(error);
                    setToastIcon(<TeamAddIcon className="h-6 w-6 opacity-60 hover:opacity-100  text-grey-4000" />);
                }
                if (maxUser) { // should only happen if the user is not logged in
                    //check if there is a logged in user
                    if (isLoaded && !isSignedIn) {
                        //if there is a logged in user, show a toast message
                        //setToastMessage("You have reached the maximum number of users allowed.");
                        //setToastIcon(<TeamAddIcon className="h-6 w-6 opacity-60 hover:opacity-100  text-grey-4000" />);
                        //put up a reponsive modal dialog, explaining that to have more than 10 players, one need to create a login.
                        setOpenLimitAccountModal(true);
                        setToastMessage("You have reached the maximum number of players allowed as a guest.");
                        setToastIcon(<TeamAddIcon className="h-6 w-6 opacity-60 hover:opacity-100  text-grey-4000" />);

                    }
                    else {
                        setToastMessage("There was an error adding the player to your team.");
                        setToastIcon(<TeamAddIcon className="h-6 w-6 opacity-60 hover:opacity-100  text-grey-4000" />);
                    }
                }
                else if (maxSubscription) {
                    setOpenLimitSubscriptionModal(true);
                    setToastMessage("You have reached the maximum number of players allowed under your subscription plan.");
                    setToastIcon(<TeamAddIcon className="h-6 w-6 opacity-60 hover:opacity-100  text-grey-4000" />);
                }
            }
        }

    }, [mention]);
    const timecodeSeconds = timecode && url.includes("youtube") ? timecode.split(':').reduce((acc: number, time: string | number) => (60 * acc) + +time) : 0;

    const youTubeLink = timecode && url.includes("youtube") ?
        `https://www.youtube.com/embed/${new URL(url).searchParams.get('v')}?start=${timecodeSeconds}`
        : "";

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: [0.1, 0.9], // Multiple thresholds for smoother transitions
                rootMargin: '100px' // Add a buffer zone of 100px around the viewport
            }
        );

        if (mentionRef.current) {
            observer.observe(mentionRef.current);
        } else {
            console.warn("Mention ref not found for intersection observer.");
        }

        return () => {
            if (mentionRef.current) {
                observer.unobserve(mentionRef.current);
            }
        };
    }, []);
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            {
                threshold: [0.1, 0.9], // Multiple thresholds for smoother transitions
                rootMargin: '100px' // Add a buffer zone of 100px around the viewport
            }
        );

        if (mobileMentionRef.current) {
            observer.observe(mobileMentionRef.current);
        } else {
            console.warn("Mention ref not found for intersection observer.");
        }

        return () => {
            if (mobileMentionRef.current) {
                observer.unobserve(mobileMentionRef.current);
            }
        };
    }, []);
    let img = meta?.image || image
    //console.log("====Mention  localLink   ", localUrl);
    return (
        <>
        `    {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-white border-opacity-30 border-t-white"></div>
                </div>
            )}`
            {/* {openLimitAccountModal && <LimitAccountModal setOpenCreateUser={setOpenLimitAccountModal} />} */}
            {/* {openLimitSubscriptionModal && <LimitSubscriptionModal setOpenLimitSubscriptionModal={setOpenLimitSubscriptionModal} subscrLevel={subscrLevel} />} */}
            <MentionWrap ref={mentionRef} onMouseEnter={() => onHover('desktop')}>
                <MentionSummary>
                    <Topline><LocalDate><i>{localDate}</i></LocalDate>
                        {!localFav ? <StarOutlineIcon className="h-4 w-4"
                            onClick={async () => {
                                //if (noUser) return;
                                setLocalFav(1);
                                await actionAddFavorite({ findexarxid });
                                if (mutate) mutate();
                                setToastMessage("Added to Favorites.");
                                setToastIcon(<StarIcon className="h-4 w-4" />);

                            }} style={{ color: "#888" }} /> :
                            <StarIcon className="h-4 w-4" onClick={async () => {
                                // if (noUser) return;
                                setLocalFav(0);
                                await actionRemoveFavorite({ findexarxid }); mutate();
                                setToastMessage("Removed from Favorites.");
                                setToastIcon(<StarOutlineIcon className="h-4 w-4" />);

                            }} style={{ color: "FFA000" }} />}</Topline>
                    <SummaryWrap>
                        <Link scroll={linkType == 'final' ? false : true} href={mini ? bottomLink : localUrl} onClick={async () => { await onMentionNav(name, athleteUUId, team, teamName, mini ? bottomLink : localUrl) }}>
                            <ImageTextWrapper>
                                {showImage && image && <img src={image} alt={name} />}
                                {summary}
                            </ImageTextWrapper>
                            {timecode && url.includes("youtube") && <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, marginTop: '20pt' }}>

                                {isVisible && timecode && url.includes("youtube") ? (
                                    <ErrorBoundary>
                                        <iframe
                                            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                            src={youTubeLink}
                                            title="YouTube video player"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>

                                    </ErrorBoundary>
                                ) : (
                                    (timecode && url.includes("youtube")) && img &&
                                    <div style={{ width: '100%', height: 'auto' }} >Loading video frame...</div>
                                )}
                            </div>}
                            {isVisible && timecode && url.includes("youtube") && (<div style={{ fontSize: '12px', color: '#ccc', marginTop: '5px', textAlign: 'center', fontStyle: 'italic' }}>
                                Note: We strive to provide accurate timecodes for the video. Please note that this feature is experimental.
                            </div>)}
                            <ShareContainerInline><ContentCopyIcon style={{ paddingTop: 0, marginBottom: -2, color: copied ? 'green' : '' }} fontSize="large" onClick={() => onCopyClick()} /></ShareContainerInline>
                        </Link>
                    </SummaryWrap>

                    {renderPrompts("desktop")}
                    <br />
                    <hr />
                    <Atmention ><Link scroll={linkType == 'final' ? false : true} href={bottomLink} onClick={async () => { await onMentionNav(name, athleteUUId, team, teamName, bottomLink) }}><b className={localTracked ? "bg-teal-50 dark:bg-teal-950 " : ""}>{(type == "person") && '@'}{name}</b> | {type == "person" ? `${teamName} |` : ""} {league} </Link>

                        {type == "person" && <div>
                            <div className="mt-2"
                                onClick={async () => await iconClick()} aria-label="Add to my team or remove from my team">
                                <SideIcon $highlight={localTracked}>
                                    {localTracked ? <TeamRemoveIcon className="h-6 w-6 opacity-60 hover:opacity-100 text-grey-4000" /> : <TeamAddIcon className="h-6 w-6 opacity-60 hover:opacity-100  text-grey-400" />}
                                </SideIcon>
                            </div>
                        </div>}
                    </Atmention>
                    <BottomLine>
                        <ShareGroup>
                            <ShareContainer onClick={() => onShare(url)}><IosShareIcon className="h-4 w-4 mr-2" /></ShareContainer>

                            <Link href={socialLinks.twitter} target="_blank">
                                <ShareContainer><XIcon className="h-4 w-4 mr-2" /></ShareContainer>
                            </Link>
                            <Link href={socialLinks.facebook} target="_blank">
                                <ShareContainer><FacebookIcon className="h-4 w-4 mr-2" /></ShareContainer>
                            </Link>
                        </ShareGroup>
                        <div className=" flex flex-row justify-between">
                            <Atmention2 className="mr-2">{meta?.site_name}</Atmention2>
                            {false && !mini && <Icon onClick={
                                async (e) => {
                                    const ne = !expanded
                                    setExpanded(ne);
                                    await onExtended(ne);
                                }}
                            >

                                {!expanded ? <IconChevronDown className="h-6 w-6 " /> : <IconChevronUp className="h-6 w-6" />}</Icon>}

                        </div>
                    </BottomLine>

                    {expanded && meta && <ExtendedMention>
                        <Link href={url} onClick={() => onClick(url)}>
                            <Title>{meta.title}</Title>
                        </Link>
                        <Link href={url} onClick={() => onClick(url)}>
                            <Byline>
                                {meta.authors && <Authors>{meta.authors}</Authors>}
                                <SiteName>{meta.site_name}</SiteName>
                            </Byline>
                        </Link>
                        <HorizontalContainer>
                            <Link href={url} onClick={() => onClick(url)}>
                                <ImageWrapper>
                                    <CustomImage src={meta.image} alt={meta.title} width={meta.image_width} height={meta.image_height} />
                                </ImageWrapper>
                            </Link>
                            <Body>
                                {false && <Link href={url} onClick={() => onClick(url)}><ArticleDigest>
                                    {true ? 'Article Digest:' : 'Short Digest:'}
                                </ArticleDigest></Link>}
                                <Digest>
                                    <Link href={url} onClick={() => onClick(url)}>
                                        <div dangerouslySetInnerHTML={{ __html: digest }} />
                                    </Link>
                                    {timecode && url.includes("youtube") && <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, marginTop: '20pt' }}>
                                        {isVisible && timecode && url.includes("youtube") ? (
                                            <iframe
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                src={youTubeLink}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>

                                        ) : (
                                            timecode && url.includes("youtube") && img && <img src={img} alt="Static representation" style={{ width: '100%', height: 'auto' }} />
                                        )}
                                    </div>}
                                    <ShareContainerInline>
                                        <ContentCopyIcon style={{ color: digestCopied ? 'green' : '' }} fontSize="large"
                                            onClick={() => onDigestCopyClick()} />
                                    </ShareContainerInline>

                                </Digest>
                            </Body>
                        </HorizontalContainer>
                        <Link href={url}>{meta.url.substring(0, 50)}..</Link>
                    </ExtendedMention>}
                </MentionSummary>
            </MentionWrap>
            <MobileMentionWrap ref={mobileMentionRef} $hideit={hide} onMouseEnter={() => onHover('mobile')}>
                <MentionSummary>
                    <div>
                        <Topline><LocalDate><b><i>{localDate}</i></b></LocalDate>
                            {!localFav ? <StarOutlineIcon className="h-4 w-4"
                                onClick={async () => {
                                    //if (noUser) return;
                                    setLocalFav(1);
                                    await actionAddFavorite({ findexarxid });
                                    if (mutate) mutate();
                                    setToastMessage("Added to Favorites.");
                                    setToastIcon(<StarIcon className="h-4 w-4" />);



                                }} style={{ color: "#888" }} /> :
                                <StarIcon className="h-4 w-4" onClick={async () => {
                                    // if (noUser) return;
                                    setLocalFav(0);
                                    await actionRemoveFavorite({ findexarxid }); mutate();
                                    setToastMessage("Removed from Favorites.");
                                    setToastIcon(<StarOutlineIcon className="h-4 w-4" />);

                                }} style={{ color: "FFA000" }} />}
                        </Topline>

                        <SummaryWrap>
                            <Link prefetch={false} scroll={linkType == 'final' ? false : true} href={mini ? bottomLink : localUrl} onClick={async () => { await onMentionNav(name, athleteUUId, team, teamName, mini ? bottomLink : localUrl) }}>
                                <ImageTextWrapper>
                                    {showImage && image && <img src={image} alt={name} />}
                                    {summary}
                                </ImageTextWrapper>
                                <ShareContainerInline><ContentCopyIcon style={{ color: copied ? 'green' : '' }} fontSize="medium" onClick={() => onCopyClick()} /></ShareContainerInline>
                            </Link>
                        </SummaryWrap>

                        {isVisible && timecode && url.includes("youtube") ? (
                            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, marginTop: '20pt' }}>
                                <iframe
                                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                    src={youTubeLink}
                                    title="YouTube video player"
                                    frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        ) : (
                            timecode && url.includes("youtube") && img && <img src={img} alt="Static representation" style={{ width: '100%', height: 'auto' }} />
                        )}
                        {isVisible && timecode && url.includes("youtube") && (<div style={{ fontSize: '12px', color: '#ccc', marginTop: '5px', textAlign: 'center', fontStyle: 'italic' }}>
                            Note: We strive to provide accurate timecodes for the video. Please note that this feature is experimental.
                        </div>)}

                        <hr />
                        <Atmention ><Link href={bottomLink} onClick={async () => { await onMentionNav(name, athleteUUId, team, teamName, bottomLink) }}><div className="text-sm "><b>{(type == "person") && '@'}{name}</b> | {type == "person" ? `${teamName} ` : ""} </div></Link>
                            {type == "person" && <div>
                                <div className="mt-2"
                                    onClick={async () => await iconClick()} aria-label="Add player to fantasy team">
                                    <SideIcon $highlight={localTracked}>
                                        {localTracked ? <TeamRemoveIcon className="h-6 w-6 opacity-60 hover:opacity-100 text-grey-4000" /> : <TeamAddIcon className="h-6 w-6 opacity-60 hover:opacity-100  text-grey-400" />}
                                    </SideIcon>
                                </div>
                            </div>}
                        </Atmention>
                        <MobileAtmention2>{meta?.site_name}</MobileAtmention2>
                    </div>
                    <br />
                    {renderPrompts("mobile")}
                    <BottomLine>
                        <ShareGroup>
                            <ShareContainer onClick={async () => await onShare(url)}><IosShareIcon className="h-4 w-4 mr-2" /></ShareContainer>
                            <Link href={socialLinks.twitter} target="_blank">
                                <ShareContainer><XIcon className="h-4 w-4 mr-2" /></ShareContainer>
                            </Link>
                            <Link href={socialLinks.facebook} target="_blank">
                                <ShareContainer><FacebookIcon className="h-4 w-4 mr-2" /></ShareContainer>
                            </Link>
                        </ShareGroup>
                        <Icon onClick={
                            async (e) => {
                                const ne = !expanded;
                                setExpanded(ne);
                                await onExtended(ne);
                            }}
                            className="material-icons-outlined">{!expanded ? "expand_more" : "expand_less"}</Icon>
                    </BottomLine>
                    {expanded && meta && <MobileExtendedMention>
                        <Link href={url} onClick={() => onClick(url)}><Title>{meta.title}</Title></Link>
                        <Link href={url} onClick={() => onClick(url)}><Byline>
                            {meta.authors && <Authors>{meta.authors}</Authors>}
                            <SiteName>{meta.site_name}</SiteName>
                        </Byline>
                        </Link>
                        <HorizontalContainer>
                            <Link href={url} onClick={() => onClick(url)}>
                                <ImageWrapper>
                                    <CustomImage src={meta.image} width={meta.image_width} height={meta.image_height} alt={meta.title} />
                                </ImageWrapper>
                            </Link>
                            <Body>
                                {false && <Link href={url} onClick={() => onClick(url)}><ArticleDigest>
                                    {true ? 'Article Digest:' : 'Short Digest:'}
                                </ArticleDigest></Link>}
                                <Digest>
                                    <Link href={url} onClick={() => onClick(url)}> <div dangerouslySetInnerHTML={{ __html: digest }} /></Link>
                                    <ShareContainerInline>
                                        <ContentCopyIcon style={{ marginBottom: 10, color: digestCopied ? 'green' : '' }} fontSize="large" onClick={() => onDigestCopyClick()} />
                                    </ShareContainerInline>
                                    {timecode && url.includes("youtube") && <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: 0, marginTop: '20pt' }}>
                                        {isVisible && timecode && url.includes("youtube") ? (
                                            <iframe
                                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                                                src={youTubeLink}
                                                title="YouTube video player"
                                                frameBorder="0"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            ></iframe>

                                        ) : (
                                            timecode && url.includes("youtube") && img && <img src={img} alt="Static representation" style={{ width: '100%', height: 'auto' }} />
                                        )}
                                    </div>}
                                </Digest>
                            </Body>
                        </HorizontalContainer>
                        <Link href={url} onClick={() => onClick(url)}> {meta.url.substring(0, 30)}...</Link>
                    </MobileExtendedMention>}
                </MentionSummary>
            </MobileMentionWrap>
            {toastMessage && <Toast icon={toastIcon} message={toastMessage} onClose={() => setToastMessage("")} />}
        </>
    );
};

export default Mention;
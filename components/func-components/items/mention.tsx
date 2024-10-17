'use client';
import React, { useEffect, useCallback, useState } from "react";
import useSWR from 'swr';
import Link from 'next/link';
import { SignInButton, RedirectToSignIn } from "@clerk/nextjs";
import { useUser } from "@clerk/nextjs";
import { styled, useTheme } from "styled-components";
import { RWebShare } from "react-web-share";

import FacebookIcon from '@/components/icons/facebook';
import XIcon from '@/components/icons/twitter';
import StarOutlineIcon from '@/components/icons/star-outline';
import StarIcon from '@/components/icons/star';
import IosShareIcon from '@/components/icons/share';
import ContentCopyIcon from '@/components/icons/content-copy';
import IconChevronUp from '@/components/icons/chevron-up';
import IconChevronDown from '@/components/icons/chevron-down';

import { MetaLinkKey, getMetaLink, addFavorite, removeFavorite } from '@/lib/api';
import { convertToUTCDateString, convertToReadableLocalTime } from "@/lib/date-convert";
import useCopyToClipboard from '@/lib/copy-to-clipboard';
import { useAppContext } from '@/lib/context';
import { actionRecordEvent } from "@/lib/actions";
import TeamAddIcon from "@/components/icons/usergroup-add";
import TeamRemoveIcon from "@/components/icons/usergroup-delete";
import { actionFetchMyTeam, actionAddMyTeamMember, actionRemoveMyTeamMember } from "@/lib/fetchers/my-team-actions";
import { actionAddFavorite, actionRemoveFavorite } from "@/lib/fetchers/favorites";

import { MyTeamRosterKey,/* UserSubscriptionKey as SubscriptionKey */ } from '@/lib/keys';
import Toast from '@/components/func-components/toaster';
//import LimitAccountModal from '@/components/util-components/user-account';
//import LimitSubscriptionModal from "@/components/util-components/user-subscription";
//import { actionUserSubscription } from "@/lib/fetchers/user-subscription";


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
        font-size:15px !important;    
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
        font-size:15px !important;
      
    }
`;

const Body = styled.div`
    font-size: 15px;
    margin-bottom: 14px;
    flex: 2 1 auto;
    line-height:1.4;
    a{
        font-size:15px !important;
      
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

const Image = styled.img`
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
        font-size:15px !important;     
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
    margin-top:14px;
    margin-bottom:14px;
    margin-left:4px;
    margin-right:4px;
    height:24px;
    width:100%;
    display:flex;
    justify-content:flex-start;

    font-size: 28x;  
    height:38px;
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
    font-size: 28x;  
    height:38px;
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
   
    font-size:15px !important;
    a{
        font-size:15px !important;
      
    }
`;
const LocalLink = styled.a`
    cursor:pointer;
`;
interface Props {
    mention: any,
    linkType?: string;
    startExtended?: boolean;
    mutate: any;
    mini?: boolean;
    handleClose: () => void;
    mutatePlayers?: any;
}

const Mention: React.FC<Props> = ({ mini, startExtended, linkType, mention, mutate, handleClose, mutatePlayers }) => {
    const { setFindexarxid, setSlug, fallback, league: ll, mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setPlayer, setMode, fbclid, utm_content, params, tp, pagetype, setTeamid, setTeamName } = useAppContext();
    const [toastMessage, setToastMessage] = useState("");
    const [toastIcon, setToastIcon] = useState(<></>);
    let { league, type, team, teamName, name, athleteUUId, date, url, findex, summary, findexarxid, fav, tracked } = mention;
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
    const { data: trackerListMembers, error: trackerListError, isLoading: trackerListLoading, mutate: myTeamMutate } = useSWR(trackerListMembersKey, actionFetchMyTeam, fallback);

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
        //console.log("Mention, extended:", "useEffect", startExtended, expanded)
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

    //  const subscriptionKey: SubscriptionKey = { type: "subscription" };
    //    const { data: subscription, error: subscriptionError } = useSWR(subscriptionKey, actionUserSubscription, { fallback });
    //const subscrLevel = subscription?.subscrLevel || 0;
    //prepare urls:
    const prepName = encodeURIComponent(name);//name?.replaceAll(' ', '_') || "";
    let shareUrl = (type == 'person' ? `${process.env.NEXT_PUBLIC_SERVER}/${league}/${encodeURIComponent(team)}/${encodeURIComponent(prepName)}/${athleteUUId}?id=${findexarxid}&utm_content=sharelink` : `${league}/${encodeURIComponent(team)}/${athleteUUId}?id=${findexarxid}&utm_content=sharelink`);

    const twitterShareUrl = `${process.env.NEXT_PUBLIC_SERVER}/` + (type == 'person' ? `${league}/${encodeURIComponent(team)}/${encodeURIComponent(prepName)}/${athleteUUId}?id=${findexarxid}&utm_content=xlink` : `/${league}/${encodeURIComponent(team)}/${athleteUUId}?id=${findexarxid}&utm_content=xlink`);
    const fbShareUrl = `${process.env.NEXT_PUBLIC_SERVER}/` + (type == 'person' ? `${league}/${encodeURIComponent(team)}/${encodeURIComponent(prepName)}/${athleteUUId}?id=${findexarxid}&utm_content=fblink` : `/${league}/${encodeURIComponent(team)}/${athleteUUId}?id=${findexarxid}&utm_content=fblink`);
    // console.log("fbShareUrl",mention,{prepName,league,team,fbShareUrl})

    let localUrl = "";
    localUrl = type == 'person' ? `/${league}/${team}/${prepName}/${athleteUUId}?id=${findexarxid}` : `/${league}/${team}?id=${findexarxid}`
    if (mini)
        localUrl = type == 'person' ? `/${league}/${team}/${prepName}/${athleteUUId}` : `/${league}/${team}`

    //let bottomLink = type == 'person' ? `/${league}/${team}/${prepName}${params}${tp}${params.includes('?') ? '&' : '?'}top=1` : `/${league}/${team}${params}${tp}${params.includes('?') ? '&' : '?'}top=1`;
    let bottomLink = type == 'person' ? `/${league}/${team}/${prepName}/${athleteUUId}` : `/${league}/${team}`;
    if (linkType == 'final')
        bottomLink += `${params.includes('?') ? '&' : '?'}top=1`;
    localUrl = localUrl.replace('&tab=all', '');
    bottomLink = bottomLink.replace('&tab=all', '');
    localUrl = localUrl.replace('&tab=myfeed', '');
    bottomLink = bottomLink.replace('&tab=myfeed', '');
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(summary?.substring(0, 230) || "" + '...')}&url=${twitterShareUrl}&via=findexar`;
    summary = summary || "";
    // Normalize summary to ensure it's safe for URI encoding
    summary = summary.normalize("NFKC");
    // console.log("******** SUMMARY", summary, fbShareUrl, { quote: summary.substring(0, 140) + '...' })
    const fbLink = `https://www.facebook.com/sharer.php?kid_directed_site=0&sdk=joey&u=${encodeURIComponent(fbShareUrl)}&t=${encodeURIComponent('Findexar')}&quote=${encodeURIComponent(summary.substring(0, 140) + '...')}&hashtag=%23findexar&display=popup&ref=plugin&src=share_button`;
    const tgLink = `${process.env.NEXT_PUBLIC_SERVER}` + localUrl;
    const mentionsKey: MetaLinkKey = { func: "meta", findexarxid, long: startExtended ? 1 : 1 };
    const meta: any = useSWR(mentionsKey, getMetaLink, { fallback }).data;
    let digest = meta?.digest || "";
    const { isLoaded, isSignedIn, user } = useUser();
    const [openLimitAccountModal, setOpenLimitAccountModal] = useState(false);
    const [openLimitSubscriptionModal, setOpenLimitSubscriptionModal] = useState(false);
    // console.log("isLoaded", isLoaded, isSignedIn, user);


    useEffect(() => {
        try {
            setLocalDate(convertToReadableLocalTime(date));
        }
        catch (x) {
            console.log("EXCEPTION CONVERTING DATE");
        }
    }, [date])

    const onMentionNav = useCallback(async (name: string, athleteUUId: string, url: string) => {

        console.log("onMentionNav", name, athleteUUId, url)

        let pgt = "";
        if (type == 'person')
            pgt = 'player';
        else
            pgt = 'team';

        await actionRecordEvent(
            'mention-nav',
            `{"params":"${params}","league":"${league}","team":"${team}","name":"${name}", "athleteUUId":"${athleteUUId}", "pagetype":"${pgt}"}`
        );

    }, [league, team, type, params]);

    const enableRedirect = useCallback(() => {
        if (window && window.Clerk) {
            const Clerk = window.Clerk;
            const user = Clerk.user;
            const id = Clerk.user?.id;
            if (!id) {
                setSignin(true);
                return;
            }
        }
    }, []);

    const onExtended = useCallback(async (on: boolean) => {

        await actionRecordEvent(
            'mention-extended',
            `{"on":"${on}","summary","${summary}","url":"${url}","params":"${params}"}`
        );
    }, [params]);

    const onHover = useCallback((label: string) => {
        try {
            actionRecordEvent(`mention-hover`, `{"label":"${label}","url":"${encodeURI(url)}","params":"${params}"}`)
                .then((r: any) => {

                });
        } catch (x) {
            console.log('actionRecordEvent', x);
        }
    }, [params]);

    const onShare = useCallback((url: string) => {
        try {
            actionRecordEvent(`mention-share`, `{"url","${url}","params":"${params}"}`)
                .then((r: any) => {
                    //console.log("actionRecordEvent", r);
                });
        } catch (x) {
            console.log('actionRecordEvent', x);
        }
    }, [params]);

    const onClick = useCallback((url: string) => {
        try {
            actionRecordEvent(`mention-story-click`, `{"url","${url}","params":"${params}"}`)
                .then((r: any) => {
                    console.log("actionRecordEvent", r);
                });
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
        console.log("ICON CLICK")

        if (localTracked == true) {
            console.log("TRACKED", name);
            setToastMessage("Player removed from the Team");
            setToastIcon(<TeamRemoveIcon className="h-6 w-6 opacity-60 hover:opacity-100 text-grey-4000" />);

            console.log("tracked after mutatePlayers", name, team);
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
            await actionRecordEvent(
                'mention-remove-myteam',
                `{"params":"${params}","team":"${team}","player":"${name}", "athleteUUId": "${athleteUUId}"}`
            );
        }
        else {
            console.log("UNTRACKED", name)
            const response = await actionAddMyTeamMember({ member: name, teamid: team, athleteUUId: athleteUUId });
            if (response.success) {
                setToastMessage("Player added to the Fantasy Team");
                setToastIcon(<TeamAddIcon className="h-6 w-6 opacity-60 hover:opacity-100  text-grey-400" />);
                setLocalTracked(true);
                console.log("untracked after mutatePlayers", name, team, athleteUUId);

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
                await actionRecordEvent(
                    'mention-add-myteam',
                    `{"params":"${params}","team":"${team}","player":"${name}"}`
                );
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

    }, [mention])
    //console.log("bottomLink",bottomLink)
    return (
        <>
            {/* {openLimitAccountModal && <LimitAccountModal setOpenCreateUser={setOpenLimitAccountModal} />} */}
            {/* {openLimitSubscriptionModal && <LimitSubscriptionModal setOpenLimitSubscriptionModal={setOpenLimitSubscriptionModal} subscrLevel={subscrLevel} />} */}
            <MentionWrap onMouseEnter={() => onHover('desktop')}>
                <MentionSummary>
                    <Topline><LocalDate><i>{localDate}</i></LocalDate>
                        {!localFav ? <StarOutlineIcon className="h-4 w-4"
                            onClick={async () => {
                                if (noUser) return;
                                setLocalFav(1);
                                await actionAddFavorite({ findexarxid });
                                if (mutate) mutate();
                                setToastMessage("Added to Favorites.");
                                setToastIcon(<StarIcon className="h-4 w-4" />);



                            }} style={{ color: "#888" }} /> :
                            <StarIcon className="h-4 w-4" onClick={async () => {
                                if (noUser) return;
                                setLocalFav(0);
                                await actionRemoveFavorite({ findexarxid }); mutate();
                                setToastMessage("Removed from Favorites.");
                                setToastIcon(<StarOutlineIcon className="h-4 w-4" />);

                            }} style={{ color: "FFA000" }} />}</Topline>
                    <SummaryWrap>
                        <Link scroll={linkType == 'final' ? false : true} href={mini ? bottomLink : localUrl} onClick={async () => { await onMentionNav(name, athleteUUId, mini ? bottomLink : localUrl) }}>
                            {summary}
                        </Link>
                        <ShareContainerInline><ContentCopyIcon style={{ paddingTop: 6, marginBottom: -2, color: copied ? 'green' : '' }} fontSize="large" onClick={() => onCopyClick()} /></ShareContainerInline>

                    </SummaryWrap>
                    <br />

                    <hr />
                    <Atmention ><Link scroll={linkType == 'final' ? false : true} href={bottomLink} onClick={async () => { await onMentionNav(name, athleteUUId, bottomLink) }}><b className={localTracked ? "bg-teal-50 dark:bg-teal-950 " : ""}>{(type == "person") && '@'}{name}</b> | {type == "person" ? `${teamName} |` : ""} {league} </Link>

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
                        <ShareGroup><RWebShare
                            data={{
                                text: summary,
                                url: shareUrl,
                                title: `${process.env.NEXT_PUBLIC_APP_NAME}`,
                            }}
                            onClick={async () => await onShare(url)}
                        >
                            <ShareContainer><IosShareIcon className="h-6 w-6 mr-2" /></ShareContainer>
                        </RWebShare>
                            <Link href={twitterLink} target="_blank"><ShareContainer><XIcon className="h-6 w-6 mr-2" /></ShareContainer></Link>
                            <Link href={fbLink} target="_blank"><ShareContainer><FacebookIcon className="h-6 w-6 mr-2" /></ShareContainer></Link>
                        </ShareGroup>
                        <div className=" flex flex-row justify-between">
                            <Atmention2 className="mr-2">{meta?.site_name}</Atmention2>
                            {!mini && <Icon onClick={
                                async (e) => {
                                    const ne = !expanded
                                    setExpanded(ne);
                                    await onExtended(ne);
                                }}
                            >{!expanded ? <IconChevronDown className="h-6 w-6 " /> : <IconChevronUp className="h-6 w-6" />}</Icon>}
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
                                    <Image src={meta.image} alt={meta.title} />
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
            <MobileMentionWrap $hideit={hide} onMouseEnter={() => onHover('mobile')}>
                <MentionSummary>
                    <div>
                        <Topline><LocalDate><b><i>{localDate}</i></b></LocalDate>{!localFav ? noUser ? <SignInButton><StarOutlineIcon onClick={() => { if (noUser) return; enableRedirect(); setLocalFav(1); addFavorite({ findexarxid }); mutate(); }} style={{ color: "#888" }} /></SignInButton> : <StarOutlineIcon onClick={() => { if (noUser) return; setLocalFav(1); enableRedirect(); addFavorite({ findexarxid }); mutate(); }} style={{ color: "#888" }} /> : <StarIcon onClick={() => { if (noUser) return; setLocalFav(0); removeFavorite({ findexarxid }); mutate(); }} style={{ color: "FFA000" }} />}</Topline>

                        <SummaryWrap>
                            <Link prefetch={false} scroll={linkType == 'final' ? false : true} href={mini ? bottomLink : localUrl} onClick={async () => { await onMentionNav(name, athleteUUId, mini ? bottomLink : localUrl) }}>
                                {summary}
                            </Link>
                            <ShareContainerInline><ContentCopyIcon style={{ color: copied ? 'green' : '' }} fontSize="large" onClick={() => onCopyClick()} /></ShareContainerInline>
                        </SummaryWrap>

                        <hr />
                        <Atmention ><Link href={bottomLink} onClick={async () => { await onMentionNav(name, athleteUUId, bottomLink) }}><div className="text-sm "><b>{(type == "person") && '@'}{name}</b> | {type == "person" ? `${teamName} ` : ""} </div></Link>
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
                    <BottomLine>
                        <ShareGroup><RWebShare
                            data={{
                                text: summary,
                                url: shareUrl,
                                title: "Findexar",
                            }}
                            onClick={async () => onShare(url)}
                        >
                            <ShareContainer><IosShareIcon /></ShareContainer>
                        </RWebShare>
                            <Link href={twitterLink} target="_blank"><ShareContainer><XIcon /></ShareContainer></Link>
                            <Link href={fbLink} target="_blank"><ShareContainer><FacebookIcon /></ShareContainer></Link>
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
                                    <Image src={meta.image} width={100} height={100} alt={meta.title} />
                                </ImageWrapper>
                            </Link>
                            <Body>
                                {false && <Link href={url} onClick={() => onClick(url)}><ArticleDigest>
                                    {true ? 'Article Digest:' : 'Short Digest:'}
                                </ArticleDigest>
                                </Link>}
                                <Digest>
                                    <Link href={url} onClick={() => onClick(url)}> <div dangerouslySetInnerHTML={{ __html: digest }} /></Link>
                                    <ShareContainerInline>
                                        <ContentCopyIcon style={{ color: digestCopied ? 'green' : '' }} fontSize="large" onClick={() => onDigestCopyClick()} />
                                    </ShareContainerInline>
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
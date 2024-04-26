import React, { useEffect, useCallback } from "react";
import useSWRImmutable from 'swr/immutable'
import Link from 'next/link';
import { SignInButton, RedirectToSignIn } from "@clerk/nextjs";
//import { styled, useTheme } from "styled-components";
import { RWebShare } from "react-web-share";
import FacebookIcon from '@/components/icons/facebook';
import XIcon from '@/components/icons/twitter';
import StarOutlineIcon from '@/components/icons/star-outline';
import StarIcon from '@/components/icons/star';
import IosShareIcon from '@/components/icons/share';
import ContentCopyIcon from '@/components/icons/content-copy';
/*import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import IosShareIcon from '@mui/icons-material/IosShare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';*/

import { MetaLinkKey, getMetaLink, addFavorite, removeFavorite, recordEvent } from '@/lib/api';
import { convertToUTCDateString, convertToReadableLocalTime } from "@/lib/date-convert";
import useCopyToClipboard from '@/lib/copy-to-clipboard';
import { useAppContext } from '@/lib/context';

declare global {
    interface Window {
        Clerk: any;
    }
}

interface Props {
    mention: any,
    linkType?: string;
    startExtended?: boolean;
    mutate: any;
    mini?: boolean;
    handleClose: () => void;
}
const Mention: React.FC<Props> = ({ mini, startExtended, linkType, mention, mutate, handleClose }) => {
    const { mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, pagetype, setTeamName } = useAppContext();

    let { league, type, team, teamName, name, date, url, findex, summary, findexarxid, fav } = mention;
    linkType = linkType || 'final';
    mini = mini || false;
    const [expanded, setExpanded] = React.useState(startExtended);
    const [localDate, setLocalDate] = React.useState(convertToUTCDateString(date));
    const [localFav, setLocalFav] = React.useState(fav);
    const [hide, setHide] = React.useState(false);
    const [signin, setSignin] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const [digestCopied, setDigestCopied] = React.useState(false);
    const [value, copy] = useCopyToClipboard();


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

    //prepare urls:
    const prepName = name?.replaceAll(' ', '_') || "";
    let shareUrl = (type == 'person' ? `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${league}/team/${encodeURIComponent(team)}/player/${encodeURIComponent(prepName)}?id=${findexarxid}&utm_content=sharelink` : `/pub/league/${league}/team/${encodeURIComponent(team)}?id=${findexarxid}&utm_content=sharelink`);

    const twitterShareUrl = `${process.env.NEXT_PUBLIC_SERVER}/` + (type == 'person' ? `pub/league/${league}/team/${encodeURIComponent(team)}/player/${encodeURIComponent(prepName)}?id=${findexarxid}&utm_content=xlink` : `/pub/league/${league}/team/${encodeURIComponent(team)}?id=${findexarxid}&utm_content=xlink`);
    const fbShareUrl = `${process.env.NEXT_PUBLIC_SERVER}/` + (type == 'person' ? `pub/league/${league}/team/${encodeURIComponent(team)}/player/${encodeURIComponent(prepName)}?id=${findexarxid}&utm_content=fblink` : `/pub/league/${league}/team/${encodeURIComponent(team)}?id=${findexarxid}&utm_content=fblink`);
    let localUrl = "";
    localUrl = type == 'person' ? `/pub/league/${league}/team/${team}/player/${prepName}${params}${tp}${params.includes('?') ? '&' : '?'}id=${findexarxid}` : `/pub/league/${league}/team/${team}${params}${tp}${params.includes('?') ? '&' : '?'}id=${findexarxid}`
    if (mini)
        localUrl = type == 'person' ? `/pub/league/${league}/team/${team}/player/${prepName}${params}${tp}` : `/pub/league/${league}/team/${team}${params}${tp}`

    const bottomLink = type == 'person' ? `/pub/league/${league}/team/${team}/player/${prepName}${params}${tp}` : `/pub/league/${league}/team/${team}${params}${tp}`;
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(summary?.substring(0, 230) || "" + '...')}&url=${twitterShareUrl}&via=findexar`;
    const fbLink = `https://www.facebook.com/sharer.php?kid_directed_site=0&sdk=joey&u=${encodeURIComponent(fbShareUrl)}&t=${encodeURIComponent('Findexar')}&quote=${encodeURIComponent(summary?.substring(0, 140) || "" + '...')}&hashtag=%23findexar&display=popup&ref=plugin&src=share_button`;
    const tgLink = `${process.env.NEXT_PUBLIC_SERVER}` + localUrl;
    const mentionsKey: MetaLinkKey = { func: "meta", findexarxid, long: startExtended ? 1 : 1 };
    const meta = useSWRImmutable(mentionsKey, getMetaLink).data;
    let digest = meta?.digest || "";

    useEffect(() => {
        try {
            setLocalDate(convertToReadableLocalTime(date));
        }
        catch (x) {
            console.log("EXCEPTION CONVERTING DATE");
        }
    }, [date])

    const onMentionNav = useCallback(async (name: string) => {
        handleClose();
        setLeague(league);
        setTeam(team);
        setPlayer(type == 'person' ? name : '');
        let pgt = "";
        if (type == 'person')
            pgt = 'player';
        else
            pgt = 'team';
        setPagetype(pgt);
        await recordEvent(
            'mention-nav',
            `{"params":"${params}","league":"${league}","team":"${team}","name":"${name}","pagetype":"${pgt}"}`
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

       /* await recordEvent(
            'mention-extended',
            `{"on":"${on}","summary","${summary}","url":"${url}","params":"${params}"}`
        );*/
    }, [params]);

    const onHover = useCallback((label: string) => {
        try {
           /* recordEvent(`mention-hover`, `{"label":"${label}","url":"${url}","params":"${params}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });*/
        } catch (x) {
            console.log('recordEvent', x);
        }
    }, [params]);

    const onShare = useCallback((url: string) => {
        try {
            recordEvent(`mention-share`, `{"url","${url}","params":"${params}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
        }
    }, [params]);

    const onClick = useCallback((url: string) => {
        try {
            recordEvent(`mention-story-click`, `{"url","${url}","params":"${params}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
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

    return (
        <>
            <div data-name="MentionWrap" onMouseEnter={() => onHover('desktop')}>
                <div data-name="MentionSummary">
                    <div><div><i>{localDate}</i></div>
                        {!localFav ? noUser ? <SignInButton><div onClick={() => { if (noUser) return; setLocalFav(1); enableRedirect(); addFavorite({ findexarxid }); if (mutate) mutate() }} style={{ color: "#888" }} /></SignInButton> : <StarOutlineIcon onClick={() => { if (noUser) return; setLocalFav(1); enableRedirect(); addFavorite({ findexarxid }); mutate(); }} style={{ color: "#888" }} /> : <StarIcon onClick={() => { if (noUser) return; setLocalFav(0); removeFavorite({ findexarxid }); mutate(); }} style={{ color: "FFA000" }} />}</Topline>
                    <div>
                        <Link scroll={linkType == 'final' ? false : true} href={localUrl} onClick={async () => { await onMentionNav(name) }} shallow>
                            {summary}
                        </Link>
                        <div><ContentCopyIcon style={{ paddingTop: 6, marginBottom: -2 }} fontSize="small" sx={{ color: copied ? 'green' : '' }} onClick={() => onCopyClick()} /></div>
                    </div>
                    <hr />
                    <div><Link href={bottomLink}><b>{(type == "person") && '@'}{name}</b> | {type == "person" ? `${teamName} |` : ""} {league} </Link></div>
                    <div>{meta?.site_name}</div>
                    <div data-name="BottomLine">
                        <div data-name="ShareGroup"><RWebShare
                            data={{
                                text: summary,
                                url: shareUrl,
                                title: `${process.env.NEXT_PUBLIC_APP_NAME}`,
                            }}
                            onClick={async () => await onShare(url)}
                        >
                            <div data-name="ShareContainer"><div data-name="ShareIcon"><IosShareIcon /></div></div>
                        </RWebShare>
                            <Link href={twitterLink} target="_blank"><div data-name="ShareContainer"><XIcon /></div></Link>
                            <Link href={fbLink} target="_blank"><div><FacebookIcon/></div></Link>
                        </div>
                        {!mini && <div onClick={
                            async (e) => {
                                const ne = !expanded
                                setExpanded(ne);
                                await onExtended(ne);
                            }}
                            className="material-icons-outlined">{!expanded ? "expand_more" : "expand_less"}</div>}
                    </div>
                    {expanded && meta && <div data-name="ExtendedMention">
                        <Link href={url} onClick={()=>onClick(url)}>
                            <div data-name="Title">{meta.title}</div>
                        </Link>
                        <Link href={url} onClick={()=>onClick(url)}>
                            <div data-name="Byline">
                                {meta.authors && <div data-name="Authors">{meta.authors}</div>}
                                <div data-name="SiteName">{meta.site_name}</div>
                            </div>
                        </Link>
                        <div data-name="HorizontalContainer">
                            <Link href={url} onClick={()=>onClick(url)}>
                                <div data-name="ImageWrapper">
                                    <img data-name="Image" src={meta.image} alt={meta.title} />
                                </div>
                            </Link>
                            <div data-name="Body">
                                {false && <Link href={url} onClick={()=>onClick(url)}><div data-name="ArticleDigest">
                                    {true ? 'Article Digest:' : 'Short Digest:'}
                                </div></Link>}
                                <div data-name="Digest">
                                    <Link href={url} onClick={()=>onClick(url)}>
                                        <div dangerouslySetInnerHTML={{ __html: digest }} />
                                    </Link>
                                    <div data-name="ShareContainerInline">
                                        <ContentCopyIcon style={{ paddingTop: 6, marginTop: -10 }} fontSize="small" sx={{ color: digestCopied ? 'green' : '' }} onClick={() => onDigestCopyClick()} />
                                    </div>

                                </div>
                            </div>
                        </div>
                        <Link href={url}>{meta.url.substring(0, 50)}..</Link>
                    </div>}
                </div>
            </div>
            <div data-name="MobileMentionWrap">
                <div data-name="MentionSummary">
                    <div>
                        <div data-name="Topline"><div data-name="LocalDate"><b><i>{localDate}</i></b></div>{!localFav ? noUser ? <SignInButton><StarOutlineIcon onClick={() => { if (noUser) return; enableRedirect(); setLocalFav(1); addFavorite({ findexarxid }); mutate(); }} style={{ color: "#888" }} /></SignInButton> : <StarOutlineIcon onClick={() => { if (noUser) return; setLocalFav(1); enableRedirect(); addFavorite({ findexarxid }); mutate(); }} style={{ color: "#888" }} /> : <StarIcon onClick={() => { if (noUser) return; setLocalFav(0); removeFavorite({ findexarxid }); mutate(); }} style={{ color: "FFA000" }} />}</div>
                        <div data-name="SummaryWrap">
                            <Link scroll={linkType == 'final' ? false : true} href={localUrl} onClick={async () => { await onMentionNav(name) }} shallow>
                                {summary}
                            </Link>
                            <div data-name="ShareContainerInline"><ContentCopyIcon style={{ paddingTop: 6, marginBottom: -2,color: copied ? 'green' : '' }} fontSize="small"  onClick={() => onCopyClick()} /></div>
                        </div>
                        <hr />
                        <div data-name="Atmention"><b>{(type == "person") && '@'}{name}</b> | {type == "person" ? `${teamName} |` : ""}  {league}</div>
                        <div data-name="MobileAtmention2">{meta?.site_name}</div>
                    </div>
                    <div data-name="BottomLine">
                        <div data-name="ShareGroup"><RWebShare
                            data={{
                                text: summary,
                                url: shareUrl,
                                title: "Findexar",
                            }}
                            onClick={async () => onShare(url)}
                        >
                            <div data-name="ShareContainer"><div data-name="ShareIcon"><IosShareIcon /></div></div>
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
                        <Link href={url} onClick={()=>onClick(url)}><Title>{meta.title}</Title></Link>
                        <Link href={url} onClick={()=>onClick(url)}><Byline>
                            {meta.authors && <Authors>{meta.authors}</Authors>}
                            <SiteName>{meta.site_name}</SiteName>
                        </Byline>
                        </Link>
                        <HorizontalContainer>
                            <Link href={url} onClick={()=>onClick(url)}>
                                <ImageWrapper>
                                    <Image src={meta.image} width={100} height={100} alt={meta.title} />
                                </ImageWrapper>
                            </Link>
                            <Body>
                                {false && <Link href={url} onClick={()=>onClick(url)}><ArticleDigest>
                                    {true ? 'Article Digest:' : 'Short Digest:'}
                                </ArticleDigest>
                                </Link>}
                                <Digest>
                                    <Link href={url} onClick={()=>onClick(url)}> <div dangerouslySetInnerHTML={{ __html: digest }} /></Link>
                                    <ShareContainerInline>
                                        <ContentCopyIcon style={{ paddingTop: 6, marginBottom: 0, marginTop: -10 }} fontSize="small" sx={{ color: digestCopied ? 'green' : '' }} onClick={() => onDigestCopyClick()} />
                                    </ShareContainerInline>
                                </Digest>
                            </Body>
                        </HorizontalContainer>
                        <Link href={url} onClick={()=>onClick(url)}> {meta.url.substring(0, 30)}...</Link>
                    </MobileExtendedMention>}
                </MentionSummary>
            </MobileMentionWrap>
        </>
    );
};

export default Mention;
import React, { useEffect, useCallback } from "react";
import useSWRImmutable from 'swr/immutable'
import Link from 'next/link';
import { SignInButton, RedirectToSignIn } from "@clerk/nextjs";
import { styled, useTheme } from "styled-components";
import { RWebShare } from "react-web-share";
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import StarIcon from '@mui/icons-material/Star';
import IosShareIcon from '@mui/icons-material/IosShare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { MetaLinkKey, getMetaLink, addFavorite, removeFavorite, recordEvent } from '@/lib/api';
import { convertToUTCDateString, convertToReadableLocalTime } from "@/lib/date-convert";
import useCopyToClipboard from '@/lib/copy-to-clipboard';
import { useAppContext } from '@/lib/context';

declare global {
    interface Window {
        Clerk: any;
    }
}
interface MentionsProps {
    hideit?: boolean;
    noborder?: boolean;
}

const MentionWrap = styled.div<MentionsProps>`
    width:100%;
    min-height:100px;
    background-color: var(--mention-bg);//var(--mention-border);
    flex-direction: row;
    justify-content: flex-start;
    align-items:flex-start;
    border: 1px solid #ccc;
    padding:4px;
    z-index:200;
    font-size: 16px;

    a{
        color:var(--mention-text);
        text-decoration: none;
        &:hover{
           color: var(--mention-text);
        }   
    }
    display:${props => props.hideit ? 'none' : 'flex'};
    @media screen and (max-width: 1199px) {
        display: none;
    }
`;

const MobileMentionWrap = styled.div<MentionsProps>` 
    min-height:100px;
    width:100%;
    display:${props => props.hideit ? 'none' : 'flex'};
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
    font-size: 38px !important;
    opacity:0.6;
    height:48px;
    margin-top:10px;
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
    justify-content:space-between;
    align-items:flex-start;
    width:78px;
    height:40px;
    margin-top:10px;
`;

const BottomLine = styled.div`
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    align-items:flex-end;
    margin-top:-20px;
    width:100%;
`;

const LocalDate = styled.div`
    font-size: 12px;
`;

const SummaryWrap = styled.div`
    display:inline;
    line-height: 1.2;
    font-size:15px !important;
    a{
        font-size:15px !important;
      
    }
`;

const ShareIcon = styled.div`
    margin-top:-1px;
    padding-bottom:4px;
`;

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
    const theme = useTheme();

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

        await recordEvent(
            'mention-extended',
            `{"on":"${on}","summary","${summary}","url":"${url}","params":"${params}"}`
        );
    }, [params]);

    const onHover = useCallback((label: string) => {
        try {
            recordEvent(`mention-hover`, `{"label":"${label}","url":"${url}","params":"${params}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
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
            <MentionWrap onMouseEnter={() => onHover('desktop')}>
                <MentionSummary>
                    <Topline><LocalDate><i>{localDate}</i></LocalDate>
                        {!localFav ? noUser ? <SignInButton><StarOutlineIcon onClick={() => { if (noUser) return; setLocalFav(1); enableRedirect(); addFavorite({ findexarxid }); if (mutate) mutate() }} style={{ color: "#888" }} /></SignInButton> : <StarOutlineIcon onClick={() => { if (noUser) return; setLocalFav(1); enableRedirect(); addFavorite({ findexarxid }); mutate(); }} style={{ color: "#888" }} /> : <StarIcon onClick={() => { if (noUser) return; setLocalFav(0); removeFavorite({ findexarxid }); mutate(); }} style={{ color: "FFA000" }} />}</Topline>
                    <SummaryWrap>
                        <Link scroll={linkType == 'final' ? false : true} href={localUrl} onClick={async () => { await onMentionNav(name) }} shallow>
                            {summary}
                        </Link>
                        <ShareContainerInline><ContentCopyIcon style={{ paddingTop: 6, marginBottom: -2 }} fontSize="small" sx={{ color: copied ? 'green' : '' }} onClick={() => onCopyClick()} /></ShareContainerInline>
                    </SummaryWrap>
                    <hr />
                    <Atmention><Link href={bottomLink}><b>{(type == "person") && '@'}{name}</b> | {type == "person" ? `${teamName} |` : ""} {league} </Link></Atmention>
                    <Atmention2>{meta?.site_name}</Atmention2>
                    <BottomLine>
                        <ShareGroup><RWebShare
                            data={{
                                text: summary,
                                url: shareUrl,
                                title: `${process.env.NEXT_PUBLIC_APP_NAME}`,
                            }}
                            onClick={async () => await onShare(url)}
                        >
                            <ShareContainer><ShareIcon><IosShareIcon /></ShareIcon></ShareContainer>
                        </RWebShare>
                            <Link href={twitterLink} target="_blank"><ShareContainer><XIcon /></ShareContainer></Link>
                            <Link href={fbLink} target="_blank"><ShareContainer><FacebookIcon /></ShareContainer></Link>
                        </ShareGroup>
                        {!mini && <Icon onClick={
                            async (e) => {
                                const ne = !expanded
                                setExpanded(ne);
                                await onExtended(ne);
                            }}
                            className="material-icons-outlined">{!expanded ? "expand_more" : "expand_less"}</Icon>}
                    </BottomLine>
                    {expanded && meta && <ExtendedMention>
                        <Link href={url} onClick={()=>onClick(url)}>
                            <Title>{meta.title}</Title>
                        </Link>
                        <Link href={url} onClick={()=>onClick(url)}>
                            <Byline>
                                {meta.authors && <Authors>{meta.authors}</Authors>}
                                <SiteName>{meta.site_name}</SiteName>
                            </Byline>
                        </Link>
                        <HorizontalContainer>
                            <Link href={url} onClick={()=>onClick(url)}>
                                <ImageWrapper>
                                    <Image src={meta.image} alt={meta.title} />
                                </ImageWrapper>
                            </Link>
                            <Body>
                                {false && <Link href={url} onClick={()=>onClick(url)}><ArticleDigest>
                                    {true ? 'Article Digest:' : 'Short Digest:'}
                                </ArticleDigest></Link>}
                                <Digest>
                                    <Link href={url} onClick={()=>onClick(url)}>
                                        <div dangerouslySetInnerHTML={{ __html: digest }} />
                                    </Link>
                                    <ShareContainerInline>
                                        <ContentCopyIcon style={{ paddingTop: 6, marginTop: -10 }} fontSize="small" sx={{ color: digestCopied ? 'green' : '' }} onClick={() => onDigestCopyClick()} />
                                    </ShareContainerInline>

                                </Digest>
                            </Body>
                        </HorizontalContainer>
                        <Link href={url}>{meta.url.substring(0, 50)}..</Link>
                    </ExtendedMention>}
                </MentionSummary>
            </MentionWrap>
            <MobileMentionWrap hideit={hide} onMouseEnter={() => onHover('mobile')}>
                <MentionSummary>
                    <div>
                        <Topline><LocalDate><b><i>{localDate}</i></b></LocalDate>{!localFav ? noUser ? <SignInButton><StarOutlineIcon onClick={() => { if (noUser) return; enableRedirect(); setLocalFav(1); addFavorite({ findexarxid }); mutate(); }} style={{ color: "#888" }} /></SignInButton> : <StarOutlineIcon onClick={() => { if (noUser) return; setLocalFav(1); enableRedirect(); addFavorite({ findexarxid }); mutate(); }} style={{ color: "#888" }} /> : <StarIcon onClick={() => { if (noUser) return; setLocalFav(0); removeFavorite({ findexarxid }); mutate(); }} style={{ color: "FFA000" }} />}</Topline>
                        <SummaryWrap>
                            <Link scroll={linkType == 'final' ? false : true} href={localUrl} onClick={async () => { await onMentionNav(name) }} shallow>
                                {summary}
                            </Link>
                            <ShareContainerInline><ContentCopyIcon style={{ paddingTop: 6, marginBottom: -2 }} fontSize="small" sx={{ color: copied ? 'green' : '' }} onClick={() => onCopyClick()} /></ShareContainerInline>
                        </SummaryWrap>
                        <hr />
                        <Atmention><b>{(type == "person") && '@'}{name}</b> | {type == "person" ? `${teamName} |` : ""}  {league}</Atmention>
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
                            <ShareContainer><ShareIcon><IosShareIcon /></ShareIcon></ShareContainer>
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
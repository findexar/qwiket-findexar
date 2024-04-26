import React, { useEffect, useCallback, useRef } from "react";
import Link from 'next/link';
import { styled, useTheme } from "styled-components";
import { RWebShare } from "react-web-share";
import XIcon from '@mui/icons-material/X';
import FacebookIcon from '@mui/icons-material/Facebook';
import IosShareIcon from '@mui/icons-material/IosShare';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { recordEvent } from '@/lib/api';
import { convertToUTCDateString, convertToReadableLocalTime } from "@/lib/date-convert";
import useCopyToClipboard from '@/lib/copy-to-clipboard';
import MiniMention from '@/components/func-components/items/mini-mention';
import { useAppContext } from '@/lib/context';
import { useInView } from 'react-intersection-observer';
declare global {
    interface Window {
        Clerk: any;
    }
}

const Body = styled.div`
    font-size: 15px;
    margin-top:-11px;
    margin-bottom: 4px;
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
    display:flex;
    font-size: 15px;
`;

const ArticleDigest = styled.div`
    font-size: 14px;
`;

const ArticleMentionsTitle = styled.div`
    font-size: 14px;
    padding-top:4px;
    margin-left:10px;
`;

const ArticleMentions = styled.div`
    font-size: 18px;
    border: 1px dotted #ccc;
    border-radius: 5px;
    padding-top:4px;
    padding-bottom:4px;
    margin-bottom:4px;
`;

const ImageWrapper = styled.div`
    margin-top:8px;
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
    margin-top:10px;
    //margin-left:28px;
    width:100%;
    @media screen and (max-width: 1199px) {
        margin-left:-4px;
    }
`;

const LocalDate = styled.div`
    font-size: 12px;
`;

const ShareIcon = styled.div`
    margin-top:-1px;
    padding-bottom:4px;
`;

const DesktopWrap = styled.div`
    display:flex;
    flex-direction:column;
    max-width:100%;
    margin-top:20px;
    margin-bottom:20px;
    background-color:var(--mention-bg);
    padding:10px;
    a{
        font-size:15px !important;   
    }
    @media screen and (max-width: 1199px) {
        display: none;
    }
`;

const MobileWrap = styled.div`
    display:flex;
    flex-direction:column;
    width:100%;
    padding:30px;
    margin-bottom:20px;
    background-color:var(--background);
    padding:10px;
    a{
        font-size:15px !important;
    }
    @media screen and (min-width: 1200px) {
        display: none;
    }
`;

const MentionsWrap = styled.div`
    display:flex;
    flex-direction:column;
    width:100%;
    padding-right:20px;
    margin-top:6px;
    margin-bottom:6px;
    a{
        font-size:15px !important;    
    }
`;
interface Props {
    story: any;
    handleClose: () => void;
}

const Story: React.FC<Props> = ({ story, handleClose }) => {
    const { mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, team, player, teamName, setTeamName } = useAppContext();

    let { title, url, digest, site_name, image, authors, createdTime, mentions, xid, slug } = story;
    //console.log("STORY CREATED TIME", createdTime,title,site_name);
    url = url || "";
    const [localDate, setLocalDate] = React.useState(convertToUTCDateString(createdTime));
    const [digestCopied, setDigestCopied] = React.useState(false);
    const [selectedXid, setSelectedXid] = React.useState("");
    const [value, copy] = useCopyToClipboard();
    const [visible, setVisible] = React.useState(false);

    let prepDigest = digest ? digest.replaceAll('<p>', '').replaceAll('</p>', '\n\n') : "";

    const shareUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${league}?story=${slug}&utm_content=shareslink` : `${process.env.NEXT_PUBLIC_SERVER}/pub?story=${slug}&utm_content=shareslink`;
    const twitterShareUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${league}?story=${slug}&utm_content=xslink` : `${process.env.NEXT_PUBLIC_SERVER}/pub?story=${slug}&utm_content=xslink`;
    const fbShareUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/pub/league/${league}?story=${slug}&utm_content=fbslink` : `${process.env.NEXT_PUBLIC_SERVER}/pub?story=${slug}&utm_content=fbslink`;
    const twitterLink = `https://twitter.com/intent/tweet?text=${encodeURIComponent(prepDigest.substring(0, 230) + '...')}&url=${twitterShareUrl}&via=findexar`;
    const fbLink = `https://www.facebook.com/sharer.php?kid_directed_site=0&sdk=joey&u=${encodeURIComponent(fbShareUrl)}&t=${encodeURIComponent('Findexar')}&quote=${encodeURIComponent(prepDigest.substring(0, 140) + '...')}&hashtag=%23findexar&display=popup&ref=plugin&src=share_button`;
    const { ref, inView, entry } = useInView({
        /* Optional options */
        threshold: 0,
    });
    useEffect(() => {
        if (inView && !visible) {
            setVisible(true);
            recordEvent(`story-inview`, `{"slug":"${slug}","url":"${url}","params":"${params}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        }
    }, [inView]);

    useEffect(() => {
        if (!site_name) {
            recordEvent('bad-site_name', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","slug":"${slug}","url":"${shareUrl}"}`).then((r: any) => {
                console.log("recordEvent", r);
            });;
        }
    }, [site_name]);

    useEffect(() => {
        setTimeout(() => {
            setDigestCopied(false);
        }, 2000);
    }, [digestCopied]);

    useEffect(() => {
        try {
            setLocalDate(convertToReadableLocalTime(createdTime));
        }
        catch (x) {
            console.log("EXCEPTION CONVERTING DATE");
        }
    }, [createdTime])

    const onShare = useCallback((url: string) => {
        try {
            recordEvent(`story-share`, `{"url":"${url}","params":"${params}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
        }
    }, [params]);

    const onDigestCopyClick = useCallback(() => {
        setDigestCopied(true);
        copy(digest);
    }, [digest]);

    const onMentionClick = useCallback((mention: any) => {
        try {
            recordEvent(`min-mention-click`, `{"mention","${JSON.stringify(mention)}","params":"${params}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
        }
    }, []);

    const onStoryClick = useCallback(() => {
        try {
            recordEvent(`story-click`, `{"url":"${url}","story","${JSON.stringify(story)}","params":"${params}"}`)
                .then((r: any) => {
                    console.log("recordEvent", r);
                });
        } catch (x) {
            console.log('recordEvent', x);
        }
    }, []);

    const Mentions = <MentionsWrap>{mentions && mentions.map((mention: any, i: number) => {
        return (
            <MiniMention handleClose={handleClose} onClick={() => onMentionClick(mention)} key={`mention-${i}`} {...mention} params={params} tp={tp} selectedXid={selectedXid} setSelectedXid={setSelectedXid} mutate={() => { }} />
        )
    })}</MentionsWrap>;

    if (image && image.indexOf("thestar.com/content/tncms/custom/image/f84403b8-7d76-11ee-9d02-a72a4951957f.png") >= 0)
        return null;

    return (
        <div ref={ref}>
            <DesktopWrap>
                <Link href={url} onClick={onStoryClick}>
                    <Topline><LocalDate><i>{localDate}</i></LocalDate></Topline>
                    <Title>{title}</Title>
                </Link>
                <Link href={url} onClick={onStoryClick}>
                    <Byline>
                        {authors && <Authors>{authors}</Authors>}
                        <SiteName>{site_name}</SiteName>
                    </Byline>
                </Link>
                <HorizontalContainer>
                    <Link href={url} onClick={onStoryClick}>
                        <ImageWrapper>
                            {image && !(image.indexOf("thestar.com/content/tncms/custom/image/f84403b8-7d76-11ee-9d02-a72a4951957f.png") >= 0) && <Image src={image} alt={title} />}
                        </ImageWrapper>
                    </Link>
                    <Body>
                        {false && <Link href={url} onClick={onStoryClick} target="_blank"><ArticleDigest>
                            <b>{true ? 'Digest:' : 'Short Digest:'}</b>
                        </ArticleDigest></Link>}
                        <Digest>
                            <Link href={url} onClick={onStoryClick} target="_blank">
                                <div dangerouslySetInnerHTML={{ __html: digest }} />
                            </Link>
                            <ContentCopyIcon style={{ paddingTop: 6, marginTop: -10, cursor: 'pointer' }} fontSize="small" sx={{ color: digestCopied ? 'green' : '' }} onClick={() => onDigestCopyClick()} />
                        </Digest>
                    </Body>
                </HorizontalContainer>
                <ArticleMentions>
                    <ArticleMentionsTitle><b>Mentions:</b></ArticleMentionsTitle>
                    {Mentions}
                </ArticleMentions>
                <br />
                <Link style={{ marginLeft: 10 }} href={url} onClick={onStoryClick} target="_blank">{url?.substring(0, 50)}..</Link>
                <BottomLine>
                    <ShareGroup><RWebShare
                        data={{
                            text: prepDigest,
                            url: shareUrl,
                            title: `${process.env.NEXT_PUBLIC_APP_NAME}`,
                        }}
                        onClick={async () => await onShare(shareUrl)}
                    >
                        <ShareContainer><ShareIcon><IosShareIcon /></ShareIcon></ShareContainer>
                    </RWebShare>
                        <Link href={twitterLink} target="_blank"><ShareContainer><XIcon /></ShareContainer></Link>
                        <Link href={fbLink} target="_blank"><ShareContainer><FacebookIcon /></ShareContainer></Link>
                    </ShareGroup>
                </BottomLine>
            </DesktopWrap>
            <MobileWrap>
                <Topline><LocalDate><i>{localDate}</i></LocalDate></Topline>
                <Link href={url} onClick={onStoryClick}><Title>{title}</Title></Link>
                <Link href={url} onClick={onStoryClick}><Byline>
                    {authors && <Authors>{authors}</Authors>}
                    <SiteName>{site_name}</SiteName>
                </Byline>
                </Link>
                <HorizontalContainer>
                    <Link href={url} onClick={onStoryClick}>
                        <ImageWrapper>
                            <Image src={image} width={100} height={100} alt={title} />
                        </ImageWrapper>
                    </Link>
                    <Body>
                        {false && <Link onClick={onStoryClick} href={url || ""}><ArticleDigest>
                            {true ? 'Article Digest:' : 'Short Digest:'}
                        </ArticleDigest>
                        </Link>}
                        <Digest>
                            <Link href={url || ""} onClick={onStoryClick}> <div dangerouslySetInnerHTML={{ __html: digest }} /></Link>
                            <ShareContainerInline>
                                <ContentCopyIcon style={{ paddingTop: 6, marginBottom: 0, marginTop: -10 }} fontSize="small" sx={{ color: digestCopied ? 'green' : '' }} onClick={() => onDigestCopyClick()} />
                            </ShareContainerInline>
                        </Digest>
                    </Body>
                </HorizontalContainer>
                <ArticleMentions>
                    <ArticleMentionsTitle><b>Mentions:</b></ArticleMentionsTitle>
                    {Mentions}</ArticleMentions>
                <br />
                <Link href={url || ""}> {url?.substring(0, 30)}...</Link>
                <BottomLine>
                    <ShareGroup><RWebShare
                        data={{
                            text: prepDigest,
                            url: shareUrl,
                            title: `${process.env.NEXT_PUBLIC_APP_NAME}`,
                        }}
                        onClick={async () => await onShare(shareUrl)}
                    >
                        <ShareContainer><ShareIcon><IosShareIcon /></ShareIcon></ShareContainer>
                    </RWebShare>
                        <Link href={twitterLink} target="_blank"><ShareContainer><XIcon /></ShareContainer></Link>
                        <Link href={fbLink} target="_blank"><ShareContainer><FacebookIcon /></ShareContainer></Link>
                    </ShareGroup>
                </BottomLine>
            </MobileWrap>
        </div>
    );
};

export default Story;
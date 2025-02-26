import React, { useEffect, useCallback, useRef, useMemo } from "react";
import Link from 'next/link';
import { styled, useTheme } from "styled-components";
import XIcon from '@/components/icons/twitter';
//import FacebookIcon from '@/components/icons/facebook';
import IosShareIcon from '@/components/icons/share';
import ContentCopyIcon from '@/components/icons/content-copy';
import { actionRecordEvent } from "@lib/server-actions/event";
import { convertToUTCDateString, convertToReadableLocalTime } from "@/lib/date-convert";
import useCopyToClipboard from '@/lib/copy-to-clipboard';
import MiniMention from '@/components/func-components/items/mini-mention';
import { useAppContext } from '@/lib/context';
import { useInView } from 'react-intersection-observer';
import { FaFacebook as FacebookIcon, FaComments as CommentsIcon } from 'react-icons/fa';
import { LiaCommentDots } from "react-icons/lia";
import { BiCommentDots } from "react-icons/bi";
import { BiCommentAdd } from "react-icons/bi";
import CustomImage from '@/components/util-components/custom-image';
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
        font-size:15px;    
    }
`;

const Title = styled.div`
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 10px;
    text-align:left;
`;

const Digest = styled.div`
    display:flex;
    flex-direction:column;
    font-size: 15px;
    p {
        margin-top: 4px ;
        padding-bottom: 4px;
    }
    h2 {
        margin-top: 10px ;
        padding-bottom: 4px;
        font-size: 20px;
        font-weight: bold;
    }
    h3 {
        margin-top: 4px ;
        padding-bottom: 4px;
        font-size: 18px;
        font-weight: bold;
    }
`;

const ArticleDigest = styled.div`
    font-size: 14px;
`;

const ArticleMentionsTitle = styled.div`
    font-size: 14px;
    padding-top:4px;
    margin-left:4px;
`;

const ArticleMentions = styled.div`
    font-size: 18px;
    border: 1px dotted #ccc;
    border-radius: 5px;
    padding-top:4px;
    padding-bottom:4px;
    margin-bottom:4px;
    margin-top:8px;
`;

const ImageWrapper = styled.div`
    margin-top:8px;
    flex: 1 1 auto;
    max-width: 100%;
    width:100%;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
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
    margin-left: auto;
    margin-right: auto;
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
    width:100%;
    a{
        font-size:15px;     
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
    padding-bottom:1px;
    font-size:16px;
`;

const DesktopWrap = styled.div`
    display:flex;
    flex-direction:column;
    max-width:100%;
    background-color:var(--background);
   
    padding:10px;
    a{
        font-size:15px;   
    }
    @media screen and (max-width: 1024px) {
        display: none;
    }
`;

const MobileWrap = styled.div`
    display:flex;
    flex-direction:column;
    width:100%;
    padding:30px;
   // margin-bottom:20px;
    background-color:var(--background);
    padding:10px;
    a{
        font-size:15px;
    }
    @media screen and (min-width: 1024px) {
        display: none;
    }
`;

const MentionsWrap = styled.div`
    display:flex;
    flex-direction:column;
    width:100%;
    margin-top:6px;
    margin-bottom:6px;
    a{
        font-size:15px;    
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
  background-color: ${props => props.$isDarkMode ? '#1D4037' : '#CFE0C2'};
  color: ${props => props.$isDarkMode ? '#E0E0E0' : '#4E342E'};
  padding: 2px 10px;
  border-radius: 16px;
  font-size: 10px;
  text-decoration: none;
  transition: background-color 0.3s ease, color 0.3s ease;
  
  &:hover {
    background-color: ${props => props.$isDarkMode ? '#795548' : '#FFCCBC'};
    color: ${props => props.$isDarkMode ? '#FFFFFF' : '#3E2723'};
  }

  .ask-ai {
    opacity: 0.6;
    font-size: 9px;
    margin-left: 4px;
  }
`;

interface Props {
    story: any;
    handleClose: () => void;
}

const Story: React.FC<Props> = ({ story, handleClose }) => {
    const { isMobile, mode, fbclid, utm_content, params, tp, league, player, userAccount, bot, teamid, athleteUUId, m } = useAppContext();
    const isDarkMode = mode === 'dark';

    let { title, url, digest, site_name, image, image_width, image_height, authors, createdTime, mentions, xid, slug, prompts } = story || {};
    url = url || "";
    const [localDate, setLocalDate] = React.useState(convertToUTCDateString(createdTime));
    const [digestCopied, setDigestCopied] = React.useState(false);
    const [selectedXid, setSelectedXid] = React.useState("");
    const [value, copy] = useCopyToClipboard();
    const [visible, setVisible] = React.useState(false);
    const [loading, setLoading] = React.useState(false);
    const isCid = useMemo(() => {
        return userAccount?.cid && userAccount?.cid.length > 0;
    }, [userAccount]);
    //console.log("==> STORY.TSX", { title });
    const prepDigest = useMemo(() => {
        return digest ? digest.replaceAll('<p>', '').replaceAll('</p>', '\n\n') : "";
    }, [digest]);

    const shareUrls = useMemo(() => {
        const baseUrl = `${process.env.NEXT_PUBLIC_SERVER}${league ? `/${league}` : ''}?cstory=${slug}`;
        const cidParam = isCid ? `&aid=${userAccount.cid}` : '';
        return {
            share: `${baseUrl}&utm_content=shareslink${cidParam}`,
            twitter: `${baseUrl}&utm_content=xslink${cidParam}`,
            facebook: `${baseUrl}&utm_content=fbslink${cidParam}`,
        };
    }, [league, slug, isCid, userAccount]);

    const socialLinks = useMemo(() => {
        return {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(prepDigest.substring(0, 230) + '...')}&url=${shareUrls.twitter}&via=findexar`,
            facebook: `https://www.facebook.com/sharer.php?kid_directed_site=0&sdk=joey&u=${encodeURIComponent(shareUrls.facebook)}&t=${encodeURIComponent('Findexar')}&quote=${encodeURIComponent(prepDigest.substring(0, 140) + '...')}&hashtag=%23findexar&display=popup&ref=plugin&src=share_button`,
        };
    }, [prepDigest, shareUrls]);

    const { ref, inView, entry } = useInView({
        /* Optional options */
        threshold: 0,
    });

    useEffect(() => {
        if (inView && !visible) {
            setVisible(true);
            if (!bot) {
                actionRecordEvent(`story-inview`, `{"utm_content":"${utm_content}","slug":"${slug}","url":"${url}","params":"${params}"}`)
                    .then((r: any) => {
                        //console.log("recordEvent", r);
                    });
            }
        }
    }, [inView]);

    useEffect(() => {
        if (!site_name) {
            if (!bot) {
                actionRecordEvent('bad-site_name', `{"fbclid":"${fbclid}","utm_content":"${utm_content}","slug":"${slug}","url":"${url}"}`).then((r: any) => {
                    //console.log("recordEvent", r);
                });;
            }
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
        if (navigator.share) {
            navigator.share({
                title: `${process.env.NEXT_PUBLIC_APP_NAME}`,
                text: prepDigest,
                url: url,
            });
        }

        if (!bot) {
            try {
                actionRecordEvent(`story-share`, `{"url":"${url}","params":"${params}"}`)
                    .then((r: any) => {
                        //console.log("recordEvent", r);
                    });
            } catch (x) {
                console.log('recordEvent', x);
            }
        }
    }, [params]);

    const onDigestCopyClick = useCallback(() => {
        setDigestCopied(true);
        copy(digest);
    }, [digest]);

    const onMentionClick = useCallback((mention: any) => {
        if (!bot) {
            try {
                actionRecordEvent(`mini-mention-click`, `{"mention","${JSON.stringify(mention)}","params":"${params}"}`)
                    .then((r: any) => {
                        //console.log("recordEvent", r);
                    });
            } catch (x) {
                console.log('recordEvent', x);
            }
        }
    }, []);

    const onStoryClick = useCallback(() => {
        if (!bot) {
            try {
                actionRecordEvent(`story-click`, `{"url":"${url}","story","${JSON.stringify(story)}","params":"${params}"}`)
                    .then((r: any) => {
                        //console.log("recordEvent", r);
                    });
            } catch (x) {
                console.log('recordEvent', x);
            }
        }
    }, []);

    const renderPrompts = (device: string) => {
        if (!prompts || prompts.length === 0) return null;
        const param = "?tab=chat";
        return (
            <PromptsContainer>
                {prompts.map((p: any, index: number) => (
                    <PromptTag
                        key={`prompt-${index}`}
                        href={`/${p.league}${teamid ? `/${teamid}` : ''}${player ? `/${player}` : ''}${athleteUUId ? `/${athleteUUId}` : ''}${param}&prompt=${encodeURIComponent(p.prompt)}&promptUUId=${p.promptUUId}`}
                        $isDarkMode={isDarkMode}
                        onClick={() => setLoading(true)}
                        scroll={true}
                    >
                        {p.prompt}
                    </PromptTag>
                ))}
            </PromptsContainer>
        );
    };

    const Mentions = useMemo(() => (
        <MentionsWrap>
            {mentions && mentions.map((mention: any, i: number) => (
                <MiniMention
                    handleClose={handleClose}
                    onClick={() => onMentionClick(mention)}
                    key={`mention-${mention.findexarxid}`}
                    {...mention}
                    params={params}
                    tp={tp}
                    selectedXid={selectedXid}
                    setSelectedXid={setSelectedXid}
                    mutate={() => { }}
                    bot={bot}
                    startExtended={mention.open || false}
                />
            ))}
        </MentionsWrap>
    ), [mentions, handleClose, onMentionClick, params, tp, selectedXid]);

    // if (image && image.indexOf("thestar.com/content/tncms/custom/image/f84403b8-7d76-11ee-9d02-a72a4951957f.png") >= 0)
    //    return null;
    // console.log("==> STORY.TSX RENDER", { title });
    return (
        <>
            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-4 border-white border-opacity-30 border-t-white"></div>
                </div>
            )}
            <div ref={ref}>
                {!isMobile && <DesktopWrap>
                    <Link href={url} scroll={false} onClick={onStoryClick}>
                        <Topline><LocalDate><i>{localDate}</i></LocalDate></Topline>
                        <Title>{title}</Title>
                    </Link>
                    <Link href={url} scroll={false} onClick={onStoryClick}>
                        <Byline>
                            {authors && <Authors>{authors}</Authors>}
                            <SiteName>{site_name}</SiteName>
                        </Byline>
                    </Link>
                    <HorizontalContainer>

                        <ImageWrapper>
                            <Link href={url} scroll={false} onClick={onStoryClick}>
                                {image && !(image.indexOf("thestar.com/content/tncms/custom/image/f84403b8-7d76-11ee-9d02-a72a4951957f.png") >= 0) &&
                                    <img
                                        src={image}
                                        alt={title}
                                        width={image_width}
                                        height={image_height}

                                    />
                                }
                            </Link>
                        </ImageWrapper>

                        <Body>
                            {false && <Link href={url} onClick={onStoryClick} target="_blank"><ArticleDigest>
                                <b>{true ? 'Digest:' : 'Short Digest:'}</b>
                            </ArticleDigest></Link>}
                            <Digest>
                                <Link href={url} scroll={false} onClick={onStoryClick} target="_blank">
                                    <div dangerouslySetInnerHTML={{ __html: digest }} />
                                </Link>
                                <div className="flex flex-row justify-center mt-2 mb-2">
                                    <ContentCopyIcon className={digestCopied ? "cursor-pointer text-green-500 w-10" : "cursor-pointer w-10"} fontSize="medium" onClick={() => onDigestCopyClick()} />

                                    <BiCommentDots className="cursor-pointer w-10" fontSize="large" onClick={() => onDigestCopyClick()} />
                                    <BiCommentAdd className="cursor-pointer w-10" fontSize="large" onClick={() => onDigestCopyClick()} />


                                </div>
                            </Digest>
                        </Body>
                    </HorizontalContainer>
                    {renderPrompts("desktop")}
                    <ArticleMentions>
                        <ArticleMentionsTitle><b>Mentions:</b></ArticleMentionsTitle>
                        {Mentions}
                    </ArticleMentions>
                    <br />
                    <Link style={{ marginLeft: 10 }} href={url} onClick={onStoryClick} target="_blank">{url?.substring(0, 50)}..</Link>
                    <BottomLine>
                        <ShareGroup>
                            <ShareContainer onClick={async () => onShare(shareUrls.share)}>
                                <ShareIcon><IosShareIcon style={{ fontSize: 16 }} /></ShareIcon>
                            </ShareContainer>
                            <Link href={socialLinks.facebook} target="_blank">
                                <ShareContainer><FacebookIcon /></ShareContainer>
                            </Link>
                            <Link href={socialLinks.twitter} target="_blank">
                                <ShareContainer><XIcon /></ShareContainer>
                            </Link>
                        </ShareGroup>
                    </BottomLine>
                    <hr className="border-0 h-px bg-slate-900 dark:bg-slate-400" />
                </DesktopWrap>}
                {isMobile && <MobileWrap>
                    <Topline><LocalDate><i>{localDate}</i></LocalDate></Topline>
                    <Link href={url} scroll={false} onClick={onStoryClick}><Title>{title}</Title></Link>
                    <Link href={url} scroll={false} onClick={onStoryClick}><Byline>
                        {authors && <Authors>{authors}</Authors>}
                        <SiteName>{site_name}</SiteName>
                    </Byline>
                    </Link>
                    <HorizontalContainer>
                        <Link href={url} scroll={false} onClick={onStoryClick}>
                            <ImageWrapper>
                                <img
                                    src={image}
                                    alt={title}
                                    width={image_width}
                                    height={image_height}

                                />
                            </ImageWrapper>
                        </Link>
                        <Body>

                            <Digest>
                                <Link href={url || ""} scroll={false} onClick={onStoryClick}> <div dangerouslySetInnerHTML={{ __html: digest }} /></Link>
                                <ShareContainerInline>
                                    <ContentCopyIcon style={{ paddingTop: 0, marginBottom: 0, color: digestCopied ? 'green' : '' }} fontSize="medium" onClick={() => onDigestCopyClick()} />
                                </ShareContainerInline>
                            </Digest>
                        </Body>
                    </HorizontalContainer>
                    {renderPrompts("mobile")}
                    <ArticleMentions>
                        <ArticleMentionsTitle><b>Mentions:</b></ArticleMentionsTitle>
                        {Mentions}</ArticleMentions>
                    <br />
                    <Link href={url || ""} scroll={false} onClick={onStoryClick}> {url?.substring(0, 30)}...</Link>
                    <BottomLine>
                        <ShareGroup>
                            <ShareContainer onClick={async () => await onShare(shareUrls.share)}>
                                <ShareIcon><IosShareIcon /></ShareIcon>
                            </ShareContainer>
                            <Link href={socialLinks.facebook} target="_blank">
                                <ShareContainer><FacebookIcon /></ShareContainer>
                            </Link>
                            <Link href={socialLinks.twitter} target="_blank">
                                <ShareContainer><XIcon /></ShareContainer>
                            </Link>
                        </ShareGroup>
                    </BottomLine>
                    <hr />
                </MobileWrap>}
            </div>
        </>
    );
};

export default Story;

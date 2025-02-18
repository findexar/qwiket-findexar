import React, { ReactNode, Suspense, useCallback } from 'react';
import { styled } from 'styled-components';
import { getAllArticles } from "@/lib/contentful-api";
import Image from 'next/image';
import Link from 'next/link';
import { actionFetchBlogArticle } from "@/lib/server-actions/blog";
import { BlogArticlesKey } from "@/lib/keys";
import useSWRInfinite from 'swr/infinite';
import { useAppContext } from '@lib/context';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { MarkdownComponents } from '@components/shared/markdown-components';

import useSWR from 'swr';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import IosShareIcon from '@/components/icons/share';
import { FaFacebook as FacebookIcon, FaComments as CommentsIcon } from 'react-icons/fa';
import { useMemo } from 'react';
import XIcon from '@/components/icons/twitter';
const ShareGroup = styled.div`
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    align-items:flex-start;
    width:78px;
    height:40px;
    margin-top:10px;
`;
const ShareIcon = styled.div`
    margin-top:-1px;
    padding-bottom:1px;
    font-size:16px;
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

const WelcomeWrap = styled.div`
    paddWelcomeWraping-top:18px;
    padding-right:40px;
    width:100%;
    a{
        text-decoration: none;
        &:hover{
            color:var(--highlight);
        }
    }
    p{
        margin-top:10px;
        margin-bottom:10px;
        margin-right:10px;
    }
    @media screen and (max-width: 1200px) {
        padding-right:30px;
    }
    th{
        background-color: var(--background-highlight);
        color:red;
       // margin:30px;
        padding:10px;
    }
    td{
        //margin:30px;
        padding:10px;
    }
    blockquote{
        background-color: green;
        color:white;
        padding:10px;
    }
`;

const Container = ({ children }: { children: ReactNode }) => (
    <div className="p-5 bg-background text-text pb-[100vw]">
        {children}
    </div>
);

const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
};

const Readme = () => {
    let { relatedContent, slug, fallback, cstory, prompt, promptUUId, mode, isMobile, setLeague, setView, setPagetype, setPlayer, setMode, fbclid, params, tp, league, pagetype, teamid, player, teamName, setTeamName, athleteUUId, userAccount, userAccountMutate, user, utm_content, bot, feedback, setFeedback, setCstory, setCm } = useAppContext();

    const fetchBlogArticleKey = { type: "fetch-blog-article", slug: cstory };
    console.log("BlogArticle ==> fetchBlogArticleKey", fetchBlogArticleKey);
    const { data: article, mutate, isLoading } = useSWR(
        fetchBlogArticleKey,
        actionFetchBlogArticle,
        { fallback }
    );
    console.log("====>article", article);
    const { title, articleImage, authorName, date, details, markdown } = article;
    const { json, links } = article;
    const content = documentToReactComponents(json, renderOptions(links));
    console.log("slug", cstory)
    const formattedDate = formatDate(article?.date);

    function renderOptions(links: any) {
        // create an asset map
        const assetMap = new Map();
        // loop through the assets and add them to the map
        if (links?.assets?.block) {
            for (const asset of links?.assets?.block) {
                assetMap.set(asset.sys.id, asset);
            }
        }

        // create an entry map
        const entryMap = new Map();
        // loop through the block linked entries and add them to the map
        if (links?.entries?.block) {
            for (const entry of links?.entries?.block) {
                entryMap.set(entry.sys.id, entry);
            }
        }

        // loop through the inline linked entries and add them to the map
        if (links?.entries?.inline) {
            for (const entry of links?.entries?.inline) {
                entryMap.set(entry.sys.id, entry);
            }
        }

        return {
            // other options...

            renderNode: {
                // other options...
                [INLINES.EMBEDDED_ENTRY]: (node: any, children: any) => {
                    // find the entry in the entryMap by ID
                    const entry = entryMap.get(node.data.target.sys.id);

                    // render the entries as needed
                    if (entry.__typename === "BlogPost") {
                        return <a href={`/blog/${entry.slug}`}>{entry.title}</a>;
                    }
                },
                [BLOCKS.EMBEDDED_ENTRY]: (node: any, children: any) => {
                    // find the entry in the entryMap by ID
                    const entry = entryMap.get(node.data.target.sys.id);

                    // render the entries as needed by looking at the __typename 
                    // referenced in the GraphQL query
                    if (entry.__typename === "CodeBlock") {
                        return (
                            <pre>
                                <code>{entry.code}</code>
                            </pre>
                        );
                    }

                    if (entry.__typename === "VideoEmbed") {
                        return (
                            <iframe
                                src={entry.embedUrl}
                                height="100%"
                                width="100%"
                                frameBorder="0"
                                scrolling="no"
                                title={entry.title}
                                allowFullScreen={true}
                            />
                        );
                    }

                },
                [BLOCKS.EMBEDDED_ASSET]: (node: any, next: any) => {
                    // find the asset in the assetMap by ID
                    const asset = assetMap.get(node.data.target.sys.id);

                    // render the asset accordingly
                    return (
                        <img src={asset.url} alt="My image alt text" />
                    );
                },
            },
        };
    }
    const shareUrls = useMemo(() => {
        const baseUrl = `${process.env.NEXT_PUBLIC_SERVER}?tab=blog&cstory=${cstory}`;
        // const cidParam = isCid ? `&aid=${userAccount.cid}` : '';
        return {
            share: `${baseUrl}&utm_content=bloglink`,
            twitter: `${baseUrl}&utm_content=xslink`,
            facebook: `${baseUrl}&utm_content=fbslink`,
        };
    }, [cstory]);

    const socialLinks = useMemo(() => {
        return {
            twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(article.summary.substring(0, 230) + '...')}&url=${shareUrls.twitter}&via=findexar`,
            facebook: `https://www.facebook.com/sharer.php?kid_directed_site=0&sdk=joey&u=${encodeURIComponent(shareUrls.facebook)}&t=${encodeURIComponent('Findexar')}&quote=${encodeURIComponent(article.summary.substring(0, 140) + '...')}&hashtag=%23findexar&display=popup&ref=plugin&src=share_button`,
        };
    }, [article, shareUrls]);

    const onShare = useCallback((url: string) => {
        if (navigator.share) {
            navigator.share({
                title: `${process.env.NEXT_PUBLIC_APP_NAME}`,
                text: article.summary,
                url: url,
            });
        }

        if (!bot) {
            try {
                actionRecordEvent(`blog-share`, `{"url":"${url}","params":"${params}"}`)
                    .then((r: any) => {
                        //console.log("recordEvent", r);
                    });
            } catch (x) {
                console.log('recordEvent', x);
            }
        }
    }, [article]);


    console.log("markdown", markdown)
    return (
        <Container>
            <WelcomeWrap className="text-left">
                <Suspense fallback={<div>Loading...</div>}>
                    <main className="flex min-h-screen flex-col items-center justify-between p-2">
                        <article className="w-full pt-2">
                            <h1 className="text-3xl font-bold mb-4 ">{article?.title}</h1>
                            <img src={article?.articleImage.url} alt={article?.title} width="100%" />
                            <p className="text-sm text-gray-800 dark:text-gray-200 mt-4">by {article?.authorName} on {formattedDate}</p>
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                                {markdown || ''}
                            </ReactMarkdown>

                            <hr className="my-8" />
                            <p className="text-sm text-gray-800 dark:text-gray-200">Copyright &#169; 2024, 2025 Qwiket AI <br />Made in Minnesota. L&apos;Étoile du Nord.</p>

                        </article>
                        <BottomLine>
                            <ShareGroup>
                                <ShareContainer onClick={async () => onShare(shareUrls.share)}>
                                    <ShareIcon><IosShareIcon style={{ fontSize: 17 }} /></ShareIcon>
                                </ShareContainer>
                                <Link href={socialLinks.facebook} target="_blank">
                                    <ShareContainer><FacebookIcon /></ShareContainer>
                                </Link>
                                <Link href={socialLinks.twitter} target="_blank">
                                    <ShareContainer><XIcon /></ShareContainer>
                                </Link>
                            </ShareGroup>
                        </BottomLine>
                    </main>
                </Suspense>
            </WelcomeWrap>
        </Container >
    )
}

export default Readme;


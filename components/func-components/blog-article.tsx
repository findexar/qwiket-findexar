import React, { ReactNode, Suspense } from 'react';
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
                    </main>
                </Suspense>
            </WelcomeWrap>
        </Container >
    )
}

export default Readme;


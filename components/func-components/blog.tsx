import React, { ReactNode } from 'react';
import { styled } from 'styled-components';
import { getAllArticles } from "@/lib/contentful-api";
import Image from 'next/image';
import Link from 'next/link';
import { actionFetchBlogArticles } from "@/lib/server-actions/blog";
import { BlogArticlesKey } from "@/lib/keys";
import useSWRInfinite from 'swr/infinite';
import { useAppContext } from '@lib/context';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
`;

const Container = ({ children }: { children: ReactNode }) => (
    <div className="p-5 bg-background text-text pb-[100vw]">
        {children}
    </div>
);

const Readme = () => {
    let { relatedContent, slug, fallback, b, prompt, promptUUId, mode, isMobile, setLeague, setView, setPagetype, setPlayer, setMode, fbclid, params, tp, league, pagetype, teamid, player, teamName, setTeamName, athleteUUId, userAccount, userAccountMutate, user, utm_content, bot, feedback, setFeedback, setB, setCm } = useAppContext();

    const fetchBlogArticlesKey = (pageIndex: number, previousPageData: any): BlogArticlesKey | null => {
        let key: BlogArticlesKey = { type: `fetch-blog-articles`, page: pageIndex };
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    };
    console.log("BlogArticles ==> fetchBlogArticlesKey", fetchBlogArticlesKey(0, null));
    const { data, mutate, size, setSize, isLoading } = useSWRInfinite(
        fetchBlogArticlesKey,
        actionFetchBlogArticles,
        { initialSize: 1, revalidateAll: true, parallel: true, fallback }
    );

    let articles = data ? [].concat(...data) : [];
    //console.log("slug", cstory)
    return (
        <Container>
            <WelcomeWrap className="text-left">

                <main className="flex min-h-screen flex-col items-center justify-between p-2">
                    <section className="w-full pt-0">
                        <div className="mx-auto container space-y-12 px-0 md:px-0">
                            <div className="flex flex-col items-center justify-center space-y-4 text-left">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                                        The Founders Blog
                                    </h1>
                                    <p className="max-w-[900px] text-zinc-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-zinc-400">
                                        Discover our latest articles and stay up to date with Qwiket AI updates, thoughts on fantasy sports future and technology.
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-12 w-full">
                                <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1 w-full">
                                    {articles.map((article: any) => {
                                        const link = `/${league ? `${league}/` : ''}?tab=blog&b=${article.slug}`;
                                        return (
                                            <article key={article.sys.id} className="h-full flex flex-col rounded-lg shadow-lg overflow-hidden">
                                                <img
                                                    alt="placeholder"
                                                    className="aspect-[4/3] object-cover w-full"
                                                    height="263"
                                                    src={article.articleImage.url}
                                                    width="350"
                                                />
                                                <div className="flex-1 p-6">
                                                    <Link href={link}>
                                                        <h3 className="text-2xl font-bold leading-tight text-zinc-900 dark:text-zinc-50  py-4">
                                                            {article.title}
                                                        </h3>
                                                    </Link>

                                                    <p className="max-w-none text-zinc-500 mt-4 mb-2 text-sm dark:text-zinc-400">
                                                        {article.summary}
                                                    </p>
                                                    <p className="max-w-none text-zinc-600 mt-2 mb-2 text-sm font-bold dark:text-zinc-400">
                                                        By: {article.authorName}
                                                    </p>
                                                    <div className="inline-block rounded-full px-0 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-400">
                                                        {article.categoryName}
                                                    </div>
                                                    <div className="flex justify-end">
                                                        <Link
                                                            className="inline-flex h-10 items-center justify-center text-sm font-medium"
                                                            href={link}
                                                        >
                                                            Read More →
                                                        </Link>
                                                    </div>
                                                </div>
                                            </article>)
                                    })}
                                </div>
                            </div>
                        </div>
                    </section>
                </main>                <hr />Copyright &#169; 2024,2025 Qwiket AI <br />Made in Minnesota. L&apos;Étoile du Nord.
            </WelcomeWrap>
        </Container >
    )
}

export default Readme;


'use server';
import { headers } from "next/headers";
import { unstable_serialize } from 'swr'
import { auth, currentUser } from "@clerk/nextjs/server";
import { SWRProvider } from '@/app/swr-provider'

import fetchLeagues from '@lib/server-actions/leagues';
import fetchSession from '@lib/server-actions/session';
import fetchSlugStory from '@lib/server-actions/slug-story';
import fetchMention from '@lib/server-actions/mention';
import fetchMetaLink, { promiseGetPlayerPhoto } from '@lib/server-actions/meta-link';

import fetchLeagueTeams from '@lib/server-actions/league-teams';
import fetchPlayerMentions from '@lib/server-actions/player-mentions';
import fetchTeamPlayers, { actionGetTeamName } from '@lib/server-actions/team-players';
import fetchStories from '@lib/server-actions/stories';
import { getASlugStory } from '@lib/server-actions/slug-story';
import { isbot } from '@/lib/is-bot'
import SPALayout from '@/components/spa';
import { getAMention } from '@lib/server-actions/mention';
import fetchData from '@lib/server-actions/fetch-data';
import type { Metadata, ResolvingMetadata } from 'next'
import fetchChat, { actionGetPromptPage, promiseGetPromptPage, promisePromptChatResponse, ssrPromptChatResponse } from "@lib/server-actions/chat";
import fetchUserAccount from "@lib/server-actions/account";
import { notFound } from 'next/navigation';
import fetchLeagueMentions from '@lib/server-actions/league-mentions';
import fetchTeamMentions from '@lib/server-actions/team-mentions';
import fetchMyTeam from '@lib/server-actions/my-team-actions';
import fetchMyFeed from '@lib/server-actions/myfeed';
import fetchFavorites from '@lib/server-actions/favorites';
import type { Article, WithContext } from 'schema-dts';
import { RelatedContent } from './types/chat';
import { PromptPageKey } from "./keys";
import { BlogArticleKey } from "./keys";
import { actionRecordEvent } from "@lib/server-actions/event";

import promiseFetchBlogArticle, { promiseFetchBlogArticles, actionFetchBlogArticle } from "./server-actions/blog";
export type SSRParams = {
    leagueid?: string;
    teamid?: string;
    name?: string;
    athleteUUId?: string;
}
export type SSRSearchParams = {
    fbclid?: string;
    utm_content?: string;
    view?: string;
    tab?: string;
    rtab?: string;
    id?: string;
    story?: string;
    m?: string;
    cstory?: string;    //comments story
    cm?: string;        //comments mention
    cid?: string;       //creator id
    aid?: string;       //invited author id
    prompt?: string;
    promptUUId?: string;
    page?: string;
}
export type ssrResult = {
    today: Date;
    userInfo: { email: string };
    dark: number;
    view: string;
    tab: string;
    rtab: string;
    fallback: { [key: string]: any };
    fbclid: string;
    utm_content: string;
    bot: boolean;
    isMobile: boolean;
    story: string;
    findexarxid: string;
    m: string;
    cstory: string;
    cm: string;
    league: string;
    pagetype: string;
    teamid: string;
    name: string;
    athleteUUId: string;
    teamName: string;
    ua: string;
    prompt: string;
    promptUUId: string;
    jsonld: string[];
    page: string;
    relatedContent: RelatedContent | null;
}
export const ssrPrepParams = async (params: SSRParams, searchParams: SSRSearchParams): Promise<ssrResult> => {
    let { leagueid = "", teamid = "", name = "", athleteUUId = "" } = params;
    let { page = "", prompt = "", promptUUId = "", tab = "", rtab = "", fbclid = "", utm_content = "", view = "", id = "", story = "", m = "", cstory = "", cm = "", cid = "", aid = "" }:
        SSRSearchParams = searchParams as any;
    console.log("********** ssrPrepParams", JSON.stringify({ params, searchParams }));
    const t1 = new Date().getTime();
    let headerslist = await headers();
    const ua = headerslist.get('user-agent') || "";

    const botInfo = isbot({ ua });
    let bot = botInfo.bot || ua.match(/vercel|spider|crawl|curl|Googlebot/i);
    if (!ua) {
        bot = true;
    }
    if (bot) {
        await actionRecordEvent("bot-ssr", `{"utm_content":"${utm_content}","params":"${params}","ua":"${ua || ""}"}`)
    }
    let userId = "";
    try {
        let { userId: authId } = !bot ? await auth() : { userId: "" };
        userId = authId || "";
    } catch (x) {
        console.log("error fetching userId", x);
    }

    if (!userId) {
        userId = "";
    }
    //  console.log("===============>SSR userId", userId);
    let sessionid = "";
    let dark = 0;
    try {
        const session = await fetchSession();
        console.log("fetchSession============>", JSON.stringify(session))
        sessionid = session.sessionid;
        dark = session.dark;
    }
    catch (x) {
        console.log("error fetching sessionid", x);
    }
    let findexarxid = id || "";
    let pagetype = athleteUUId ? "player" : teamid ? "team" : "league";
    let league = leagueid.toUpperCase();
    if (league && !['NFL', 'MLB', 'NBA', 'NHL', ''].includes(league.toUpperCase())) {
        console.log("==> SSR PAGE.TSX FOUND invalid league");
        notFound();
    }
    name = name.replaceAll('_', ' ').replaceAll('%20', ' ').replace('!', '.');;

    let isMobile = Boolean(ua.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    ))
    view = view.toLowerCase();
    if (view == '' || view == 'main' || view == 'feed' || view == 'home')
        view = 'mentions';
    let calls: { key: any, call: Promise<any> }[] = [];

    /**
     * Fill an array of fetch promises for parallel execution
     * note: view - only on mobile, tab - on both
     * 
     */
    if (league)
        calls.push(await fetchLeagueTeams({ league }));

    let userInfo: { email: string } = { email: "" };
    if (userId) {
        const user = await currentUser();
        const email = user?.emailAddresses[0]?.emailAddress;
        userInfo.email = email || '';
    }
    if (sessionid) {
        calls.push(await fetchUserAccount({ type: "user-account", email: userInfo.email || '', bot: bot || false }, userId, sessionid, utm_content, ua, cid, aid));
    }


    if (findexarxid) {  // if a mention story is opened
        calls.push(await fetchMention({ type: "AMention", findexarxid }));
        calls.push(await fetchMetaLink({ func: "meta", findexarxid, long: 1 }));
    }
    if ((story || cstory) && tab != 'blog') { // if a digest story is opened
        calls.push(await fetchSlugStory({ type: "ASlugStory", slug: story || cstory }));
    }
    if (m || cm) {
        calls.push(await fetchSlugStory({ type: "ASlugStory", slug: m || cm }));
    }
    //  if (!story && !findexarxid && !m)
    if (teamid)
        calls.push(await fetchTeamPlayers({ userId, sessionid, teamid }));

    if (tab == 'chat') {
        calls.push(await fetchChat({ promptUUId, email: userInfo.email, type: "create-chat", league: league.toUpperCase(), teamid, athleteUUId, fantasyTeam: false, chatUUId: "" }, userId, sessionid));
    }
    // console.log("==> testing SSR PROMPT CHAT ADD fetch", tab, promptUUId, prompt);

    if (view == 'mentions' && tab != 'myfeed' && tab != 'fav') {
        if (!story && !findexarxid && !cstory) {
            // console.log("**********fetchStories", userId, sessionid, league);
            calls.push(await fetchStories({ userId, sessionid, league, teamid, athleteUUId, type: tab == 'podcasts' ? 'v' : '' }));

            //calls.push(await fetchStories({ userId, sessionid, league }));
        }
    }
    if ((!rtab && !teamid && !athleteUUId || tab == 'mentions')) {
        if (!teamid && !athleteUUId)
            calls.push(await fetchLeagueMentions({ userId, sessionid, league }));
        else if (teamid && !athleteUUId)
            calls.push(await fetchTeamMentions({ userId, sessionid, league, teamid }));
        else if (teamid && athleteUUId)
            calls.push(await fetchPlayerMentions({ userId, sessionid, league, teamid, name, athleteUUId }));
    }
    if (!teamid && !athleteUUId && (tab == 'myteam' || view == 'my team')) {
        calls.push(await fetchMyTeam({ userId, sessionid, league }));
    }
    if (tab == 'myfeed' || (rtab == 'myfeed')) {
        console.log("********** fetchMyFeed", userId, sessionid, league);
        calls.push(await fetchMyFeed({ userId, sessionid, league }));
    }
    if (tab == 'fav' || rtab == 'fav') {
        console.log("********** fetchFav", userId, sessionid, league);
        calls.push(await fetchFavorites({ userId, sessionid, league }));
    }
    if (teamid && athleteUUId) {
        console.log("********** fetchPlayerPhoto", name, teamid);
        calls.push(await promiseGetPlayerPhoto({ name, teamid }));
    }
    let articleStructuredData: WithContext<Article> | undefined = undefined;
    //  let promptResponse: { prompt: string, response: string, slug: string, image: string, image_width: number, image_height: number, publishedTime: string } | null = null;
    let relatedContent: RelatedContent | null = null;
    let fallback: { [key: string]: any } = {}; // Add index signature

    let jsonld: string[] = [];
    if (tab == 'blog') {
        if (cstory) {
            const blogArticleKey: BlogArticleKey = { type: "fetch-blog-article", slug: cstory };
            const blogArticle = await actionFetchBlogArticle(blogArticleKey);
            fallback[unstable_serialize(blogArticleKey)] = blogArticle;
            articleStructuredData = {
                '@context': 'https://schema.org',
                '@type': 'Article',
                '@id': `${process.env.NEXT_PUBLIC_SERVER}/tab=blog&cstory=${cstory}`,
                headline: blogArticle.title,
                image: blogArticle.articleImage.url,
                description: blogArticle.summary,
                dateCreated: blogArticle.date,
                datePublished: blogArticle.date,
                author: blogArticle.authorName,
                publisher: 'QwiketAI',
                articleBody: blogArticle.markdown,
            }
            jsonld.push(JSON.stringify(articleStructuredData));
        }
        else {
            calls.push(await promiseFetchBlogArticles({ type: "fetch-blog-articles", page: 0 }));
        }
    }

    let response;
    let promptChatKey;
    if (promptUUId && tab == 'chat') {
        response = await ssrPromptChatResponse(promptUUId);
        if (response) {
            relatedContent = response;
            promptChatKey = { type: "prompt-chat", promptUUId };
            console.log("==> SSR PROMPT CHAT IMMEDIATE RESPONSE", response);
            const { prompt, response: responseText, slug, image, image_width, image_height, publishedTime, title, digest } = response || {};
            // calls.push(await promisePromptChatResponse(userId, sessionid, promptUUId, prompt));
            // const promptChatKey = { type: "prompt-chat", promptUUId };
            // promptResponse = { prompt, response: responseText, slug, image, image_width, image_height, publishedTime };
            // Update expiryDate to be publishedTime + 1 week
            //  console.log("==> SSR PROMPT CHAT RELATED CONTENT", JSON.stringify({ prompt, response: responseText, slug, image, image_width, image_height, publishedTime, title, digest }));
            // console.log("==> SSR PROMPT CHAT PUBLISHED TIME", publishedTime);
            const expiryDate = publishedTime ? new Date(publishedTime) : new Date();
            // console.log("==> SSR PROMPT CHAT EXPIRY DATE", expiryDate);
            expiryDate.setDate(expiryDate.getDate() + 1); // Add 7 days
            articleStructuredData = {
                '@context': 'https://schema.org',
                '@type': 'Article',
                '@id': `${process.env.NEXT_PUBLIC_SERVER} /${leagueid}/${teamid} /${athleteUUId ? `${athleteUUId}/` : ''}?tab=chat`,
                headline: prompt,
                image: image,
                description: responseText,
                dateCreated: publishedTime,
                datePublished: publishedTime,
                expires: expiryDate.toISOString(),
                author: 'Qwiket',
                publisher: 'Qwiket',
                articleBody: digest,
            }
            if (digest && prompt && responseText && publishedTime)
                jsonld.push(JSON.stringify(articleStructuredData));
            const qaStructuredData = {
                '@context': 'https://schema.org',
                '@type': 'QAPage',
                '@id': `${process.env.NEXT_PUBLIC_SERVER}/${leagueid}/${teamid}/${athleteUUId ? `${athleteUUId}/` : ''}?tab=chat&prompt=${promptUUId}`,

                "mainEntity": {
                    "@type": "Question",
                    "name": 'Elevate your fantasy game with Qwiket: Interactive Sports Knowledge Platform.',
                    "text": `${prompt}`,
                    "answerCount": 1,
                    "dateCreated": publishedTime,
                    "datePublished": publishedTime,
                    "expires": expiryDate.toISOString(),
                    "author": 'Qwiket',
                    "publisher": 'Qwiket',
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": responseText,
                        "dateCreated": publishedTime,
                        "datePublished": publishedTime,
                        "expires": expiryDate.toISOString(),
                        "author": 'Qwiket',
                        "publisher": 'Qwiket',
                    }
                }
            }
            if (prompt && responseText && publishedTime)
                jsonld.push(JSON.stringify(qaStructuredData));
        }

    }
    if (tab == 'prompts') {
        const promptPageKey: PromptPageKey = { type: 'prompt-page', pageUUId: null, search_key: `${athleteUUId ? athleteUUId : teamid ? teamid : ''}` };
        // console.log("==> SSR PROMPT PAGE KEY", promptPageKey);
        calls.push(await promiseGetPromptPage(promptPageKey));
    }
    /* SSR FETCHES */

    if (promptChatKey && response) {
        fallback[unstable_serialize(promptChatKey)] = response
    }


    const leaguesKey = { type: "leagues" };
    fallback[unstable_serialize(leaguesKey)] = fetchLeagues(leaguesKey);

    await fetchData(t1, fallback, calls);

    const key = { type: "league-teams", league };

    let teams = fallback[unstable_serialize(key)];
    let teamName = teams?.find((x: any) => x.id == teamid)?.name;
    const t3 = new Date().getTime();
    console.log("==> common SSR", JSON.stringify({ ssrTime: t3 - t1, teamName, teamid, athleteUUId, tab, view, dark, jsonld, cstory, cm }));
    const today = new Date();
    return { today, relatedContent, page, jsonld, userInfo, dark, view, tab, rtab, fallback, fbclid, utm_content, bot, isMobile, story, findexarxid, m, cstory, cm, league, pagetype, teamid, name, athleteUUId, teamName, ua, prompt, promptUUId };
}

export async function generateMetadata(
    { params, searchParams }: { params: SSRParams, searchParams: SSRSearchParams },
    parent: ResolvingMetadata
): Promise<Metadata> {
    // Read route params
    const { id, story, tab, view, m, cstory, cm, promptUUId } = searchParams as any;
    let { leagueid = "", teamid = "", name = "", athleteUUId = "" } = params;
    //console.log("META searchParams", { id, story, tab, view, m, s });

    let findexarxid = id || "";

    let amention, astory;
    if (findexarxid) {
        amention = await getAMention({ type: "AMention", findexarxid });
    }
    if (story || cstory) {
        astory = await getASlugStory({ type: "ASlugStory", slug: story || cstory });
    }
    if (m || cm) {
        astory = await getASlugStory({ type: "ASlugStory", slug: m || cm });
    }
    let promptResponse: { prompt: string, response: string, slug: string, image: string, image_width: number, image_height: number, publishedTime: Date, digest: string } | null = null;
    if (promptUUId && tab == 'chat') {
        const response = await ssrPromptChatResponse(promptUUId);
        console.log("==> SSR PROMPT CHAT RESPONSE", response);
        const { prompt, response: responseText, slug, image, image_width, image_height, publishedTime, digest } = response || {};
        promptResponse = { prompt, response: responseText, slug, image, image_width, image_height, publishedTime, digest };
    }

    const { summary: amentionSummary = "", league: amentionLeague = "", type = "", team: amentionTeam = "", teamName: amentionTeamName = "", name: amentionPlayer = "", image: amentionImage = "", date: amentionDate = "" } = amention || {};
    let {
        title: astoryTitle = "",
        site_name: astorySite_Name = "",
        authors: astoryAuthors = "",
        digest: astoryDigest = "",
        image: astoryImage = "",
        ogimage: astoryOgImage = "",
        createdTime: astoryDate = "",
        mentions: mentions = [],
        image_width = 1200,
        image_height = 1200
    } = astory || {};

    const astoryImageOgUrl = astoryOgImage ? astoryOgImage : astoryImage ? `${process.env.NEXT_PUBLIC_SERVER}/api/og.png/${encodeURIComponent(astoryImage)}/${encodeURIComponent(astorySite_Name)}/${image_width}/${image_height}` : ``;

    // Prepare meta data for amention
    let ogUrl = '';
    if (amention && amentionLeague && amentionTeam && amentionPlayer) {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}/${amentionTeam}/player/${amentionPlayer}?id=${findexarxid}`;
    } else if (amention && amentionLeague && amentionTeam) {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}/team/${amentionTeam}?id=${findexarxid}`;
    } else if (amention && amentionLeague) {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}?id=${findexarxid}`;
    } else if (amention) {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}`;
    } else {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}`;
    }
    let ogAuthors = '';
    let ogSiteName = '';
    let ogTarget = '';
    if (amention && amentionLeague && amentionTeam && amentionPlayer && type == 'person') {
        ogTarget = `${amentionPlayer} of ${amentionTeamName}`;
    } else if (amention && amentionLeague && amentionTeam) {
        ogTarget = `${amentionTeamName} on ${process.env.NEXT_PUBLIC_APP_NAME}`;
    }

    let ogDescription = amentionSummary || promptResponse || "Interactive sports knowledge for fantasy sports and sports betting Fans";
    let ogImage = astoryImageOgUrl || '/q-logo-og-1200.png';
    if (!astoryImageOgUrl) image_height = 630;
    let ogTitle = ogTarget || `Qwiket AI: Helping Fantasy Sports and Sports Betting Fans to Elevate their Game`;
    if (astory) {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${leagueid}/${teamid}/${athleteUUId ? `${encodeURIComponent(name)}/${athleteUUId}/` : ''}?story=${encodeURIComponent(story)}`;
        ogTitle = astoryTitle;
        ogDescription = astoryDigest.replaceAll('<p>', '').replaceAll('</p>', "\n\n");
        ogImage = astoryImageOgUrl;
    }
    let noindex = !leagueid && !teamid && !athleteUUId && !tab && !view ? 0 : 1;

    if (promptResponse && promptUUId) {
        ogTitle = ogTitle + ' - ' + promptResponse.prompt;
        ogDescription = promptResponse.response || promptResponse.digest;
        ogImage = promptResponse.image;
        image_width = promptResponse.image_width;
        image_height = promptResponse.image_height;
        ogAuthors = 'Qwiket';
        ogSiteName = 'Qwiket';
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${leagueid}/${teamid}/${athleteUUId ? `${encodeURIComponent(name)}/${athleteUUId}/` : ''}?tab=chat&prompt=${encodeURIComponent(promptResponse.prompt)}&promptUUId=${promptUUId}`;
        // Update noindex based on publishedTime being older than 1 week
        const publishedDate = promptResponse.publishedTime ? new Date(promptResponse.publishedTime) : new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        noindex = 0;
        if (publishedDate < oneWeekAgo || !promptResponse.publishedTime) {
            noindex = 1;
        }
    }
    if (tab == 'prompts') {
        noindex = 0;
        ogTitle = `Qwiket AI: ${name ? name : ''} FAQ`;
        ogDescription = "Qwiket AI: Frequently Asked Questions";
        ogImage = "/q-logo-og-1200.png";
        image_width = 1200;
        image_height = 1200;
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${leagueid}/${teamid}/${athleteUUId ? `${encodeURIComponent(name)}/${athleteUUId}/` : ''}?tab=prompts`;
        ogImage = "/q-logo-og-1200.png";
        image_width = 1200;
        image_height = 1200;
        // ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${leagueid}/${teamid}/${athleteUUId ? `${athleteUUId}/` : ''}`;
    }

    if ((athleteUUId || teamid) && (!tab || tab == 'podcasts') && !view && !findexarxid && !story) {

        let teamName = await actionGetTeamName(teamid);

        noindex = 0;
        if (athleteUUId) {
            name = decodeURIComponent(name);
            ogTitle = `${name} - ${teamName} : Qwiket AI: Interactive Sports Knowledge`;
        }
        else {
            ogTitle = `${teamName} : Qwiket AI: Interactive Sports Knowledge`;
        }
        ogDescription = `Elevate your fantasy game with Qwiket! For Fantasy Sports and Sports betting Enthusiasts: Interactive up-to-minute knowledge accessible via AI Chat and Qwiket Mentions Index.`;
        ogImage = "/q-logo-og-1200.png";
        image_width = 1200;
        image_height = 1200;
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${leagueid}/${teamid}/${athleteUUId ? `${encodeURIComponent(name)}/${athleteUUId}/` : ''}${tab ? `?tab=${tab}&utm_content=${encodeURIComponent(tab)}` : ''}`;
    }
    if (tab == 'blog' && cstory) {
        const blogArticleKey: BlogArticleKey = { type: "fetch-blog-article", slug: cstory };
        const blogArticle = await actionFetchBlogArticle(blogArticleKey);
        ogTitle = blogArticle.title;
        ogDescription = blogArticle.summary;
        ogImage = blogArticle.articleImage.url;
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/tab=blog&cstory=${cstory}`;
        ogSiteName = 'QwiketAI';
        ogAuthors = blogArticle.authorName;
        //image_width = blogArticle.articleImage.width;
        //image_height = blogArticle.articleImage.height;
        noindex = 0;
    }
    return {
        title: ogTitle,
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            url: ogUrl,
            images: [
                {
                    url: ogImage,
                    width: image_width ? image_width : 0,
                    height: image_height ? image_height : 0,
                    alt: ogTitle,
                }
            ],
            type: 'website',
            siteName: ogSiteName,
        },
        robots: (noindex === 1) ? 'noindex, follow' : 'index, follow',
        alternates: {
            canonical: tab == 'blog' && cstory ? ogUrl : null,
        },
        icons: {
            icon: [
                { url: "/q-logo-light-42.png", media: "(prefers-color-scheme: light)" },
                { url: "/q-logo-dark-42.png", media: "(prefers-color-scheme: dark)" }
            ],
            shortcut: [
                { url: "/q-logo-light-512.png", media: "(prefers-color-scheme: light)" },
                { url: "/q-logo-dark-512.png", media: "(prefers-color-scheme: dark)" }
            ],
        },
    };
}

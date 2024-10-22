import { cookies, headers } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { unstable_serialize } from 'swr';
import { SWRProvider } from '@/app/swr-provider';
import { auth, currentUser } from "@clerk/nextjs/server";
import fetchMyTeam from '@/lib/fetchers/my-team-actions';
import fetchMyFeed from '@/lib/fetchers/myfeed';
import fetchLeagues from '@/lib/fetchers/leagues';
import fetchFavorites from '@/lib/fetchers/favorites';
import fetchSlugStory from '@/lib/fetchers/slug-story';
import fetchMention from '@/lib/fetchers/mention';
import fetchMetaLink from '@/lib/fetchers/meta-link';
import fetchStories from '@/lib/fetchers/stories';
import fetchUserSubscription from "@/lib/fetchers/user-subscription";
import promiseUser from "@/lib/fetchers/account";
import { getASlugStory } from '@/lib/fetchers/slug-story';
import { getAMention } from '@/lib/fetchers/mention';
import { UserAccountKey } from "@/lib/keys";
import SPALayout from '@/components/spa';
import fetchData from '@/lib/fetchers/fetch-data';
import { isbot } from '@/lib/is-bot';
import type { Metadata, ResolvingMetadata } from 'next';

type Props = {
    params: {};
    searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
    let { id, story } = searchParams as any;
    let findexarxid = id || "";
    const league = '';

    let amention, astory;
    if (findexarxid) {
        amention = await getAMention({ type: "AMention", findexarxid });
    }
    if (story) {
        astory = await getASlugStory({ type: "ASlugStory", slug: story });
    }

    const {
        summary: amentionSummary = "",
        league: amentionLeague = "",
        type = "",
        team: amentionTeam = "",
        teamName: amentionTeamName = "",
        name: amentionPlayer = "",
        image: amentionImage = "",
        date: amentionDate = ""
    } = amention || {};

    const {
        title: astoryTitle = "",
        site_name: astorySite_Name = "",
        authors: astoryAuthors = "",
        digest: astoryDigest = "",
        image: astoryImage = "",
        createdTime: astoryDate = "",
        mentions = [],
        image_width = 0,
        image_height = 0
    } = astory || {};

    const astoryImageOgUrl = astoryImage ? `${process.env.NEXT_PUBLIC_SERVER}/api/og.png/${encodeURIComponent(astoryImage)}/${encodeURIComponent(astorySite_Name)}/${image_width}/${image_height}` : ``;

    let ogUrl = '';
    if (amention) {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}/${amentionTeam}/${amentionPlayer}?id=${findexarxid}`;
    } else {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}`;
    }

    let ogTarget = '';
    if (amention && type == 'person') {
        ogTarget = `${amentionPlayer} of ${amentionTeamName}`;
    } else if (amention) {
        ogTarget = `${amentionTeamName} on ${process.env.NEXT_PUBLIC_APP_NAME}`;
    }

    let ogDescription = amentionSummary || "Professional and Fantasy Sports AI News Monitor.";
    let ogImage = astoryImageOgUrl || "https://www.qwiket.com/QLogo.png";
    let ogTitle = ogTarget || `${process.env.NEXT_PUBLIC_APP_NAME} Sports AI`;

    if (astory) {
        ogUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/${league}?${story ? `story=${story}` : ``}` : `${process.env.NEXT_PUBLIC_SERVER}/?${story ? `story=${story}` : ``}`;
        ogTitle = astoryTitle;
        ogDescription = astoryDigest.replaceAll('<p>', '').replaceAll('</p>', "\n\n");
        ogImage = astoryImageOgUrl;
    }

    let noindex = +(process.env.NEXT_PUBLIC_NOINDEX || "0");

    return {
        title: ogTitle,
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            url: ogUrl,
            images: [
                {
                    url: ogImage,
                    width: image_width,
                    height: image_height,
                    alt: ogTitle,
                }
            ],
            type: 'website'
        },
        robots: noindex === 1 ? 'noindex, nofollow' : 'index, follow',
        alternates: {
            canonical: ogUrl,
        },
        icons: {
            icon: [
                { url: "/q-logo-light-512.png", media: "(prefers-color-scheme: light)" },
                { url: "/q-logo-dark-512.png", media: "(prefers-color-scheme: dark)" }
            ],
            shortcut: [
                { url: "/q-logo-light-512.png", media: "(prefers-color-scheme: light)" },
                { url: "/q-logo-dark-512.png", media: "(prefers-color-scheme: dark)" }
            ],
        },
    };
}

export default async function Page({ searchParams }: { params: { slug: string }; searchParams: { [key: string]: string | string[] | undefined } }) {
    const fetchSession = async () => {
        "use server";
        let session = await getIronSession<SessionData>(cookies(), sessionOptions);
        if (!session.sessionid) {
            var randomstring = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            session.sessionid = randomstring();
            session.dark = -1;
        }
        return session;
    };

    const t1 = new Date().getTime();

    let sessionid = "";
    let dark = 0;

    let headerslist = headers();
    let { tab = "", fbclid = "", utm_content = "", view = "mentions", id, story, cid = "", aid = "" } = searchParams as any;

    let findexarxid = id || "";
    let pagetype = "account-upgrade";
    let league = "";
    const ua = headerslist.get('user-agent') || "";
    const botInfo = isbot({ ua });

    let userId = "";
    try {
        let { userId: authId } = !botInfo.bot ? auth() : { userId: "" };
        userId = authId || "";
    } catch (x) {
        console.log("error fetching userId", x);
    }

    if (!userId) {
        userId = "";
    }
    // console.log("*** *** *** userId", userId);
    try {
        const session = await fetchSession();
        // console.log("*** *** *** session", session);
        sessionid = session.sessionid;
        dark = session.dark;
    } catch (x) {
        console.log("error fetching sessionid", x);
    }
    // console.log("sessionid", sessionid);

    let fallback: { [key: string]: any } = {};
    const leaguesKey = { type: "leagues" };
    fallback[unstable_serialize(leaguesKey)] = fetchLeagues(leaguesKey);


    let bot = botInfo.bot || ua.match(/vercel|spider|crawl|curl|Googlebot/i);
    if (!ua) {
        bot = true;
    }

    let isMobile = Boolean(ua.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i));
    view = view.toLowerCase();
    if (view == 'main' || view == 'feed' || view == 'home') {
        view = 'mentions';
    }
    //  console.log("VIEW:", view, isMobile);
    let calls: { key: any; call: Promise<any> }[] = [];
    let userInfo: { email: string } = { email: "" };
    if (userId) {
        const user = await currentUser();
        const email = user?.emailAddresses[0]?.emailAddress;
        userInfo.email = email || '';
    }
    if (!bot) {
        calls.push(await promiseUser({ type: "user-account", email: userInfo.email, bot: bot || false }, userId, sessionid, utm_content, ua, cid, aid));
    }

    await fetchData(t1, fallback, calls);

    return (
        <SWRProvider value={{ fallback }}>
            <main className="w-full h-full">
                <SPALayout userInfo={userInfo} dark={dark || 0} view={view} tab={tab} fallback={fallback} fbclid={fbclid} utm_content={utm_content} bot={bot || false} isMobile={isMobile} league="" story={story} findexarxid={findexarxid} pagetype={pagetype} />
            </main>
        </SWRProvider>
    );
}

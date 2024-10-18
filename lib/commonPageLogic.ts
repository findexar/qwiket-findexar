import { headers } from "next/headers";
import { unstable_serialize } from 'swr';
import { auth, currentUser } from "@clerk/nextjs/server";
import fetchSession from '@/lib/fetchers/session';
import fetchLeagues from '@/lib/fetchers/leagues';
import fetchUserAccount from "@/lib/fetchers/account";
import { isbot } from '@/lib/is-bot';
import fetchData from '@/lib/fetchers/fetch-data';
import { getAMention } from '@/lib/fetchers/mention';
import { getASlugStory } from '@/lib/fetchers/slug-story';

export async function commonPageLogic(params: any, searchParams: any) {
    console.log("commonPageLogic")
    const t1 = new Date().getTime();
    let headerslist = headers();
    const ua = headerslist.get('user-agent') || "";

    const botInfo = isbot({ ua });
    let bot = botInfo.bot || ua.match(/vercel|spider|crawl|curl/i);
    let { userId } = !bot ? auth() : { userId: "" };
    userId = userId || "";

    let sessionid = "";
    let dark = 0;

    try {
        const session = await fetchSession();
        sessionid = session.sessionid;
        dark = session.dark;
    } catch (x) {
        console.log("error fetching sessionid", x);
    }

    let fallback: { [key: string]: any } = {};
    const leaguesKey = { type: "leagues" };
    fallback[unstable_serialize(leaguesKey)] = fetchLeagues(leaguesKey);

    let {
        tab,
        fbclid,
        utm_content,
        view = "mentions",
        id,
        story
    } = searchParams;

    let findexarxid = id || "";
    let league = params.leagueid?.toUpperCase();

    utm_content = utm_content || '';
    fbclid = fbclid || '';

    let isMobile = Boolean(ua.match(
        /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i
    ));
    view = view.toLowerCase();
    if (view == 'main' || view == 'feed' || view == 'home') {
        view = 'mentions';
    }

    let calls: { key: any, call: Promise<any> }[] = [];

    let userInfo: { email: string } = { email: "" };
    if (userId) {
        const user = await currentUser();
        const email = user?.emailAddresses[0]?.emailAddress;
        userInfo.email = email || '';
    }

    if (!bot) {
        calls.push(await fetchUserAccount({ type: "user-account", email: userInfo.email }, userId, sessionid, utm_content, ua));
    }

    // Add more common fetch calls here

    await fetchData(t1, fallback, calls);

    return {
        bot,
        userId,
        sessionid,
        dark,
        fallback,
        findexarxid,
        league,
        isMobile,
        view,
        tab,
        fbclid,
        utm_content,
        userInfo,
        story
    };
}

export async function generateCommonMetadata(params: any, searchParams: any) {
    let { id, story } = searchParams;
    let findexarxid = id || "";
    let league = params.leagueid?.toUpperCase();

    let amention, astory;

    if (findexarxid) {
        amention = await getAMention({ type: "AMention", findexarxid });
    }

    if (story) {
        astory = await getASlugStory({ type: "ASlugStory", slug: story });
    }

    //@ts-ignore
    const { summary: amentionSummary = "", league: amentionLeague = "", type = "", team: amentionTeam = "", teamName: amentionTeamName = "", name: amentionPlayer = "", athleteUUId: amentionAthleteUUId = "", image: amentionImage = "", date: amentionDate = "" } = amention ? amention : {};
    //@ts-ignore
    const { title: astoryTitle = "", site_name: astorySite_Name = "", authors: astoryAuthors = "", digest: astoryDigest = "", image: astoryImage = "", createdTime: astoryDate = "", mentions: mentions = [], image_width = 0, image_height = 0 } = astory ? astory : {};
    const astoryImageOgUrl = astoryImage ? `${process.env.NEXT_PUBLIC_SERVER}/api/og.png/${encodeURIComponent(astoryImage)}/${encodeURIComponent(astorySite_Name)}/${image_width}/${image_height}` : ``;

    //prep meta data for amention
    let ogUrl = '';
    if (amention && amentionLeague && amentionTeam && amentionPlayer) {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}/team/${amentionTeam}/player/${amentionPlayer}?id=${findexarxid}`;
    } else if (amention && amentionLeague && amentionTeam) {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}/team/${amentionTeam}?id=${findexarxid}`;
    } else if (amention && amentionLeague) {
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/${amentionLeague}?id=${findexarxid}`;
    }
    else if (amention)
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}/?id=${findexarxid}`;
    else
        ogUrl = `${process.env.NEXT_PUBLIC_SERVER}`;
    let ogTarget = '';
    if (amention && amentionLeague && amentionTeam && amentionPlayer && type == 'person')
        ogTarget = `${amentionPlayer} of ${amentionTeamName}`;
    else if (amention && amentionLeague && amentionTeam)
        ogTarget = `${amentionTeamName} on ${process.env.NEXT_PUBLIC_APP_NAME}`;

    let ogDescription = amentionSummary || "Sport News Monitor and AI Chat.";
    let ogImage = astoryImageOgUrl || "https://www.qwiket.com/QLogo.png";
    let ogTitle = ogTarget || `${process.env.NEXT_PUBLIC_APP_NAME} Sports AI`;
    if (astory) {
        ogUrl = league ? `${process.env.NEXT_PUBLIC_SERVER}/${league}?${story ? `story=${story}` : ``}`
            : `${process.env.NEXT_PUBLIC_SERVER}/?${story ? `story=${story}` : ``}`;
        ogTitle = astoryTitle;
        ogDescription = astoryDigest.replaceAll('<p>', '').replaceAll('</p>', "\n\n");
        ogImage = astoryImageOgUrl;
    }
    const noindex = 1;
    console.log("ogImage:", ogImage)

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
        robots: noindex ? 'noindex, nofollow' : 'index, follow',
        alternates: {
            canonical: ogUrl,
        },
        icons: {
            icon: "/QLogo.png",
            shortcut: "/QLogo.png",
        },
    };
}
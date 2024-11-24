import { headers } from "next/headers";
import { unstable_serialize } from 'swr';
import { auth, currentUser } from "@clerk/nextjs/server";
import fetchSession from '@lib/server-actions/session';
import { isbot } from '@lib/is-bot';
import fetchLeagues from '@lib/server-actions/leagues';
import fetchUserAccount from "@lib/server-actions/account";

export async function commonPageSetup(searchParams: any) {
    const headerslist = headers();
    const ua = headerslist.get('user-agent') || "";
    const botInfo = isbot({ ua });
    let bot = botInfo.bot || ua.match(/vercel|spider|crawl|curl|Googlebot/i);
    if (!ua) {
        bot = true;
    }

    let userId = "";
    try {
        let { userId: authId } = !bot ? auth() : { userId: "" };
        userId = authId || "";
    } catch (x) {
        console.log("error fetching userId", x);
    }

    let sessionid = "";
    let dark = 0;
    try {
        const session = await fetchSession();
        sessionid = session.sessionid;
        dark = session.dark;
    } catch (x) {
        console.log("error fetching sessionid", x);
    }

    let userInfo: { email: string } = { email: "" };
    if (userId) {
        const user = await currentUser();
        const email = user?.emailAddresses[0]?.emailAddress;
        userInfo.email = email || '';
    }

    return { userId, sessionid, dark, userInfo, bot };
}

export async function fetchLeaguesFallback() {
    let fallback: { [key: string]: any } = {};
    const leaguesKey = { type: "leagues" };
    fallback[unstable_serialize(leaguesKey)] = fetchLeagues(leaguesKey);
    return fallback;
} 
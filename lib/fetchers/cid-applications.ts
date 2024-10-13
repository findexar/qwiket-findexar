// nextjs13/wish-text-project/qwiket-findexar/lib/fetchers/cid-applications.ts
'use server';
import { auth } from "@clerk/nextjs/server";
import fetchSession from './session';

const lake_api = process.env.NEXT_PUBLIC_LAKEAPI
const api_key = process.env.LAKE_API_KEY;

interface UpsertCidAppProps {
    name: string;
    email: string;
    url: string;
    note: string;
}

export const actionUpsertCidApp = async ({ name, email, url, note }: UpsertCidAppProps) => {
    const session = await fetchSession();
    const { userId } = auth() || { userId: "" };
    const sessionid = session.sessionid;

    const apiUrl = `${lake_api}/api/v50/findexar/upsert-cid-app?api_key=${api_key}&userid=${userId || ""}&sessionid=${sessionid}`;

    try {
        console.log("actionUpsertCidApp apiUrl:", apiUrl);
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name,
                email,
                url,
                note,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to upsert CID application');
        }

        const result = await response.json();
        console.log("actionUpsertCidApp result:", result);
        return result;
    } catch (error) {
        console.error("Error in actionUpsertCidApp:", error);
        throw error;
    }
}

export default actionUpsertCidApp;

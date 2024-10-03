export interface FetchAthleteUUIdProps {
    athleteName: string;
    teamAbv: string;
}

export const actionFetchAthleteUUId = async (props: FetchAthleteUUIdProps) => {
    'use client';
    try {
        const { athleteName, teamAbv } = props;
        // Create a ReadableStream for the response
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/get-athleteuuid?athleteName=${encodeURIComponent(athleteName)}&teamAbv=${encodeURIComponent(teamAbv)}`;
        console.log('==> FETCH-ATHLETEUUID.TS athleteName', athleteName, 'teamAbv', teamAbv);
        try {
            const res = await fetch(url);
            const data = await res.json();
            return data.prompts;
        } catch (error) {
            console.error('Error in actionFetchAthleteUUId:', error);
            return [];
        }
    }
    catch (x) {
        console.error('Error in actionFetchAthleteUUId:', x);
        return [];
    }
};
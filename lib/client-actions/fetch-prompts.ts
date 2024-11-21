export interface FetchPromptsProps {

    league?: string;
}

export const actionFetchPrompts = async (props: FetchPromptsProps) => {
    'use client';
    try {
        const { league } = props;
        // Create a ReadableStream for the response
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/get-latest-prompts?league=${league}`;
        try {
            const res = await fetch(url);
            const data = await res.json();
            return data.prompts;
        } catch (error) {
            console.error('Error in actionFetchPrompts:', error);
            return [];
        }
    }
    catch (x) {
        console.error('Error in actionFetchPrompts:', x);
        return [];
    }
};
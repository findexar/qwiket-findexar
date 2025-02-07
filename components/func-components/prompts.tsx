'use client';
import React, { useEffect, useState } from "react";
import { useAppContext } from '@lib/context';
import LoadMore from "@components/func-components/load-more";
import { IoAddCircleOutline } from 'react-icons/io5';
import { MyChatsKey, PromptPageKey } from "@/lib/keys";
import useSWR, { mutate, unstable_serialize } from "swr";
import { actionGetPromptPage } from "@lib/server-actions/chat";
import { ChatItem } from "@/lib/types/chat";
import Link from "next/link";

interface Props {

}

let lastMutate = 0;
type Prompt = {
    promptUUId: string;
    prompt: string;
    response: string;
    millis: number;
}
type PromptPage = {
    prompts: Prompt[];
    next: string | null;
    prev: string | null;
    pageUUId: string;
}
type PromptResponse = {
    prompts: Prompt[];
    next: string | null;
    prev: string | null;
    pageUUId: string;
}
const PromptsComponent: React.FC<Props> = ({

}) => {
    const { fallback, league, teamid, athleteUUId, page, player } = useAppContext();
    const [localFallback, setLocalFallback] = useState(fallback);

    const [pageUUId, setPageUUId] = useState(page || null);
    const search_key = athleteUUId ? athleteUUId : teamid ? teamid : '';
    const promptPageKey: PromptPageKey = { type: 'prompt-page', pageUUId, search_key };
    // console.log("=====> PROMPT PAGE KEY", { page, pageUUId, promptPageKey });
    let { data: loadedPage, error: loadedPageError, isLoading: isLoadingPage, mutate: mutateLoadedPage }: {
        data: PromptPage,
        error: any,
        isLoading: boolean,
        mutate: any
    } = useSWR(promptPageKey, actionGetPromptPage, { fallback: localFallback });
    /* useEffect(() => {
         if (loadedPage && loadedPage.pageUUId != page) {
             const promptPageKey: PromptPageKey = { type: 'prompt-page', search_key, pageUUId };
             console.log("==> INSERTPROMPT PAGE KEY", promptPageKey);
             const updatedFallback = { ...fallback, [unstable_serialize(promptPageKey)]: loadedPage };
 
             setTimeout(() => {
                 setLocalFallback(updatedFallback);
                 // setPageUUId(loadedPage.pageUUId);
 
             }, 2000);
         }
     }, [loadedPage]);*/
    const { prompts, next, prev }: PromptPage = loadedPage || { prompts: [], next: null, prev: null, pageUUId: null };
    //console.log("==> PromptsComponent", { prompts, next, prev, pageUUId });
    const isLoadingMore = isLoadingPage;
    let isEmpty = prompts?.length === 0;
    let isReachingEnd = isEmpty || (prompts?.length < 5);
    const baseUrl = `/${league}/${teamid}/${athleteUUId ? `${encodeURIComponent(player)}/${athleteUUId}` : ''}?tab=chat`;

    const promptRows = prompts ? prompts.map((prompt: Prompt, i: number) => (
        <section key={prompt.promptUUId} className="m-2" role="region" aria-labelledby={`faq-${i}`}>
            <Link scroll={true} href={`${baseUrl}&promptUUId=${prompt.promptUUId}&prompt=${encodeURIComponent(prompt.prompt)}`} className="text-sm font-medium hover:underline mb-2"><h2 id={`faq-${i}`}><span className="text-green-700 dark:text-green-100 font-bold">Question:</span> &nbsp;{prompt.prompt}</h2></Link>
            <p id={`faq-${i}-answer`} className="text-sm mt-1 text-gray-500 dark:text-gray-400"><span className="text-green-700 dark:text-green-100 font-bold">Answer:</span> &nbsp;{prompt.response}</p>
        </section>
    )) : null;
    return (
        <section aria-labelledby="faq-header" className="h-full flex flex-col mt-2 mb-2 pb-8">
            <h1 id="faq-header" className="text-2xl font-bold ml-2">F.A.Q.</h1>

            {promptRows}

            {prev && (
                <Link scroll={true} href={`${baseUrl}&page=${prev}`} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 hover:underline">
                    Prev
                </Link>
            )}
            {next && (
                <Link scroll={true} href={`${baseUrl}&page=${next}`} className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-200 hover:underline">
                    Next
                </Link>
            )}
        </section>
    );
};

export default PromptsComponent;

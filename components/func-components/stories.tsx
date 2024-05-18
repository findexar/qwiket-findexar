'use client';
import React, { useEffect, useState } from "react";
import useSWRInfinite from 'swr/infinite';
import { styled } from "styled-components";
import { useAppContext } from '@/lib/context';
import Story from "@/components/func-components/items/story";
import LoadMore from "@/components/func-components/load-more";
import { actionStories } from '@/lib/fetchers/stories';
import { StoriesKey } from '@/lib/keys';

const MentionsBody = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
`;

const MentionsOuterContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    font-family: 'Roboto', sans-serif;
    padding-right: 20px;
    @media screen and (max-width: 1024px) {
        display: none;
    }
`;

const ButtonContainer = styled.div`
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    margin-bottom: 100px;
`;

const MobileMentionsOuterContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    font-family: 'Roboto', sans-serif;
    align-content: flex-start;
    a {
        font-size: 18px;
        text-decoration: none;
        &:hover {
            color: var(--highlight);
        }   
    }
    @media screen and (min-width: 1025px) {
        display: none;
    }
`;

interface Props {}

let lastMutate = 0;
let scrollY = 0;

const Stories: React.FC<Props> = () => {
    const { fallback,league } = useAppContext();

    const fetchStoriesKey = (pageIndex: number, previousPageData: any): StoriesKey | null => {
        let key: StoriesKey = { type: "fetch-stories", page: pageIndex, league };
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    };
    const { data, mutate, size, setSize, isLoading } = useSWRInfinite(fetchStoriesKey, actionStories, { initialSize: 1, revalidateAll: false, parallel: true, fallback, revalidateFirstPage: false });

    let stories = data ? [].concat(...data) : [];

    useEffect(() => {
        const intervalId = setInterval(() => {
            if (Date.now() - lastMutate > 60 * 1000 && (window.scrollY === 0)) {
                lastMutate = Date.now();
                mutate();
            }
        }, 20 * 1000); // Check every 20 secs

        return () => clearInterval(intervalId);
    }, [mutate]);

    useEffect(() => {
        const listener = () => {
            if (window.scrollY === 0) {
                if (lastMutate < Date.now() - 1000) {
                    mutate();
                }
                lastMutate = Date.now();
            }
        };

        function debounce(callbackFn: any, delay: number) {
            let timeoutId: NodeJS.Timeout | null = null;
            return function () {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }
                timeoutId = setTimeout(() => {
                    callbackFn.call();
                }, delay);
            };
        }

        window.addEventListener("scroll", debounce(listener, 100));
        return () => window.removeEventListener("scroll", listener);
    }, [scrollY]);

    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 5);

    const Stories = stories && stories.filter((s: any, i: number) => s).map((s: any, i: number) => (
        <Story
            story={s}
            handleClose={() => {}}
            key={`story-${i}`}
        />
    ));

    if (!stories || stories.length === 0) {
        return null;
    }
    return (
        <>
            <div className="">
                <MentionsOuterContainer className="hidden lg:block">
                    <MentionsBody>
                        {Stories}
                    </MentionsBody>
                    <LoadMore setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
                </MentionsOuterContainer>
            </div>

            <MobileMentionsOuterContainer className="h-full lg:hidden">
                <MentionsBody>
                    {Stories}
                </MentionsBody>
                <LoadMore setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
                <ButtonContainer />
            </MobileMentionsOuterContainer>
        </>
    );
};

export default Stories;

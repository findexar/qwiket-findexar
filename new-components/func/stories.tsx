'use client';
import React from 'react';
import useSWRInfinite from 'swr/infinite';

import { useAppContext } from '@/lib/context';
import Story from "@/new-components/func/story";
import LoadMore from "@/new-components/nav/load-more";
import {StoriesKey} from '@/lib/keys';
import {actionStories} from '@/lib/fetchers/stories';
const Stories: React.FC = () => {
    let { league, view, tab,fallback } = useAppContext();
    if(!tab)
        tab='all';
    const fetchStoriesKey = (pageIndex: number, previousPageData: any): StoriesKey | null => {
        let key: StoriesKey = { type: "fetch-stories", page: pageIndex, league };
        console.log("StoriesKey:",key);
        if (previousPageData && !previousPageData.length) return null // reached the end
        return key;
    }
    const { data, error: storiesError, mutate, size, setSize, isValidating, isLoading } = useSWRInfinite(fetchStoriesKey, actionStories, { fallback,initialSize: 1, revalidateAll: true,parallel:true })
   
    let stories = data ? [].concat(...data):[];
    console.log("stories===>",stories)
    const isLoadingMore =
        isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < 5);
    const storiesList = stories && stories.map((s: any, i: number) => <Story
        story={s}
        handleClose={()=>{}}
        key={`story-${s.xid}`}
    />);
    return <div className="w-full h-full ">
      
      <div className="ml-1">{storiesList}</div>  
    </div>
}
export default Stories;
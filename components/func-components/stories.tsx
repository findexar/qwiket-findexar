import React, { useState } from "react";
import useSWRInfinite from 'swr/infinite'
import { styled } from "styled-components";
import { FetchedStoriesKey, fetchStories } from '@/lib/api';
import { useAppContext } from '@/lib/context';
import Story from "@/components/func-components/items/story";
import LoadMore from "@/components/func-components/load-more";

const MentionsBody = styled.div`
    height:100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items:flex-start;
`;

const MentionsOuterContainer = styled.div`
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    width:100%;
    height:100%;
    font-family: 'Roboto', sans-serif;
    padding-right:20px;
    @media screen and (max-width: 1199px) {
        display: none;
    }
`;

const ButtonContainer = styled.div`
    width:100%;
    display:flex;
    flex-direction:row;
    justify-content:center;
    align-items:center;
    margin-bottom:100px;
`;

const MobileMentionsOuterContainer = styled.div`
    display:flex;
    flex-direction:column;
    justify-content:flex-start;
    width:100%;
    height:100%;
    font-family: 'Roboto', sans-serif;
    align-content:flex-start;
    background-color:var(--mention-bg);
    a{
        font-size: 18px;
      
        text-decoration: none;
        &:hover{
          color: var(--highlight);
        }   
    }
    @media screen and (min-width: 1200px) {
        display: none;
    }
`;

interface Props {
}

const Stories: React.FC<Props> = () => {
    const { mode, userId, noUser, view, tab, isMobile, setLeague, setView, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, league, pagetype, team, player, teamName, setTeamName } = useAppContext();
    const [firstXid, setFirstXid] = useState("");
     
    const fetchStoriesKey = (pageIndex: number, previousPageData: any): FetchedStoriesKey | null => {
        let key: FetchedStoriesKey = { type: "FetchedStories", noUser, page: pageIndex, league, noLoad: view != "mentions" && tab != "all" };
        if (previousPageData && !previousPageData.length) return null // reached the end
        return key;
    }
    const { data, error: storiesError, mutate, size, setSize, isValidating, isLoading } = useSWRInfinite(fetchStoriesKey, fetchStories, { initialSize: 1, revalidateAll: true,parallel:true })
   
    let stories = data ? [].concat(...data):[];
   
    const isLoadingMore =
        isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd =
        isEmpty || (data && data[data.length - 1]?.length < 5);
    const Stories = stories && stories.map((s: any, i: number) => <Story
        story={s}
        handleClose={()=>{}}
        key={`story-${i}`}
    />);
    if(!stories||stories.length==0){
        return null;
    }
    return (
        <>
            {!isMobile ?
                <MentionsOuterContainer>
                    <MentionsBody>
                        {Stories}
                    </MentionsBody>
                    <LoadMore setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
                </MentionsOuterContainer>
                :
                <MobileMentionsOuterContainer>
                    <MentionsBody>
                        {Stories}
                    </MentionsBody>
                    <LoadMore setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
                    <ButtonContainer> </ButtonContainer>
                </MobileMentionsOuterContainer>}
        </>
    )
}

export default Stories;
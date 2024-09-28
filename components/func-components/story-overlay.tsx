import React, { useEffect, useCallback } from 'react';
import useSWR from 'swr';
import styled from 'styled-components';
import { useRouter } from 'next/navigation'; // Corrected import for useRouter

import { ASlugStoryKey } from '@/lib/keys';
import { actionRecordEvent } from "@/lib/actions";
import { actionASlugStory, removeASlugStory } from '@/lib/fetchers/slug-story';
import Story from '@/components/func-components/items/story';
import { useAppContext } from '@/lib/context';
import CloseIcon from '@components/icons/close';

const ContentWrap = styled.div`
    width: 100%;
    height: 100%;
    padding-left:0px;
    padding-right:0px;
    color:var(--text);
    font-family:'Roboto','Helvetica',sans-serif;
    @media (max-width: 600px) {
        padding: 0 0px;
    }
`;

const MentionWrap = styled.div`
    width: 100%;
    height: 100%;
    font-family:'Roboto','Helvetica',sans-serif;
    text-align:left;
`;

const XContainer = styled.div`
    width: 100%;
    height:32px;
    margin-top:-42px;
    margin-bottom:3px;
    display: flex;
    flex-direction: row;
    justify-content:flex-end;
    align-items:center;
    font-size:28px;
    :hover{
        cursor:pointer;
        color:var(--xColor);
        
    }
`;

const XElement = styled.div`
    width: 40px;
    height: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 28px;
    color: #fff;
    cursor: pointer;
    &:hover {
        color: var(--xColor);
    }
`;

const RElement = styled.div`
    width: 20px;
    display: flex;
    flex-direction: row;
    justify-content:flex-end;
    align-items:center;
    font-size:28px;
    margin-top:-110px;
    color:#f44; 
    @media (max-width: 1199px) {
      margin-top:0px;
    }
`;

const TitleWrap = styled.div`
    color:#fff !important;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top:-16px;
    padding-bottom:4px;
    width:60%;
`;

const DialogTitleWrap = styled.div`
    height:60px;
    @media (max-width: 1199px) {
        display:none;
    }
`;

const DialogTitleMobileWrap = styled.div`
    display:block;
    margin-top:20px;

    @media (min-width: 1200px) {
        display:none;
    }
`;

const GotoFeed = styled.div`
    position:absolute;
    z-index:50;
    top:82px;
    right:40px;
    font-size:14px;
    color:var(--qwiket-border-new);
    border-color:var(--qwiket-border-new);
    border-style:solid;
    border-width:1px;
    border-radius: 6px;
    padding:4px;
    cursor: pointer;
    &:hover{
        color:var(--qwiket-border-recent);
        border-color:var(--qwiket-border-recent);
    }
    display:none;
    @media (max-width: 1199px) {
        top: 90px;
        display:visible;
    } 
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 8px 0;
`;

const QwiketText = styled.div`
  color: white;
  font-size: 20px;
  font-weight: bold;
`;

interface Props {
    mutate: () => void;
    setDismiss: (dismiss: boolean) => void;
    idx: string
}

const StoryOverlay = ({ setDismiss, mutate, idx, ...props }: Props) => {
    let { fallback, tab, view, mode, userId, isMobile, league, team, teamName, setLeague, setView, setTab, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, pagetype, slug, setSlug } = useAppContext();

    const aSlugStoryKey: ASlugStoryKey = { type: "ASlugStory", slug: slug };
    let { data: aSlugStory } = useSWR(aSlugStoryKey, actionASlugStory, { fallback });
    let astory = aSlugStory;
    const [open, setOpen] = React.useState(astory ? true : false);
    //console.log("DIALOG open:", open)
    const { title, url, digest, site_name, image, authors, createdTime, mentions } = astory || {};
    const router = useRouter(); // Correctly initialized useRouter
    const admin = params && params.includes('x17nz') ? true : false;
    // console.log("StoryOverlay:slug", idx, slug)
    useEffect(() => {
        if (astory) {
            //console.log("openDialog")
            setOpen(true);
        }
    }, [astory]);

    const handleClose = useCallback(async () => {
        // console.log("handleClose")
        setOpen(false);
        setSlug("");
        let newUrl = window.location.href.replace(/([&?])story=[^&]*&?/, '$1').replace(/&$/, '');
        window.history.pushState({ path: newUrl }, '', newUrl);

        //router.push(newUrl);
        // console.log("closeDialog slug=", slug)
        // let localUrl = router.asPath.replace('&story=' + slug, '').replace('?story=' + slug + "&", '?').replace('?story=' + slug, '');
        //router.push(localUrl); // Correctly using router to navigate
        await actionRecordEvent(`close-story-overlay`, `{"utm_content":"${utm_content}","params":"${params}"}`)
            .then((r: any) => {
                //console.log("recordEvent", r);
            });
    }, [slug]);
    let target = `${teamName}`;
    target = !target || target == 'undefined' ? '' : target;

    useEffect(() => {
        const keyDownHandler = (event: any) => {
            console.log('User pressed: ', event.key);

            if (event.key === 'Escape') {
                event.preventDefault();
                handleClose();
            }
        };
        window.addEventListener('keydown', keyDownHandler);
        return () => {
            window.removeEventListener('keydown', keyDownHandler);
        };
    }, [handleClose]);

    const remove = useCallback(async () => {
        if (admin) {
            await removeASlugStory(aSlugStoryKey);
            setOpen(false);
            setDismiss(true);
        }
    }, [admin, aSlugStoryKey, setDismiss]);

    if (!astory)
        return null;

    return <>{open &&
        <div className='fixed inset-0 z-50 sm:bg-opacity-50 bg-gray-700 '>
            <div className="fixed inset-0 overflow-y-auto">
                <div className="flex min-h-full items-center justify-center md:p-1 text-left ">
                    <div className="relative dark:bg-slate-900 bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all py-0 my-2 max-w-lg  md:max-w-2xl w-full ">
                        <HeaderContainer>
                            <QwiketText>QWIKET DIGEST</QwiketText>
                            <XElement onClick={() => handleClose()}>&#x2715;</XElement>
                        </HeaderContainer>
                        <div className="bg-transparent  p-0 pb-0 ">
                            <div className="flex items-start">
                                <div className=" text-center mt-0 ml-0 text-left">
                                    <div className="mt-0 mb-0 pb-0 h-full">
                                        <ContentWrap>
                                            <GotoFeed onClick={() => handleClose()}>Go To Full {league} Digest</GotoFeed>

                                            {admin && <div autoFocus onClick={() => { remove(); }}>
                                                <XContainer><RElement>R</RElement></XContainer>
                                            </div>}
                                        </ContentWrap>
                                        <ContentWrap>
                                            <MentionWrap>
                                                <Story story={astory} handleClose={handleClose} />
                                            </MentionWrap>
                                        </ContentWrap>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    }
    </>
};

export default StoryOverlay;

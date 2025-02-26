import React, { useEffect, useCallback, useState } from 'react';
import useSWR from 'swr';
import styled from 'styled-components';
import { useRouter } from 'next/navigation'; // Corrected import for useRouter
import Link from 'next/link';  // Add this import at the top

import { ASlugStoryKey } from '@/lib/keys';
import { actionRecordEvent } from "@lib/server-actions/event";
import { actionASlugStory, removeASlugStory } from '@lib/server-actions/slug-story';
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

const AskAIButton = styled.button`
  background-color: #4a5568;
  color: white;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: #2d3748;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  color: white;
  align-items: center;
  margin-right: 12px;
`;

const LogoImg = styled.img`
  height: auto;
  color: white;
  width: 32px;
  opacity: 0.6;
`;
const MentionsOuterContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    width: 100%;
    height: 100%;
    font-family: 'Roboto', sans-serif;
    padding-right: 20px;
    z-index: 100;
    
`;
interface Props {
    mutate: () => void;
    setDismiss: (dismiss: boolean) => void;
    idx: string;
    incolumn?: boolean;
}

const StoryOverlay = ({ setDismiss, mutate, idx, incolumn, ...props }: Props) => {
    const [promptUUId, setPromptUUId] = useState('');
    let { cstory, cm, fallback, league, teamName, utm_content, params, slug, m, setSlug, setM, bot } = useAppContext();
    console.log("StoryOverlay", slug, m, cm)
    const aSlugStoryKey: ASlugStoryKey = slug ? { type: "ASlugStory", slug: slug } : { type: "AMentionStory", m: m || cm };
    let { data: aSlugStory } = useSWR(
        aSlugStoryKey,
        actionASlugStory,
        { fallback }
    );
    let astory = aSlugStory;
    const [open, setOpen] = React.useState(astory ? true : false);
    //console.log("DIALOG open:", open)
    const { title, url, digest, site_name, image, authors, createdTime, mentions, prompts } = astory || {};
    const router = useRouter(); // Correctly initialized useRouter
    const admin = params && params.includes('x17nz') ? true : false;

    useEffect(() => {
        if (prompts && prompts.length > 0) {
            setPromptUUId(prompts[0].promptUUId);
        }
    }, [prompts]);

    // console.log("StoryOverlay:slug", idx, slug)
    useEffect(() => {
        if (astory) {
            //console.log("openDialog")
            setOpen(true);
            if (!bot) {
                actionRecordEvent(`story-overlay-open`, `{"utm_content":"${utm_content}","idx":"${idx}","slug":"${slug}","url":"${url}","params":"${params}"}`)
                    .then((r: any) => {
                        //console.log("recordEvent", r);
                    });
            }
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
        await actionRecordEvent(`close-story-overlay`, `{"utm_content":"${utm_content}","idx":"${idx}","slug":"${slug}","params":"${params}"}`)
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
    const innerStory = (
        <div className="relative dark:bg-slate-900 bg-slate-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all py-0 my-2 max-w-lg  md:max-w-2xl w-full ">
            <HeaderContainer>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <LogoContainer>
                        <Link href={`/${league}${params ? `?${params}` : ''}`}>
                            <LogoImg
                                src={'/q-logo-dark-128.png'}
                                alt="Qwiket Logo"
                            />

                        </Link>
                    </LogoContainer>
                    <QwiketText>IN-FOCUS</QwiketText>
                </div>
                {false && <Link href={`/${league}${params ? `?${params}` : ''}&tab=chat&prompt=&promptUUId=${promptUUId}`}>
                    <AskAIButton>Ask AI</AskAIButton>
                </Link>}
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
        </div>)
    return (<div>
        {open && !cstory && !cm &&
            <div className='fixed inset-0 z-50 sm:bg-opacity-50 bg-gray-700 '>
                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center md:p-1 text-left ">

                        {innerStory}
                    </div>
                </div>
            </div>
        }
        {open && (cstory || cm) &&
            <div>
                <div className="flex min-h-full items-center justify-center md:p-1 text-left ">

                    {innerStory}
                </div>
            </div >
        }
    </div >)
};

export default StoryOverlay;

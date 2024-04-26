import React, { useEffect, useCallback } from 'react';
import useSWR from 'swr';
import styled from 'styled-components';
import { useRouter } from 'next/navigation'
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { recordEvent, ASlugStoryKey, getASlugStory, removeASlugStory } from '@/lib/api';
import Story from '@/components/func-components/items/story';
import { useAppContext } from '@/lib/context';

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
`;

const XContainer = styled.div`
    width: 100%;
    height:32px;
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
    height:20px;
    display: flex;
    flex-direction: row;
    justify-content:center;
    align-items:center;
    font-size:28px;
    color:#fff;
    @media (max-width: 1199px) {
      margin-top:0px;
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
`;

const DialogTitleWrap = styled.div`
    height:20px;
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
    z-index:1000;
    top:82px;
    right:20px;
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
    @media (max-width: 1199px) {
        top: 90px;
    } 
`;
interface Props {
    mutate: () => void;
    setDismiss: (dismiss: boolean) => void;
}

const MentionOverlay = ({ setDismiss, mutate, ...props }: Props) => {
    let { tab, view, mode, userId, isMobile, league, team, teamName, setLeague, setView, setTab, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, pagetype, slug } = useAppContext();

    const aSlugStoryKey: ASlugStoryKey = { type: "ASlugStory", slug: slug, noLoad: slug == "" ? true : false };
    let { data: aSlugStory } = useSWR(aSlugStoryKey, getASlugStory);
    let astory = aSlugStory;
    const [open, setOpen] = React.useState(astory ? true : false);
    console.log("DIALOG open:", open)
    const { title, url, digest, site_name, image, authors, createdTime, mentions } = astory || {};
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const router = useRouter();
    const admin = params && params.includes('x17nz') ? true : false;

    useEffect(() => {
        if (astory) {
            console.log("openDialog")
            setOpen(true);
        }
    }, [astory]);

    const handleClose = useCallback(() => {
        setOpen(false);
        console.log("closeDialog slug=", slug)
        //let localUrl = router.asPath.replace('&story=' + slug, '').replace('?story=' + slug + "&", '?').replace('?story=' + slug, '');
        //router.push(localUrl);
        recordEvent(`close-story-overlay`, `{"utm_content":"${utm_content}","params":"${params}"}`)
            .then((r: any) => {
                console.log("recordEvent", r);
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
    }, []);

    const remove = useCallback(async () => {
        if (admin) {
            await removeASlugStory(aSlugStoryKey);
            setOpen(false);
            setDismiss(true);
        }
    }, [admin]);

    if (!astory)
        return null;

    return <Dialog disableEscapeKeyDown={true} open={open} fullScreen={fullScreen} PaperProps={{
        style: {
            backgroundColor: isMobile ? 'transparent' : '#555',
            // boxShadow: 'none',
        },
    }} >
        <DialogTitleMobileWrap> <DialogTitle /></DialogTitleMobileWrap>
        <DialogTitleWrap><DialogTitle onClick={() => { setDismiss(true); }}><TitleWrap>Qwiket Sports Media Index</TitleWrap></DialogTitle></DialogTitleWrap>
        <ContentWrap>
            <GotoFeed onClick={() => handleClose()}>Go To Full {league} Digest</GotoFeed>

            <div autoFocus onClick={() => { handleClose(); }}>
                <XContainer><XElement>x</XElement></XContainer>
            </div>
            {admin && <div autoFocus onClick={() => { remove(); }}>
                <XContainer><RElement>R</RElement></XContainer>
            </div>}
        </ContentWrap>
        <ContentWrap>
            <MentionWrap>
                <Story story={astory} handleClose={handleClose} />
            </MentionWrap>
        </ContentWrap>
    </Dialog>
}

export default MentionOverlay;
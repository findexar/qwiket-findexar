import React, { useEffect } from 'react';
import useSWR from 'swr';
import styled from 'styled-components';
import { useRouter } from 'next/navigation'
//import Dialog from '@mui/material/Dialog';
//import DialogTitle from '@mui/material/DialogTitle';
//import useMediaQuery from '@mui/material/useMediaQuery';
//import { useTheme } from '@mui/material/styles';
import { AMentionKey, getAMention, recordEvent, removeAMention } from '@/lib/api';
import Mention from '@/components/func-components/items/mention';
import { useAppContext } from '@/lib/context';

const ContentWrap = styled.div`
    width: 100%;
    height: 100%;
    padding-left:0px;
    padding-right:0px;
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
    width: 30px;
    height:20px;
    display: flex;
    flex-direction: row;
    justify-content:center;
    align-items:center;
    font-size:28px;
    margin-top:-110px;
    color:#fff;
    @media (max-width: 1199px) {
      margin-top:-32px;
      //margin-top:0px;
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
    display:block;
    @media (max-width: 1199px) {
       // display:none;
    }
`;

const DialogTitleMobileWrap = styled.div`
    display:block;
    margin-top:20px;
    @media (min-width: 1200px) {
        display:none;
    }
`;
interface Props {
  mutate: () => void;
  setDismiss: (dismiss: boolean) => void;
}

const MentionOverlay = ({ setDismiss, mutate, ...props }: Props) => {
  const [open, setOpen] = React.useState(false);
  let { fallback,tab, view, mode, userId, isMobile, setLeague, setView, setTab, setPagetype, setTeam, setPlayer, setMode, fbclid, utm_content, params, tp, pagetype, findexarxid } = useAppContext();
  const [xid, setXid] = React.useState<string>(findexarxid || "");

  const key: AMentionKey = { type: "AMention", findexarxid: xid, noLoad: xid !== "" ? false : true };
  const { data: amention, error, isLoading } = useSWR(key, getAMention,{fallback})
  const { date, url, summary, fav, type, league, team, teamName, name } = amention || {};
  //const theme = useTheme();
  //const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  //const router = useRouter();

  const linkType = team ? 'final' : 'top';
  const admin = params && params.includes('x17nz') ? true : false;
  console.log("MentionOverlay:findexarxid", findexarxid)
  useEffect(() => {
    if (amention) {
      setOpen(true);
    }
  }, [amention]);

  useEffect(() => {
    if (findexarxid) {
      setXid(findexarxid);
      setOpen(true);
    }
    else {
      setXid("");
      setOpen(false);
    }
  }, [findexarxid]);

  const handleClose = () => {
    console.log("handleClose")
    setOpen(false);
    setDismiss(true);
    //let localUrl = router.asPath.replace('&id=' + findexarxid, '').replace('?id=' + findexarxid + "&", '?').replace('?id=' + findexarxid, '');
    //router.replace(localUrl);
  }

  let target = type == 'person' ? `${teamName}: ${name}` : `${teamName}`;
  target = !target || target == 'undefined' ? '' : target;

  useEffect(() => {
    const keyDownHandler = (event: any) => {
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

  const remove = async () => {
    if (admin) {
      await removeAMention(key);
      setOpen(false);
      setDismiss(true);
    }
  }
  if (!amention)
    return null;
  return <>{open &&
    <div className='fixed inset-0 z-50 bg-black bg-opacity-25'>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center">
          <div className="relative bg-slate-600 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full md:max-w-2xl md:w-full">
            <div className="bg-black bg-opacity-25 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                 <div className="mt-2">
                    <DialogTitleMobileWrap> </DialogTitleMobileWrap>
                    <DialogTitleWrap>
                        <div className='text-white text-xl md:text-2xl'>{target}</div>
                    </DialogTitleWrap>
                    <ContentWrap>
                      <div autoFocus onClick={() => { handleClose(); }}>
                        <XContainer><XElement>x</XElement></XContainer>
                      </div>
                      {admin && <div autoFocus onClick={() => { remove(); }}>
                        <XContainer><RElement>R</RElement></XContainer>
                      </div>}
                    </ContentWrap>
                    <ContentWrap>
                      <MentionWrap>
                        <Mention handleClose={handleClose} startExtended={true} linkType={linkType} mention={{ findexarxid, date, url, summary, fav, type, team, teamName, league, name }} mutate={mutate} />
                      </MentionWrap>
                    </ContentWrap>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>}</>
}

export default MentionOverlay;
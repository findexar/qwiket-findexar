import React, { useCallback, useEffect } from 'react';
import useSWR from 'swr';
import styled from 'styled-components';
//import { useRouter } from 'next/navigation'


import{AMentionKey} from '@/lib/keys';
import{actionAMention,removeAMention} from '@/lib/fetchers/mention';
import Mention from '@/components/func-components/items/mention';
import { actionRecordEvent } from "@/lib/actions";

import CloseIcon from '@/components/icons/close';
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
    text-align:left;
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
    margin-top:-56px;
    color:#fff;
    @media (max-width: 1024px) {
      margin-top:-32px;
      margin-right:10px;
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

const DialogTitleWrap = styled.div`
    display:block;
   
    @media (max-width: 1024px) {
        display:none;
    }
`;

const DialogTitleMobileWrap = styled.div`
    display:block;
    text-align:left;
    margin-left:16px;
    height:16px;
   // margin-top:20px;
    @media (min-width: 1024px) {
        display:none;
    }
`;
interface Props {
  mutate: () => void;
  setDismiss: (dismiss: boolean) => void;
}

const MentionOverlay = ({ setDismiss, mutate, ...props }: Props) => {

  let { fallback,tab, view, mode, userId, isMobile, setLeague, setView, setTab, setPagetype, setTeamName, setPlayer, setMode, fbclid, utm_content, params, tp, pagetype, findexarxid } = useAppContext();
  const [xid, setXid] = React.useState<string>(findexarxid || "");
  const [open, setOpen] = React.useState(findexarxid?true:false);
  const key: AMentionKey = { type: "AMention", findexarxid: xid };
  const { data: amention, error, isLoading } = useSWR(key, actionAMention,{fallback})
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

  const handleClose = useCallback(() => {
    console.log("handleClose")
    setOpen(false);
    setDismiss(true);
    let newUrl = window.location.href.replace(/([&?])id=[^&]*&?/, '$1').replace(/&$/, '');
    window.history.pushState({ path: newUrl }, '', newUrl);
    //let localUrl = router.asPath.replace('&id=' + findexarxid, '').replace('?id=' + findexarxid + "&", '?').replace('?id=' + findexarxid, '');
    //router.replace(localUrl);
  }, [setOpen, setDismiss]);

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
    <div className='fixed inset-0 z-50 bg-black bg-opacity-25 sm:bg-opacity-50'>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center md:p-4 text-center">
          <div className="relative bg-slate-600 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full md:max-w-2xl md:w-full">
          <div className="md:hidden text-white px-4 py-1"> QWIKET </div>
            <div className="bg-black bg-opacity-25 md:px-4 md:pt-4 md:pb-4 pt-2 pb-2">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-left sm:mt-0 sm:ml-0 sm:text-left">
                 <div className="mt-0">
                    <DialogTitleMobileWrap> <div className='h-4 text-white text-xl md:text-2xl'>{target}</div>
                    </DialogTitleMobileWrap>
                    <DialogTitleWrap>
                        <div className='text-white text-xl md:text-2xl'>{target}</div>
                    </DialogTitleWrap>
                    <ContentWrap>
                      <div autoFocus onClick={() => { handleClose(); }}>
                        <XContainer><XElement><CloseIcon /></XElement></XContainer>
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
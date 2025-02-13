import React from "react";
import useSWR from 'swr';
import { styled } from "styled-components";
import Skeleton from '@/components/util-components/skeleton';
//import { PlayerPhotoKey, getPlayerPhoto } from '@/lib/api';

import { PlayerPhotoKey, actionGetPlayerPhoto } from '@/lib/server-actions/meta-link';

import Avatar from '@/components/util-components/avatar';
import { useAppContext } from "@/lib/context";


const Photo = styled.div`
    height:60px;
    width:60px;
    margin-top:-10px;
    @media screen and (max-width: 1199px ){
        display:none
    }
`;
const MobilePhoto = styled.div`
    height:60px;
    width:auto;
    //width:40px;
    @media screen and (min-width: 1200px ){
        display:none;
    }
`;
interface Props {
    name: string;
    teamid: string;
}

const PlayerPhoto: React.FC<Props> = (props) => {
    const { teamid, name } = props;
    const { fallback } = useAppContext();
    const photoKey: PlayerPhotoKey = { type: "get-player-photo", teamid: teamid || "", name: name || "" };
    const { data: photo, error, isLoading } = useSWR(
        photoKey,
        actionGetPlayerPhoto,
        { fallback }
    );

    /*if (isLoading || !photo) return (
        <Skeleton variant="circular" height="40px" width="40px" />
    )*/
    return (<>
        {photo && <Photo className="text-xs"><Avatar size="large" alt={name}><img src={photo} alt={name} /></Avatar></Photo>}
        {photo && <MobilePhoto className="text-xs"><Avatar size="medium" alt={name}><img src={photo} alt={name} /></Avatar></MobilePhoto>}
    </>
    );
};

export default PlayerPhoto;
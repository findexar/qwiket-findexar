import React from "react";
import useSWR from 'swr';
import { styled } from "styled-components";
import Skeleton from '@/components/util-components/skeleton';
import { PlayerPhotoKey, getPlayerPhoto } from '@/lib/api';
import Avatar from '@/components/util-components/avatar';

const Photo = styled.div`
    height:60px;
    width:60px;
    margin-top:-10px;
    @media screen and (max-width: 1199px ){
        display:none
    }
`;
const MobilePhoto = styled.div`
    height:40px;
    width:40px;
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
    const photoKey: PlayerPhotoKey = { func: "photo", teamid: teamid || "", name: name || "" };
    const { data: photo, error, isLoading } = useSWR(photoKey, getPlayerPhoto);

    /*if (isLoading || !photo) return (
        <Skeleton variant="circular" height="40px" width="40px" />
    )*/
    return (<>
        {!isLoading && photo && <Photo className="text-xs"><Avatar size="large"  alt={name}><img src={photo} alt={name} /></Avatar></Photo>}    
        {!isLoading && photo && <MobilePhoto className="text-xs"><Avatar size="small" alt={name}><img src={photo} alt={name} /></Avatar></MobilePhoto>}
    </>
    );
};

export default PlayerPhoto;
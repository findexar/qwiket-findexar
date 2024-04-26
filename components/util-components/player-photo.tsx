import React from "react";
import useSWR from 'swr';
import { styled } from "styled-components";
import Skeleton from '@mui/material/Skeleton';
import { PlayerPhotoKey, getPlayerPhoto } from '@/lib/api';
import Avatar from '@mui/material/Avatar';

const Photo = styled.div`
    height:60px;
    width:60px;
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

    if (isLoading || !photo) return (
        <Skeleton variant="circular" animation="pulse" height={40} />
    )
    return (<>
        <Photo><Avatar sx={{ width: 60, height: 60 }} src={photo} alt={name}></Avatar></Photo>
        <MobilePhoto><Avatar sx={{ width: 40, height: 40 }} src={photo} alt={name}></Avatar></MobilePhoto>
    </>
    );
};

export default PlayerPhoto;
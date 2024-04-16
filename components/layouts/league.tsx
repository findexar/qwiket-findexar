import React from 'react';
import Header from './header';
import MainBody from './main-league-body';

interface LeagueLayoutProps{
    isMobile:boolean,
    fbclid:string,
    utm_content:string,
    story:string,
    findexarxid:string,
    league:string

}
const LeagueLayout:React.FC<LeagueLayoutProps>=({isMobile,fbclid,utm_content,story,findexarxid,league})=>{
    return (<><Header/><MainBody/></>)
}
export default LeagueLayout;
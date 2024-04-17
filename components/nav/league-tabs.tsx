'use client';
import React from 'react';
import { useRouter } from 'next/navigation'
import useSWR from 'swr';
import {LeaguesKey} from '@/lib/keys';
import fetchLeagues from '@/lib/fetchers/leagues';
import {HomeIcon as Home} from '@heroicons/react/24/outline';

interface LeagueTabsProps{
    fallback:any,
}
const LeagueTabs:React.FC<LeagueTabsProps>=({fallback})=>{
    const router = useRouter();
    const key:LeaguesKey={type:"leagues"};
    const { data, error } = useSWR(key,fetchLeagues,{fallback});
    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>
    const tabs= data.map((tab:any) => {
        return <div key={`${tab}.tab`} className="hover:cursor-pointer p-2 md:p-2  md:text-lg"
        onClick={
            ()=>{
                router.replace(`/${tab.toLowerCase()}`);
        } }
        >{tab}</div>
    })
    tabs.unshift(<div onClick={
        ()=>{
            router.replace('/');
    } }
        key="home.tab" className="hover:cursor-pointer p-2 md:py-3 "><Home className="h-6 w-6"/></div>)
  //  tabs.push(<div key="blah.tab" className="p-4">BLAH</div>)
    return <div className="w-full px-2 md:px-8 flex flex-row justify-between dark:bg-slate-950 bg-slate-900 text-white">
       {tabs}
    </div>
}
export default LeagueTabs;
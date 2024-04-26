'use client';
import React from 'react';
import { useRouter } from 'next/navigation'
import useSWR from 'swr';
import {LeaguesKey} from '@/lib/keys';
import fetchLeagues from '@/lib/fetchers/leagues';
import {HomeIcon as Home} from '@heroicons/react/24/outline';
import{useAppContext} from '@/lib/context';

interface LeagueTabsProps{
    fallback:any,
}
const LeagueTabs:React.FC<LeagueTabsProps>=({fallback})=>{
   const context=useAppContext();
   const {league,setLeague}=context;
    console.log("context",context)
    const router = useRouter();
    const key:LeaguesKey={type:"leagues"};
    const { data, error } = useSWR(key,fetchLeagues,{fallback});
    if (error) return <div>failed to load</div>
    if (!data) return <div>loading...</div>
    const tabs= data.map((tab:any) => {
        console.log("tab",tab,league.toUpperCase())
        const selected=tab===league.toUpperCase();
        return <div key={`${tab}.tab`} className={`hover:cursor-pointer md:pt-0 md:text-lg ${selected?'text-yellow-300':'text:white'}`}
        onClick={
            ()=>{
                setLeague(tab);
                router.replace(`/${tab.toLowerCase()}`);
        } }
        >{tab}</div>
    })
    tabs.unshift(<div onClick={
        ()=>{
            setLeague("");
            router.replace('/');
    } }
        key="home.tab" className={`hover:cursor-pointer pt-1 md:pt-1 ${league==""?'text-yellow-300':'white'}`}><Home className="h-4 w-4 md:h-5 md:w-5"/></div>)
  //  tabs.push(<div key="blah.tab" className="p-4">BLAH</div>)
    return <div className="w-full pl-2 pr-8 md:pl-8 flex flex-row justify-between dark:bg-slate-950 bg-slate-900 text-white">
       {tabs}
    </div>
}
export default LeagueTabs;
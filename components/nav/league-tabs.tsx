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
        return <div key={`${tab}.tab`} className={`hover:cursor-pointer p-2 md:pt-3 md:text-lg ${selected?'text-yellow-300':'text:white'}`}
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
        key="home.tab" className={`hover:cursor-pointer p-2 md:py-3 ${league==""?'text-yellow-300':'white'}`}><Home className="h-6 w-6"/></div>)
  //  tabs.push(<div key="blah.tab" className="p-4">BLAH</div>)
    return <div className="w-full px-2 md:px-8 flex flex-row justify-between dark:bg-emerald-950 bg-slate-900 text-white">
       {tabs}
    </div>
}
export default LeagueTabs;
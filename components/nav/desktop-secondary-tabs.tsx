'use client';
import React from 'react';
import { useRouter } from 'next/navigation'
import useSWR from 'swr';
import {LeaguesKey} from '@/lib/keys';
import fetchLeagues from '@/lib/fetchers/leagues';
import {HomeIcon as Home} from '@heroicons/react/24/outline';
import{useAppContext} from '@/lib/context';
import { usePathname } from 'next/navigation'

const LeagueTabs:React.FC=()=>{
   const context=useAppContext();
   const pathname=usePathname();
   console.log("pathname",pathname);
   const {league,setTab,fallback,tab:selectedTab,utm_content,view}=context;
    console.log("context",context)
    const router = useRouter();
    const data=[{name:`${league}${league?' ':''} Stories`,id:''},{name:'My Feed',id:'myteam'},{id:'fav',name:'My Favorites'}]
    
    const tabs= data.map((tab:any) => {
        console.log("tab=>",tab.id,selectedTab)
        const selected=tab.id===selectedTab;
        return <div key={`${tab.id}.tab`} className={`box-border w-40 ${selected?'border-b-2 dark:border-blue-400 border-blue-800':''} hover:cursor-pointer transition-all duration-300 md:pt-3 md:text-lg ${selected?'text-green-800 dark:text-yellow-400':''}`}
        onClick={
            ()=>{
                setTab(tab.id);
                router.replace(`${pathname}${tab.id?`?tab=${tab.id.toLowerCase()}${utm_content||view!='mentions'?`&`:``}`:utm_content||view?`?`:``}${view!='mentions'?`view=${view}${utm_content?`&`:``}`:``} ${utm_content?`utm_content=${utm_content}`:``}`);
        } }
        >{tab.name}</div>
    })
    
    return <div className="box-border w-full px-2 md:px-8 flex flex-row justify-between">
       {tabs}
    </div>
}
export default LeagueTabs;
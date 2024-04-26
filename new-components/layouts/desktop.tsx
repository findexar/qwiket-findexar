'use client';
import React from 'react';
import{useAppContext} from '@/lib/context';
import Welcome from '@/components/func/welcome';
import Teams from '@/components/func/teams';   
import Stories from '@/components/func/stories'; 
import SecondaryTabs from '@/components/nav/desktop-secondary-tabs';
import StickyColumn from '@/components/nav/sticky-column';

const Desktop: React.FC = () => {
    const {pagetype,league,tab}=useAppContext();
    return <div className=" size-full hidden md:grid md:grid-cols-11 md:gap-2">
        <div className="col-span-3   ">{league==''?<StickyColumn slot={0}><Welcome/></StickyColumn>:<StickyColumn slot={1}><Teams/></StickyColumn>}</div>
        <div className="col-span-5"><SecondaryTabs/>{tab==''&&<Stories/>}</div>
        <div className="col-span-3">Column Right<hr/></div>

    </div>
}
export default Desktop;
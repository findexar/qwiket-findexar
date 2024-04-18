'use client';
import React from 'react';
import{useAppContext} from '@/lib/context';
import Welcome from '@/components/func/welcome';
import Teams from '@/components/func/teams';    

const Desktop: React.FC = () => {
    const {pagetype,league}=useAppContext();
    return <div className=" size-full hidden md:grid md:grid-cols-11 md:gap-2">
        <div className="col-span-3">{league==''?<Welcome/>:<Teams/>}</div>
        <div className="col-span-5">Column Center</div>
        <div className="col-span-3">Column Right<hr/></div>

    </div>
}
export default Desktop;
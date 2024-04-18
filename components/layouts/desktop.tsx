'use client';
import React from 'react';
import{useAppContext} from '@/lib/context';

const Desktop: React.FC = () => {
    const {pagetype}=useAppContext();
    return <div className=" size-full hidden md:grid md:grid-cols-11 md:gap-2">
        <div className="col-span-3">Column Left<hr/></div>
        <div className="col-span-5">Column Center</div>
        <div className="col-span-3">Column Right<hr/></div>

    </div>
}
export default Desktop;
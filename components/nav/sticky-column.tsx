// components/StickyColumn.tsx
import React, { useEffect, useRef, useState,useCallback } from 'react';

interface StickyColumnProps {
    children: React.ReactNode;
    slot:number
}
let prevScrollY=[0,0,0];
const StickyColumn: React.FC<StickyColumnProps> = ({ children,slot }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [isSticky, setIsSticky] = useState(false);


    const handleScroll = useCallback(() => {
        if (!ref.current) return;
        const scrollY=window.scrollY;
        console.log(`${slot} scrollY`,scrollY,prevScrollY)
        if(scrollY<prevScrollY[slot]&&scrollY<window.innerHeight){
            console.log(`${slot} set isSticky false`)
            setIsSticky(false);
            prevScrollY[slot]=scrollY;
           
            return;
        }
        prevScrollY[slot]=scrollY;
        const { bottom } = ref.current.getBoundingClientRect();
        if (bottom < window.innerHeight) {
            console.log(`${slot} setSticky true`,bottom,window.innerHeight,ref)
            setIsSticky(true);
        } else {
            console.log(`${slot}  setSticky false`,bottom,window.innerHeight,ref)
            setIsSticky(false);
        }
    },[ref,isSticky,prevScrollY]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={`${isSticky?'':'sticky top-90'} ${isSticky ? 'fixed bottom-0' : ''}`}>
            <div ref={ref}>
            {children}
            </div>
        </div>
    );
};

export default StickyColumn;

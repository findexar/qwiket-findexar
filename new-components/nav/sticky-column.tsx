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
    const [scrollDir,setScrollDir]=useState('down');


    const handleScroll = useCallback(() => {
        if (!ref.current) return;
        const scrollY=window.scrollY;
        console.log(`${slot} scrollY`,scrollY,prevScrollY,scrollDir)
        if((scrollY<prevScrollY[slot])&&scrollDir=='down'){
            setScrollDir('up');
           console.log(`${slot} set scroll Dir up`)
            // console.log(`${slot} set isSticky false`)
          //  setIsSticky(false);
            prevScrollY[slot]=scrollY;
           
           return;
        }
        if((scrollY>prevScrollY[slot])&&scrollDir=='up'){
            setScrollDir('down');
            console.log(`${slot} set scroll Dir down`)
           
        }
        prevScrollY[slot]=scrollY;
        /*prevScrollY[slot]=scrollY;
        const { bottom } = ref.current.getBoundingClientRect();
        console.log(`${slot} bottom`,bottom,window.innerHeight,ref)
        if ((bottom < scrollY)&&scrollDir=='down') {
            console.log(`${slot} setSticky ==>true`,scrollDir,bottom,window.innerHeight,ref)
            setIsSticky(true);
        } else {
           // console.log(`${slot}  setSticky==> false`,bottom,window.innerHeight,ref)
           // setIsSticky(false);
        }*/
    },[ref,isSticky,prevScrollY]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
             <div ref={ref} className="relative flex flex-column h-full" >
                <div className="sticky flex-grow-0 flex-shrink-0 "  style={scrollDir=='up'?{bottom:0,flexBasis:"auto"}:{top:-390,flexBasis:"auto"}}>
            {children}
            </div>
            <div  style={{flexGrow:1,flexShrink:0,flexBasis:"auto"}}></div>
            </div>
       
    );
};

export default StickyColumn;

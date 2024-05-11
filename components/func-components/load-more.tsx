import React, { useEffect, useState, useRef } from "react";

import useIntersectionObserver from '@/lib/use-intersection-observer';
import Button from '@/components/func-components/button';
import IconReload from '@/components/icons/reload';

interface Props {
    isLoadingMore: boolean;
    isReachingEnd: boolean;
    size: number;
    setSize: any;
    name?:string;
    items?:any[];
}

const LoadMore: React.FC<Props> = ({ isLoadingMore, isReachingEnd, setSize, size,name,items=[] }) => {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null)
    const entry = useIntersectionObserver(ref, {});
    const isVisible = !!entry?.isIntersecting || false;
    name=name||"stories";

    useEffect(() => {
        if (isVisible) {
            if (!visible) {
                setVisible(true);
                setSize(size + 1);
            }
        }
        else {
            if (visible)
                setVisible(false);
        }
    }, [isVisible, entry, ref]);

    return <div ref={ref} >
        <Button className="m-1" onClick={() => setSize(size + 1)}>
            {isLoadingMore
                ? "loading..."
                : isReachingEnd
                    ? (items.length>0?`no more ${size} ${name}`:<IconReload />)
                    : "load more"}
        </Button></div>
}

export default LoadMore;

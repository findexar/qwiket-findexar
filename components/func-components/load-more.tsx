import React, { useEffect, useState, useRef } from "react";

import useIntersectionObserver from '@/lib/use-intersection-observer';
import Button from '@/components/util-components/button';
import IconReload from '@/components/icons/reload';

interface Props {
    isLoadingMore: boolean;
    isReachingEnd: boolean;
    size: number;
    setSize: any;
    name?: string;
    items?: any[];
}

const LoadMore: React.FC<Props> = ({ isLoadingMore, isReachingEnd, setSize, size, name, items = [] }) => {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null)
    const entry = useIntersectionObserver(ref, {
        rootMargin: '50px',
        threshold: 0
    });
    const isVisible = !!entry?.isIntersecting;
   // console.log("load-more isVisible", isVisible)
    name = name || "stories";

   /* useEffect(() => {
        console.log("Intersection state:", {
            entry,
            isVisible,
            ref: ref.current
        });
    }, [entry, isVisible]);*/

    useEffect(() => {
        if (isVisible && !isLoadingMore && !isReachingEnd) {
            setVisible(true);
            setSize(size + 1);
        } else {
            setVisible(false);
        }
    }, [isVisible, isLoadingMore, isReachingEnd]);

    return <div ref={ref} >
        <Button className="m-1" onClick={() => setSize(size + 1)}>
            {isLoadingMore
                ? "loading..."
                : isReachingEnd
                    ? (items.length > 0 ? `no more ${name}` : <IconReload />)
                    : "load more"}
        </Button></div>
}

export default LoadMore;

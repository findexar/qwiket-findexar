import React, { useEffect, useState, useRef } from "react";

import useIntersectionObserver from '@/lib/use-intersection-observer';

interface Props {
    isLoadingMore: boolean;
    isReachingEnd: boolean;
    size: number;
    setSize: any;
    name?:string;
}

const LoadMore: React.FC<Props> = ({ isLoadingMore, isReachingEnd, setSize, size,name }) => {
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

    return <div ref={ref}>
        <button style={{ padding: 4, marginTop: 20 }} onClick={() => setSize(size + 1)}>
            {isLoadingMore
                ? "loading..."
                : isReachingEnd
                    ? `no more ${name}`
                    : "load more"}
        </button></div>
}

export default LoadMore;

import React, { useEffect, useState, useRef } from "react";
import Button from '@mui/material/Button';
import useIntersectionObserver from '@/lib/use-intersection-observer';

interface Props {
    isLoadingMore: boolean;
    isReachingEnd: boolean;
    size: number;
    setSize: any;
}

const LoadMore: React.FC<Props> = ({ isLoadingMore, isReachingEnd, setSize, size }) => {
    const [visible, setVisible] = useState(false);
    const ref = useRef<HTMLDivElement | null>(null)
    const entry = useIntersectionObserver(ref, {});
    const isVisible = !!entry?.isIntersecting || false;

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
        <Button style={{ padding: 4, marginTop: 20 }} onClick={() => setSize(size + 1)} variant="outlined">
            {isLoadingMore
                ? "loading..."
                : isReachingEnd
                    ? `no more stories`
                    : "load more"}
        </Button></div>
}

export default LoadMore;

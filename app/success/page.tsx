'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/lib/context';

export default function Success() {


    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>

                <h1>Thank you for your purchase!</h1>
                <p>We&apos;re processing your payment. You&apos;ll be redirected shortly.</p>
            </Suspense>
        </div>
    );
}
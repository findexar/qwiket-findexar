'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/lib/context';
function SearchParamsWrapper() {
    const searchParams = useSearchParams();
    const sessionId = searchParams?.get('session_id');
    const router = useRouter();
    // const { updateUser } = useAppContext();

    useEffect(() => {
        if (sessionId) {
            // Verify the session and update the user's subscription

        }
    }, [sessionId, router]);

    return null; // This component does not render anything
}

export default function Success() {


    return (
        <div>
            <Suspense fallback={<div>Loading...</div>}>
                <SearchParamsWrapper />
                <h1>Thank you for your purchase!</h1>
                <p>We&apos;re processing your payment. You&apos;ll be redirected shortly.</p>
            </Suspense>
        </div>
    );
}
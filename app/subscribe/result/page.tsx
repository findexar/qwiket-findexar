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
            fetch('/api/verify-session', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ sessionId }),
            })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        // updateUser(data.user);
                        // Redirect to dashboard or show success message
                        router.push('/account/dashboard');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    }, [sessionId, router]);

    return null; // This component does not render anything
}

export default function Success() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchParamsWrapper />
            <div>
                <h1>&quot;Thank you for your purchase!&quot;</h1>
                <p>&quot;We&apos;re processing your payment. You&apos;ll be redirected shortly.&quot;</p>
            </div>
        </Suspense>
    );
}
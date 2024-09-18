'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppContext } from '@/lib/context';

export default function Success() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionId = searchParams?.get('session_id');
    //  const { updateUser } = useAppContext();

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

    return (
        <div>
            <h1>&quot;Thank you for your purchase!&quot;</h1>
            <p>&quot;We&apos;re processing your payment. You&apos;ll be redirected shortly.&quot;</p>
        </div>
    );
}
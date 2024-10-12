import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware } from '@clerk/nextjs/server';

// Function to block specific user agent
function blockUserAgent(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';
    if (userAgent.toLowerCase().includes('newsline.world')) {
        return new NextResponse('Access denied', { status: 403 });
    }
    return null;
}

// Wrap clerkMiddleware to include user agent blocking
const middleware = clerkMiddleware((auth, request) => {
    const blockResponse = blockUserAgent(request);
    if (blockResponse) {
        return blockResponse;
    }
    // Continue with the default Clerk middleware behavior
    return NextResponse.next();
});

export default middleware;

export const config = {
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

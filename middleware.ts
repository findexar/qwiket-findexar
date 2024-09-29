import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware({
    debug: true,
});

export const config = {
    debug: true,
    matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};

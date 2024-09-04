import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware()


export const config = {
    // matcher: ['/((?!.+\\.[\\w]+$|_next).*)','/',  '/(api|trpc)(.*)'],
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        "/pro(.*)"]

};

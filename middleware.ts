import { authMiddleware } from "@clerk/nextjs";
const matchRoute = (req: any): boolean => {
    console.log('=============>', req.url);
    return true;
}
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
/*export default authMiddleware({
    debug: true,
    publicRoutes: ["/sign-in", "/sign-up", "/api(.*)", "/pro(.*)", "/(.*)", "/chat"],
    //debug:true

});*/
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware()


export const config = {
    // matcher: ['/((?!.+\\.[\\w]+$|_next).*)','/',  '/(api|trpc)(.*)'],
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        "/pro(.*)"]

};

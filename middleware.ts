import { authMiddleware } from "@clerk/nextjs";
 const matchRoute=(req:any):boolean=>{
        console.log('=============>',req.url);
return true;
 }
// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/references/nextjs/auth-middleware for more information about configuring your Middleware
export default authMiddleware({
    publicRoutes: ["/","/sign-in","/sign-up","/api(.*)","/pub(.*)","/pro(.*)","/(.*)"],
    //debug:true

});
 
export const config = {
 // matcher: ['/((?!.+\\.[\\w]+$|_next).*)','/',  '/(api|trpc)(.*)'],
 matcher:['/((?!.+\\.[\\w]+$|_next).*)', "/pro(.*)"]
};
 
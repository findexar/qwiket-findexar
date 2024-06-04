'use server';
import { unstable_serialize } from 'swr'
import { UserSubscriptionKey } from '@/lib/keys';
import { auth, currentUser } from "@clerk/nextjs/server";
const api_key = process.env.LAKE_API_KEY;;
export const getUserSubscription = async (userId: string, email: string):Promise<{subscrLevel:number}> => {
    try {
        let url = '';
        url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/user/get-user-subscription?userId=${userId}&email=${email}&api_key=${api_key}`;
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        console.log("fetching user subscription",url,data);
        if(data.success){
            console.log("===>GET USER SUBSCRIPTION",data.subscription);
            return data.subscription as{subscrLevel:number};
        }
       throw new Error("Failed to get user subscription");
    }
    catch (e) {
        console.log("getAMention", e);
        throw new Error("Failed to get user subscription");
    }
}

const promiseUserSubscription = async (key: UserSubscriptionKey, userId: string, email: string) => {
    return { key: unstable_serialize(key), call:  getUserSubscription(userId, email) };
}
export const actionUserSubscription = async (key: UserSubscriptionKey):Promise<{subscrLevel:number}> => {
    'use server';
    let { userId } = auth();

    if (!userId) {
        userId = "";
    }
    if (!userId) {
        return {subscrLevel:0};
    }

    const user = await currentUser();
    const email = user?.emailAddresses[0]?.emailAddress||"";

    return getUserSubscription( userId, email);
}
export default promiseUserSubscription;

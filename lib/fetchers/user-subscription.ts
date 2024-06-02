'use server';
import { unstable_serialize } from 'swr'
import { UserSubscriptionKey } from '@/lib/keys';
export const getUserSubscription = async ({ type, userId,email }: UserSubscriptionKey) => {
    try {
        let url = '';
        url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/user/get-user-subscription?userId=${userId}&email=${email}`;
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        return data.mention;
    }
    catch (e) {
        console.log("getAMention", e);
        return false;
    }
}

const promiseUserSubscription = async (key: UserSubscriptionKey) => {
    return { key: unstable_serialize(key), call: await getUserSubscription(key) };
}
export const actionUserSubscription = async (key: UserSubscriptionKey) => {
    'use server';
    return getUserSubscription(key);
}
export default promiseUserSubscription;

'use server';
import { unstable_serialize } from 'swr'
import { AMentionKey, MetaLinkKey } from '@/lib/keys';
export const getAMention = async ({ type, findexarxid }: AMentionKey) => {
    try {
        let url = '';
        url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-mention?findexarxid=${findexarxid}`;
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        return data.mention;
    }
    catch (e) {
        console.log("getAMention", e);
        return false;
    }
}
export const removeAMention = async ({ type, findexarxid }: AMentionKey) => {
    try {
        let url = '';
        url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/remove-mention?findexarxid=${findexarxid}`;
        const fetchResponse = await fetch(url);
        const data = await fetchResponse.json();
        return data.mention;
    }
    catch (e) {
        console.log("removeAMention", e);
        return false;
    }
}
const promiseAMention = async (key: AMentionKey) => {
    return { key: unstable_serialize(key), call: getAMention(key) };
}
export const actionAMention = async (key: AMentionKey) => {
    'use server';
    return getAMention(key);
}
export default promiseAMention;

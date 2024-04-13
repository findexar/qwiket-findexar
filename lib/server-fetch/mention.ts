import { unstable_serialize } from 'swr'
import { AMentionKey,MetaLinkKey } from '@/lib/api';
const getAMention = async ({ type, findexarxid, noLoad }: AMentionKey) => {
    try {
        if (noLoad) return null;
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
const promiseAMention=(key:AMentionKey)=>{
  return { key: unstable_serialize(key), call: getAMention(key) };
}
export default promiseAMention;

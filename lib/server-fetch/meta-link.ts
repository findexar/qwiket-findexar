import { unstable_serialize } from 'swr'
import { MetaLinkKey } from '@/lib/keys';

const getMetaLink = async ({ func, findexarxid, long = 0 }: MetaLinkKey) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-meta-link?xid=${findexarxid}&long=${long}`;
  
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.meta;
    }
    catch (e) {
      console.log("getMeta", e);
      return false;
    }
  }
const promiseAMetaLink=(key:MetaLinkKey)=>{
  return { key: unstable_serialize(key), call: getMetaLink(key) };
}
export default promiseAMetaLink;

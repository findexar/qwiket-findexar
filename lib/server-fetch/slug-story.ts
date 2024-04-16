import { unstable_serialize } from 'swr'
import { ASlugStoryKey } from '@/lib/keys';
const api_key=process.env.LAKE_API_KEY;;
const getASlugStory = async ({slug }: ASlugStoryKey) => {
    try {
      let url = '';
      url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-slug-story?slug=${slug}&api_key=${api_key}`;
      const fetchResponse= await fetch(url);
      const data = await fetchResponse.json();
      return data.story;
    }
    catch (e) {
      console.log("getASlugStory", e);
      return false;
    }
  }
const promiseASlugStory=(key:ASlugStoryKey)=>{
  return { key: unstable_serialize(key), call: getASlugStory(key) };
}
export default promiseASlugStory;
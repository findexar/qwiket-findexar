'use server';
import { unstable_serialize } from 'swr'
import { ASlugStoryKey } from '@/lib/keys';
const api_key=process.env.LAKE_API_KEY;;
export const getASlugStory = async ({slug }: ASlugStoryKey) => {
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
  export const removeASlugStory = async ({ type, slug}: ASlugStoryKey) => {
    try {

      console.log("api: removeASlugStory", type, slug)
      let url = '';
      url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/remove-slug-story?slug=${slug}`;
      const fetchResponse= await fetch(url);
      const data = await fetchResponse.json();
      return data.success;
    }
    catch (e) {
      console.log("removeASlugStory", e);
      return false;
    }
  } 
const promiseASlugStory=async (key:ASlugStoryKey)=>{
  return { key: unstable_serialize(key), call: getASlugStory(key) };
}
export const actionASlugStory = async (key:ASlugStoryKey)=>{
  'use server';
  return getASlugStory(key);
}
export default promiseASlugStory;


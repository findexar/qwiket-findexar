'use server';
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
const promiseAMetaLink = async (key: MetaLinkKey) => {
  return { key: unstable_serialize(key), call: getMetaLink(key) };
}
export const actionMetaLink = async (key: MetaLinkKey) => {
  'use server';
  return await getMetaLink(key);
}
export default promiseAMetaLink;

export type PlayerPhotoKey = { type: string, name: string, teamid: string };

export const getPlayerPhoto = async ({ type, name, teamid }: PlayerPhotoKey) => {
  try {
    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-player-photo?name=${encodeURIComponent(name)}&teamid=${encodeURIComponent(teamid)}`;
    const fetchResponse = await fetch(url);
    const data = await fetchResponse.json();
    return data.photo;
  }
  catch (e) {
    console.log("getPlayerPhoto", e);
    return '';
  }
}
export const actionGetPlayerPhoto = async (key: PlayerPhotoKey) => {
  console.log("909090909   actionGetPlayerPhoto", key);
  return await getPlayerPhoto(key);
}
export const promiseGetPlayerPhoto = async ({ name, teamid }: { name: string, teamid: string }) => {
  const type = "get-player-photo";
  console.log("SSR promiseGetPlayerPhoto", name, teamid);
  let keyPhoto: PlayerPhotoKey = { type, teamid, name }
  console.log("SSR PhotoKey:", keyPhoto);
  return { key: unstable_serialize(keyPhoto), call: getPlayerPhoto(keyPhoto) };
}
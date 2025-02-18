'use server';
import { BlogArticlesKey, BlogArticleKey } from "@/lib/keys";
import { unstable_serialize } from 'swr'
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, SessionData } from "@/lib/session";
import { auth } from "@clerk/nextjs/server";
import { getAllArticles, getArticle } from "../contentful-api";

//const articles = await getAllArticles();

const lake_api = process.env.NEXT_PUBLIC_LAKEAPI
const api_key = process.env.LAKE_API_KEY;;
interface FetchArticlesProps {
    // userId: string;
    // sessionid: string;
    key: BlogArticlesKey;
}

const fetchArticles = async (key: BlogArticlesKey) => {
    let { page } = key;
    const articles = await getAllArticles();
    console.log("fetchArticles", articles)
    return articles;
}

export const promiseFetchBlogArticles = async (key: BlogArticlesKey): Promise<any> => {
    //  console.log("promiseStories", userId, sessionid, league);
    let keyFetchBlogArticles = (page: any) => {
        const keyFetchedStories: BlogArticlesKey = { type: "fetch-blog-articles", page: page }
        return keyFetchedStories;
    };
    // return fetchArticles(keyFetchBlogArticles(0));

    console.log("BlogArticlesKey:", keyFetchBlogArticles(0));
    return { key: unstable_serialize(keyFetchBlogArticles(0)), call: fetchArticles(keyFetchBlogArticles(0)) };
}

export const actionFetchBlogArticles = async (key: BlogArticlesKey) => {

    // const session = await fetchSession();

    //const { userId } = await auth() || { userId: "" };

    //const sessionid = session.sessionid;
    console.log("CLIENTactionFetchBlogArticles", key)
    return fetchArticles(key);
}
const fetchArticle = async (key: BlogArticleKey): Promise<any> => {
    let { slug } = key;
    const article = await getArticle(slug);
    console.log("fetchArticle", article);
    return article;
}

export const actionFetchBlogArticle = async (key: BlogArticleKey) => {
    return await fetchArticle(key);
}

const promiseFetchBlogArticle = async (key: BlogArticleKey) => {
    //  console.log("promiseStories", userId, sessionid, league);

    // return fetchArticles(keyFetchBlogArticles(0));

    // console.log("BlogArticlesKey:", keyFetchBlogArticles(0));
    console.log("SSR promiseFetchBlogArticle", key)
    return { key: unstable_serialize(key), call: fetchArticle(key) };
}
export default promiseFetchBlogArticle;

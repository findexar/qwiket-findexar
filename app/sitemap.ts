import type { MetadataRoute } from 'next'

type SitemapItem = {
    url: string;
    lastModified: string | Date;
    changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
    priority: number;
}
type SourceItem = {
    updatedTime: string;
    name: string;
    league: string;
    type: string;
    team: string;
    athleteUUId: string;
}
//max(i.timestamp) as updatedTime, a.league, f.name, f.team, f.athleteUUId 
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {

    const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/get-sitemap`;
    // console.log("record-event:",url)
    //i.timestamp,i.promptUUId, i.search_key,i.pageUUId, a.mention_xid, a.prompt, a.league, f.type, f.team, f.athleteUUId 
    console.log(`start sitemap fetch`, url)
    const fetchResponse = await fetch(url);

    const res = await fetchResponse.json();
    console.log(`end sitemap fetch`, res.success)
    const items = res.items as SourceItem[];
    const sitemap = items.map((item: SourceItem) => {
        let url = `${process.env.NEXT_PUBLIC_SERVER}/${item.league}/${item.team}/${item.athleteUUId ? `${item.name}/${item.athleteUUId}/` : ''}?tab=prompts`;
        console.log(url)
        return {
            url: url,
            lastModified: new Date(item.updatedTime),
            changeFrequency: 'always' as const,
            priority: 1,
        }
    });
    return sitemap;
} 
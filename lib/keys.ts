export type FetchStoriesKey = { type: string, league?: string, noUser: boolean, page: number, firstXid?: string };
export type FetchMyFeedKey = { type: string, league?: string, noUser: boolean, page: number };  
export type ASlugStoryKey = { type: string, slug: string};
export type AMentionKey = { type: string, findexarxid: string };
export type FavoritesKey = { type: string, league?: string, noUser: boolean, page: number };
export type TeamPlayersKey = { type: string, league: string; teamid: string };
export type MyTeamRosterKey = { type: string, league: string, noUser: boolean};
export type PlayerPhotoKey = { func: string, name: string, teamid: string };
export type MetaLinkKey = { func: string, findexarxid: string, long?: number };
export type LeagueTeamsKey = { func: string, league: string};
     
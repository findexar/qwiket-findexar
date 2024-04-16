export type FetchStoriesKey = { type: string, league?: string, noUser: boolean, page: number, noLoad: boolean, firstXid?: string };
export type FetchMyFeedKey = { type: string, league?: string, noUser: boolean, page: number, teamid: string, name: string, myteam: number, noLoad: boolean };
  
export type ASlugStoryKey = { type: string, slug: string, noLoad: boolean };
export type AMentionKey = { type: string, findexarxid: string, noLoad: boolean };
export type FavoritesKey = { type: string, league?: string, noUser: boolean, page: number };

export type TeamPlayersKey = { type: string, league: string; teamid: string };
export type MyTeamRosterKey = { type: string, league: string, noUser: boolean, noLoad: boolean };

export type PlayerPhotoKey = { func: string, name: string, teamid: string };
export type MetaLinkKey = { func: string, findexarxid: string, long?: number };
   
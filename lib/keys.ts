
export type FetchMyFeedKey = { type: string, league?: string, page: number };
export type ASlugStoryKey = { type: string, slug: string };
export type AMentionKey = { type: string, findexarxid: string };
export type FavoritesKey = { type: string, league?: string, page: number };
export type TeamPlayersKey = { type: string, teamid: string };
export type MyTeamRosterKey = { type: string, league: string, };
export type PlayerPhotoKey = { func: string, name: string, athleteUUId: string, teamid: string };
export type MetaLinkKey = { func: string, findexarxid: string, long?: number };
export type LeagueTeamsKey = { type: string, league: string };
export type LeaguesKey = { type: string };
export type StoriesKey = { type: string, league?: string, page: number, firstXid?: string };
export type TeamMentionsKey = { type: string, league?: string, teamid: string, page: number };
export type PlayerMentionsKey = { type: string, league?: string, teamid: string, name: string, athleteUUId: string, page: number };
export type MyTeamKey = { type: string, league: string };
export type UserSubscriptionKey = { type: string };
export type MyChatsKey = { type: string, league: string, teamid: string, athleteUUId: string, page: number };
export type ChatKey = { type: string, chatUUId: string };
export type CreateChatKey = { type: string, chatUUId?: string, league?: string, teamid?: string, athleteUUId?: string, fantasyTeam?: boolean };
export type UserAccountKey = { type: string, email: string };



export type FetchMyFeedKey = { type: string, league?: string, page: number };
export type ASlugStoryKey = { type: string, slug?: string, m?: string };
export type AMentionKey = { type: string, findexarxid?: string, m?: string };
export type FavoritesKey = { type: string, league?: string, page: number };
export type TeamPlayersKey = { type: string, teamid: string };
export type TeamNameKey = { type: string, teamid: string };
export type MyTeamRosterKey = { type: string, league: string, };
export type PlayerPhotoKey = { func: string, name: string, athleteUUId: string, teamid: string };
export type MetaLinkKey = { func: string, findexarxid?: string, long?: number, m?: string };
export type LeagueTeamsKey = { type: string, league: string };
export type LeaguesKey = { type: string };
export type StoriesKey = { type: string, league?: string, teamid?: string, athleteUUId?: string, page: number, firstXid?: string };
export type LeagueMentionsKey = { type: string, league?: string, page: number };
export type InvitesKey = { type: string, page: number };
export type TeamMentionsKey = { type: string, league?: string, teamid: string, page: number };
export type PlayerMentionsKey = { type: string, league?: string, teamid: string, name: string, athleteUUId: string, page: number };
export type MyTeamKey = { type: string, league: string };
export type UserSubscriptionKey = { type: string };
export type MyChatsKey = { type: string, league: string, teamid: string, athleteUUId: string, page: number };
export type ChatKey = { type: string, chatUUId: string };
export type CreateChatKey = { promptUUId?: string, email?: string, type: string, chatUUId?: string, league?: string, teamid?: string, athleteUUId?: string, fantasyTeam?: boolean };
export type UserAccountKey = { type: string, email: string, bot?: boolean };
export type UserUsageAccountKey = { type: string, periods: { year: string, month: string }[] };
export type FetchUserDocumentsKey = { type: string, chatUUId?: string };
export type PromptChatResponseKey = { type: string, promptUUId: string, prompt: string };

export type CidUsageAccountKey = {
    cid: string;
    periods: { year: string; month: string }[];
};
export type NotificationsKey = {
    type: "fetch-notifications";
    page: number;
    limit: number;
};
export type PromptPageKey = {
    type: "prompt-page";
    search_key: string;
    pageUUId: string | null;
};

export type CommentsKey = {
    type: "fetch-comments";
    context: 'story' | 'mention' | 'message' | 'league' | 'team' | 'player';
    unionId: string;
    page: number;
};


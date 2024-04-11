// Records event
export const recordEvent = async (name: string, params: string) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/record-event?name=${encodeURIComponent(name)}&params=${encodeURIComponent(params)}`;
      const fetchResponse = await fetch(url);
      const res = await fetchResponse.json();
      return res.data.success;
    }
    catch (e) {
      console.log("recordEvent", e);
      return false;
    }
  }
  
  // Get all Leagues
  export const getLeagues = async () => {
    try {
      return ["NFL", "NHL", "MLB", "NBA"];
      /*const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-leagues`;
      const res = await axios.get(url);
      return res.data.leagues;*/
    }
    catch (e) {
      console.log("recordEvent", e);
      return false;
    }
  }
  
  // SWR get all teams for the League
  export type LeagueTeamsKey = { func: string, league: string, noLoad: boolean };
  export const getLeagueTeams = async ({ league, noLoad }: LeagueTeamsKey) => {
    try {
      if (noLoad) return [];
      const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-league-teams?league=${encodeURIComponent(league)}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.teams;
    }
    catch (e) {
      console.log("getLeagueTeams", e);
      return false;
    }
  }
  
  
  // SWR get all details for the Team
  export type DetailsKey = { type: string, teamid: string; name: string; noUser: boolean };
  export const getDetails = async ({ type, teamid, name, noUser }: DetailsKey) => {
    try {
      let url = '';
      if (noUser)
        url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-details?teamid=${encodeURIComponent(teamid)}&name=${encodeURIComponent(name)}`;
      else
        url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-details-favorites?teamid=${encodeURIComponent(teamid)}&name=${encodeURIComponent(name)}`;
  
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.details;
    }
    catch (e) {
      console.log("getDetails", e);
      return false;
    }
  }
  
  // SWR get all mentions
  export type MentionsKey = { type: string, league?: string, noUser: boolean };
  export const getMentions = async ({ type, league, noUser }: MentionsKey) => {
    try {
      let url = '';
      if (!noUser) {
        url = league ? `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-mentions-favorites?league=${encodeURIComponent(league)}` : `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-mentions-favorites`;
      }
      else {
        url = league ? `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-mentions?league=${encodeURIComponent(league)}` : `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-mentions`;
      }
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.mentions;
    }
    catch (e) {
      console.log("getMentions", e);
      return false;
    }
  }
  
  // SWR get filtered mentions
  export const getFilteredMentions = async ({ type, league, noUser }: MentionsKey) => {
    try {
      if (noUser) {
        return;
      }
      const url = league ? `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-filtered-mentions?league=${encodeURIComponent(league)}` : `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-filtered-mentions`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.mentions;
    }
    catch (e) {
      console.log("getFilteredMentions", e);
      return false;
    }
  }
  
  // SWR get expanded meta
  export type MetaLinkKey = { func: string, findexarxid: string, long?: number };
  export const getMetaLink = async ({ func, findexarxid, long = 0 }: MetaLinkKey) => {
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
  
  // SWR get player photo
  export type PlayerPhotoKey = { func: string, name: string, teamid: string };
  export const getPlayerPhoto = async ({ func, name, teamid }: PlayerPhotoKey) => {
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
  
  // SWR get user lists from web api (protected by Clerk)
  export type UserListsKey = { type: string };
  export const getUserLists = async ({ type }: UserListsKey) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-lists`;
  
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      console.log("getUserLists", url, data.lists)
      return data.lists;
    }
    catch (e) {
      console.log("getUserLists", e);
      return '';
    }
  }
  
  // SWR get user lists from web api (protected by Clerk)
  export type UserAddListParams = { name: string, description: string };
  export const addUserList = async ({ name, description }: UserAddListParams) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/add-list?name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      console.log("addUserList", { name, description, url, data })
      return data.lists;
    }
    catch (e) {
      console.log("addUserList", e);
    }
  }
  
  export type UpdateListParams = { listxid: string, name: string, description: string };
  export const updateUserList = async ({ name, description, listxid }: UpdateListParams) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/update-list?listxid=${listxid}&name=${encodeURIComponent(name)}&description=${encodeURIComponent(description)}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.lists;
    }
    catch (e) {
      console.log("updateUserList", e);
      return false;
    }
  }
  
  export type UserListMembersKey = { type: string, listxid: string };
  export const getUserListMembers = async ({ type, listxid }: UserListMembersKey) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-list-members?listxid=${listxid}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.members;
    }
    catch (e) {
      console.log("getUserListMembers", e);
    }
  }
  
  export type UserUpdateListMembersParams = { listxid: string, members: { member: string, teamid: string }[] };
  export const updateUserListMembers = async ({ listxid, members }: UserUpdateListMembersParams) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/update-list-members?listxid=${listxid}`;
  
      const fetchResponse = await fetch(url, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        }, body: JSON.stringify({ members })
      });
      const data = await fetchResponse.json();
      return data.members;
    }
    catch (e) {
      console.log("getUserListMembers", e);
    }
  }
  
  export type TrackerListMembersKey = { type: string, league: string, noUser: boolean, noLoad: boolean };
  export const getTrackerListMembers = async ({ type, league, noUser, noLoad }: TrackerListMembersKey) => {
    try {
      if (noUser || noLoad) return [];
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-tracker-list-members?league=${league || ""}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.members;
    }
    catch (e) {
      console.log("getUserListMembers", e);
    }
  }
  
  export type AddTrackerListMemberParams = { member: string, teamid: string };
  export const addTrackerListMember = async ({ member, teamid }: AddTrackerListMemberParams) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/add-tracker-list-member?member=${encodeURIComponent(member)}&teamid=${teamid}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.success;
    }
    catch (e) {
      console.log("addTrackerListMember", e);
    }
  }
  
  export type RemoveTrackerListMemberParams = { member: string, teamid: string };
  export const removeTrackerListMember = async ({ member, teamid }: AddTrackerListMemberParams) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/remove-tracker-list-member?member=${encodeURIComponent(member)}&teamid=${teamid}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.success;
    }
    catch (e) {
      console.log("removeTrackerListMember", e);
    }
  }
  
  // SWR get all players for the Team
  export type TeamPlayersKey = { type: string, league: string; teamid: string };
  export const getTeamPlayers = async ({ type, league, teamid }: TeamPlayersKey) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-team-players?league=${encodeURIComponent(league)}&teamid=${encodeURIComponent(teamid)}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.players;
    }
    catch (e) {
      console.log("getTeamPlayers", e);
      return false;
    }
  }
  
  export type UserOptionsKey = { type: string, noUser: boolean };
  export const getOptions = async ({ type, noUser }: UserOptionsKey) => {
    try {
      if (noUser) return {};
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/user-options`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.options;
    }
    catch (e) {
      console.log("getOptions", e);
      return false;
    }
  }
  
  export type SetTrackerFilterParams = { tracker_filter: number };
  export const setTrackerFilter = async ({ tracker_filter }: SetTrackerFilterParams) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/set-tracker-filter?tracker_filter=${tracker_filter}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.success;
    }
    catch (e) {
      console.log("getTeamPlayers", e);
      return false;
    }
  }
  
  export type FavoritesKey = { type: string, noUser: boolean, noLoad: boolean };
  export const getFavorites = async ({ type, noUser, noLoad }: FavoritesKey) => {
    try {
      if (noUser || noLoad) return [];
      console.log("getFavorites")
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-favorites`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.favorites;
    }
    catch (e) {
      console.log("getFavorites", e);
    }
  }
  
  export type FavoriteParams = { findexarxid: string };
  export const addFavorite = async ({ findexarxid }: FavoriteParams) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/add-favorite?findexarxid=${encodeURIComponent(findexarxid)}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.success;
    }
    catch (e) {
      console.log("addTrackerListMember", e);
    }
  }
  
  export const removeFavorite = async ({ findexarxid }: FavoriteParams) => {
    try {
      const url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/remove-favorite?findexarxid=${encodeURIComponent(findexarxid)}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.success;
    }
    catch (e) {
      console.log("addTrackerListMember", e);
    }
  }
  
  //swr infinite:
  // SWR get all mentions
  export type PagedMentionsKey = { type: string, league?: string, noUser: boolean, page: number };
  export const getPagedMentions = async ({ type, league, noUser, page }: PagedMentionsKey) => {
    try {
      let url = '';
      if (!noUser) {
        url = league ? `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-mentions-favorites?league=${encodeURIComponent(league)}&page=${page}` : `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-mentions-favorites?page=${page}`;
      }
      else {
        url = league ? `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-mentions?league=${encodeURIComponent(league)}&page=${page}` : `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-mentions?page=${page}`;
      }
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.mentions;
    }
    catch (e) {
      console.log("getPageMentions", e);
      return false;
    }
  }
  
  // SWR get filtered mentions
  export const getPagedFilteredMentions = async ({ type, league, noUser, page }: PagedMentionsKey) => {
    try {
      if (noUser) {
        return;
      }
      const url = league ? `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-filtered-mentions?league=${encodeURIComponent(league)}&page=${page}` : `${process.env.NEXT_PUBLIC_SERVER}/api/user/get-filtered-mentions?page=${page}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.mentions;
    }
    catch (e) {
      console.log("getPagedFilteredMentions", e);
      return false;
    }
  }
  
  // SWR infinite:
  // SWR get all mentions
  // favorites: 0=unfiltered, 1=only favorites (my team)
  export type FetchedMentionsKey = { type: string, league?: string, noUser: boolean, page: number, teamid: string, name: string, myteam: number, noLoad: boolean };
  export const fetchMentions = async ({ type, league, noUser, page, teamid, name, myteam, noLoad }: FetchedMentionsKey) => {
    try {
      if (noLoad) return [];
  
      let url = '';
      if (!noUser) {
        url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/fetch-mentions?league=${encodeURIComponent(league || "")}&page=${page || 0}&teamid=${encodeURIComponent(teamid || "")}&name=${encodeURIComponent(name || "")}&myteam=${encodeURIComponent(myteam || "")}`;
      }
      else {
        if (myteam == 1)
          return [];
        url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/user/fetch-mentions?league=${encodeURIComponent(league || "")}&page=${page || 0}&teamid=${encodeURIComponent(teamid || "")}&name=${encodeURIComponent(name || "")}&myteam=${encodeURIComponent(myteam || "")}`;
      }
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.mentions;
    }
    catch (e) {
      console.log("fetchMentions", e);
      return false;
    }
  }
  
  // SWR get a mentions
  export type AMentionKey = { type: string, findexarxid: string, noLoad: boolean };
  export const getAMention = async ({ type, findexarxid, noLoad }: AMentionKey) => {
    try {
      if (noLoad) return null;
      let url = '';
      url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-mention?findexarxid=${findexarxid}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.mention;
    }
    catch (e) {
      console.log("getAMention", e);
      return false;
    }
  }
  export const removeAMention = async ({ type, findexarxid, noLoad }: AMentionKey) => {
    try {
      if (noLoad) return null;
  
      let url = '';
      url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/remove-mention?findexarxid=${findexarxid}`;
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.mention;
    }
    catch (e) {
      console.log("removeAMention", e);
      return false;
    }
  }
  
  // SWR infinite:
  // SWR get stories and mentions grouped by story
  // 
  export type FetchedStoriesKey = { type: string, league?: string, noUser: boolean, page: number, noLoad: boolean, firstXid?: string };
  export const fetchStories = async ({ type, league, noUser, page, noLoad, firstXid }: FetchedStoriesKey) => {
    try {
      firstXid = firstXid || "";
      if (noLoad) return [];
  
      let url = '';
      if (!noUser) {
        url = `${process.env.NEXT_PUBLIC_SERVER}/api/user/fetch-stories?league=${encodeURIComponent(league || "")}&page=${page || 0}`;
      }
      else {
        url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/user/fetch-stories?league=${encodeURIComponent(league || "")}&page=${page || 0}`;
      }
      const fetchResponse = await fetch(url);
      const data = await fetchResponse.json();
      return data.stories;
    }
    catch (e) {
      console.log("fetchStories", e);
      return false;
    }
  }
  
  export type ASlugStoryKey = { type: string, slug: string, noLoad: boolean };
  export const getASlugStory = async ({ type, slug, noLoad }: ASlugStoryKey) => {
    try {
      if (noLoad) return null;
  
      let url = '';
      url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/get-slug-story?slug=${slug}`;
      const fetchResponse= await fetch(url);
      const data = await fetchResponse.json();
      return data.story;
    }
    catch (e) {
      console.log("getASlugStory", e);
      return false;
    }
  }
  
  export const removeASlugStory = async ({ type, slug, noLoad }: ASlugStoryKey) => {
    try {
      if (noLoad) return null;
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
  
  // SWR infinite:
  // SWR get stories and mentions grouped by story
  // 
  export type FetchedReportKey = { type: string, page: number };
  export const fetchReport = async ({ type, page }: FetchedReportKey) => {
    try { 
      //console.log("api: fetchReport", type, page)
      let url = ''; 
      url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v41/findexar/events/report?page=${page || 0}`; 
      //console.log("fetchReport-url", url)
      const res = await fetch(url);
      const data = await res.json();
      //console.log("fetchReport", data);
      return data.report;
    }
    catch (e) {
      console.log("fetchReport", e);
      return false;
    }
  }
  
  
  
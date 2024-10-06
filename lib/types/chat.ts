export type ContextInputType = "IncludeStats" | "IncludeMentions" | "IncludeArticles";
export type ContextScopeType = "League" | "Team" | "Athlete" | "Multi-Team" | "Multi-Athlete" | "All";
export type ChatMessage = {
    messageUUId?: string,
    role: "user" | "assistant" | "system",
    content: string,
}

export type Chat = {
    chatUUId: string,
    contextInputs?: ContextInput[],
    messages?: ChatMessage[],
    name?: string,
    position?: number,
    creator?: boolean,
}

export type ChatItem = {
    chatUUId: string,
    name: string,
    lastSaved: Date,
    groupName: string,
}

export type ContextInput = {
    contextInputUUId?: string,
    type: ContextInputType,
    scope: ContextScopeType,
    athleteUUId?: string,
    teamid?: string,
    league?: string,
    athleteUUIds?: string[],
    teamids?: string[],
}

export type Mention = {
    league: string | null;
    url: string | null;
    name: string | null;
    type: string | null;
    team: string | null;
    findex: number | null;
    summary: string | null;
    date: Date | null;
    teamName: string | null;
    athleteUUId: string | null;
}

export type Message = {
    role: string;
    content: string;
}

export type UserDocument = {
    uuid: string;
    name: string;
    title: string;
    description: string;
    selected: number;
    type: 'STYLE' | 'DATA';
}

export type UserDocuments = UserDocument[];

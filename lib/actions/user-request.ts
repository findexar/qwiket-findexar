export interface UserRequestProps {
    chatUUId: string;
    league?: string;
    teamid?: string;
    athleteUUId?: string;
    fantasyTeam?: boolean;
    userRequest: string;
    promptUUId?: string;
    onUpdate: (content: string) => void;
    onDone: () => void;
    onChatUUId: (chatUUId: string) => void;
    onMetaUpdate: (content: string) => void;
    onFollowupPromptsUpdate: (content: string[]) => void;
    creator?: boolean;
    styleDocument?: string;
    dataDocumentsString?: string;
}

export const actionUserRequest = async (props: UserRequestProps) => {
    'use client';
    try {
        const { chatUUId, promptUUId, userRequest, athleteUUId, teamid, league, fantasyTeam, onUpdate, onDone, onChatUUId, onMetaUpdate, onFollowupPromptsUpdate, creator = false, styleDocument = "", dataDocumentsString = "" } = props;
        // Create a ReadableStream for the response
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/user-request2`;

        try {

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatUUId,
                    athleteUUId,
                    teamid,
                    league,
                    fantasyTeam,
                    userRequest,
                    promptUUId,
                    creator,
                    styleDocument,
                    dataDocumentsString
                }),
            });

            if (!res.ok) {
                throw new Error('Network response was not ok');
            }

            const reader = res.body?.getReader();
            if (!reader) {
                throw new Error('Failed to get reader from response');
            }

            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || '';

                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    if (line.trim() === 'data: [DONE]') {
                        console.log('*********************** data: [DONE] received', line);
                        onDone();
                        return;
                    } else if (line.startsWith('data: ')) {
                        console.log('*********************** data: content received', line);
                        try {
                            const jsonData = JSON.parse(line.slice(5));
                            if (jsonData.content) {
                                onUpdate(jsonData.content);
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                    if (line.startsWith('chatUUId: ')) {
                        console.log('*********************** chatUUId: content received', line);
                        const jsonData = JSON.parse(line.slice(9));
                        onChatUUId(jsonData.content);
                    }
                    if (line.startsWith('meta: ')) {
                        console.log('*********************** meta: content received', line);
                        const jsonData = JSON.parse(line.slice(5));
                        onMetaUpdate(jsonData.content);
                    }
                    if (line.startsWith('followupPrompts: ')) {
                        console.log('*********************** followupPrompts: content received', line);
                        const jsonData = JSON.parse(line.slice(16));
                        let content = jsonData.content || [];
                        if (content.length > 0) {
                            const firstPrompt = content[0];
                            if (typeof firstPrompt === "object") {
                                content = content.map((prompt: any) => prompt.prompt);
                            }
                            onFollowupPromptsUpdate(content);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error in user request:', error);
            throw error;
        } finally {
            onDone();
        }

        // Return a Response object with the stream

    } catch (error) {
        console.error('Error in actionUserRequest:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
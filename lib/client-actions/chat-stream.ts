export interface ChatStreamProps {
    chatUUId: string;
    pumpUUId: string;
    onUpdate: (content: string) => void;
    onDone: () => void;
    onError: (content: string) => void;
    onMetaUpdate: (content: string) => void;
    onFollowupPromptsUpdate: (content: string[]) => void;
    onLastMessageUUIDUpdate: (content: string) => void;
}

export const actionChatStream = async (props: ChatStreamProps) => {
    'use client';
    try {
        const { chatUUId, pumpUUId, onUpdate, onDone, onError, onMetaUpdate, onFollowupPromptsUpdate, onLastMessageUUIDUpdate } = props;
        // Create a ReadableStream for the response
        const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/stream`;
        console.log("actionChatStream:", url);
        try {

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chatUUId,
                    pumpUUId,
                }),
            });
            console.log("*********stream-res", res);
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
                    // console.log('*********************** line received', line);
                    if (line.trim().includes('[STOP]')) {
                        // console.log('*********************** [STOP] received', line);
                        onDone();
                        return;
                    } else if (line.trim().includes('[ERRORSTOP]')) {
                        // console.log('*********************** [ERRORSTOP] received', line);
                        onError("Server error. Retrying...");
                        return;
                    } else if (line.startsWith('data: ')) {
                        // console.log('*********************** data: content received', line);
                        try {
                            const jsonData = JSON.parse(line.slice(5));
                            if (jsonData.content) {
                                onUpdate(jsonData.content);
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }

                    if (line.startsWith('meta: ')) {
                        // console.log('*********************** meta: content received', line);
                        const jsonData = JSON.parse(line.slice(5));
                        if (jsonData.content == "followupPrompts") {
                            console.log('meta *********************** followupPrompts: content received', line);
                            onFollowupPromptsUpdate(jsonData.followupPrompts);
                        } else if (jsonData.content == "lastMessageUUID") {
                            console.log('meta *********************** lastMessageUUID: content received', line);
                            onLastMessageUUIDUpdate(jsonData.lastMessageUUID);
                        } else {
                            if (jsonData.content.trim() == '[STOP]') {
                                console.log('*********************** meta [STOP] received', line);
                                onDone();
                                return;
                            } else {
                                onMetaUpdate(jsonData.content);
                            }
                        }
                    }
                    if (line.startsWith('error: ')) {
                        console.log('*********************** meta: error received', line);
                        const jsonData = JSON.parse(line.slice(6));
                        onError(jsonData.content);
                    }
                    /* if (line.startsWith('followupPrompts: ')) {
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
                     }*/


                }
            }
            // onDone();
        } catch (error) {
            console.error('Error in user request:', error);
            // onUpdate("Streamin error. Please try again.");
            onError(" *** Streaming error. Retrying... ***");
            // throw error;
        } finally {

        }

        // Return a Response object with the stream

    } catch (error) {
        console.error('Error in actionUChatRequest:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
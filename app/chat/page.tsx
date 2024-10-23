'use client';

import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FaPaperPlane } from 'react-icons/fa'; // Import the paper airplane icon

type Message = {
    role: string;
    content: string;
}
let isDone = false;
export default function ChatPage() {
    const [response, setResponse] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [userInput, setUserInput] = useState<string>('');
    const responseTextareaRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const responseSetRef = useRef(false); // Add a ref to track if response has been set

    console.log(`==> messages:`, messages);
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userInput.trim()) return;
        const newMessage: Message = {
            role: 'user',
            content: userInput
        };
        setMessages(prevMessages => [...prevMessages, newMessage]);
        setUserInput('');
        setIsLoading(true);
        setResponse('');
        responseSetRef.current = false; // Reset the ref when a new request is made

        // Add a placeholder message for the assistant response
        const assistantMessage: Message = {
            role: 'Qwiket AI',
            content: ''
        };
        setMessages(prevMessages => [...prevMessages, assistantMessage]);

        try {
            const url = `${process.env.NEXT_PUBLIC_LAKEAPI}/api/v50/findexar/ai-chat/create`;

            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    athleteUUId: 'de2a9b88-a62f-491c-8da0-9eca24cd4364',
                    contextInputs: [
                        {
                            "scope": 'Athlete',
                            "type": 'IncludeMentions',
                            "athleteUUId": 'self',
                        },
                    ],
                    userRequest: userInput,
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
                        console.log('data: [DONE] received');
                        return;
                    } else if (line.startsWith('data: ')) {
                        console.log('data: content received');
                        try {
                            const jsonData = JSON.parse(line.slice(5));
                            if (jsonData.content) {
                                setResponse(prev => {
                                    const updatedContent = prev + jsonData.content;
                                    // Update the assistant message content
                                    setMessages(prevMessages => {
                                        const updatedMessages = [...prevMessages];
                                        updatedMessages[updatedMessages.length - 1].content = updatedContent;
                                        return updatedMessages;
                                    });
                                    return updatedContent;
                                });
                            }
                        } catch (error) {
                            console.error('Error parsing JSON:', error);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error creating chat:', error);
            setResponse('Error creating chat. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (responseTextareaRef.current) {
            responseTextareaRef.current.scrollTop = responseTextareaRef.current.scrollHeight;
        }
    }, [response]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e as unknown as React.FormEvent);
        }
    };

    return (
        <div className="p-4 max-w-2xl mx-auto flex flex-col h-screen">
            <h1 className="text-2xl font-bold mb-4">Chat Page</h1>
            <div className="flex-grow mb-4 h-96 overflow-auto border p-4 rounded">
                {messages.map((message, index) => (
                    <div key={index} className={`mb-2 p-2 rounded ${message.role === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100 text-left'}`}>
                        <strong>{message.role === 'user' ? 'You' : 'Qwiket AI'}:</strong> <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-center items-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500"></div>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex mt-4">
                    <textarea
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Message to Qwiket AI"
                        className="flex-grow p-2 border rounded mr-2"
                        rows={3}
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                        ) : (
                            <FaPaperPlane />
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
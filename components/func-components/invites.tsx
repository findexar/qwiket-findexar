'use client';
import React, { useEffect, useState, useCallback } from "react";
import useSWRInfinite from 'swr/infinite';
import { useAppContext } from '@/lib/context';
import Invite from "@/components/func-components/items/invite";
import LoadMore from "@/components/func-components/load-more";
import { actionInvites, actionUpdateInvite, UpdateInviteProps } from '@/lib/fetchers/invites';
import { InvitesKey } from '@/lib/keys';

interface InviteData {
    cid: string;
    email?: string; // Make email optional
    full_name: string;
    nickname: string;
    notes: string;
    self_invited: boolean;
    created: string;
    visited: string | null;
    account_created: string | null;
    subscribed: string | null;
    canceled: string | null;
    tag: string;
}

interface Props { }

let lastMutate = 0;
let scrollY = 0;

const Invites: React.FC<Props> = () => {
    const { fallback, league } = useAppContext();
    const [isAddingInvite, setIsAddingInvite] = useState(false);
    const [newInvite, setNewInvite] = useState<Partial<InviteData>>({
        email: '',
        full_name: '',
        nickname: '',
        notes: '',
        tag: '', // Add tag field
    });

    const fetchInvitesKey = (pageIndex: number, previousPageData: any): InvitesKey | null => {
        let key: InvitesKey = { type: "fetch-invites", page: pageIndex };
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return key;
    };

    const { data, mutate, size, setSize, isLoading } = useSWRInfinite(fetchInvitesKey, actionInvites, { revalidateAll: true, fallback });

    let invites = data ? [].concat(...data) : [];

    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    let isEmpty = data?.[0]?.length === 0;
    let isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < 5);

    const handleAddInvite = useCallback(() => {
        setIsAddingInvite(true);
    }, []);

    const handleCancelAdd = useCallback(() => {
        setIsAddingInvite(false);
        setNewInvite({
            email: '',
            full_name: '',
            nickname: '',
            notes: '',
            tag: '', // Reset tag field
        });
    }, []);

    const generateCid = () => {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 6; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };

    const handleSaveNewInvite = useCallback(async () => {
        const cid = generateCid();
        const newInviteWithCid = {
            ...newInvite,
            cid,
            self_invited: false,
            created: new Date().toISOString(),
            visited: null,
            account_created: null,
            subscribed: null,
            canceled: null,
            tag: newInvite.tag || '', // Include tag in the new invite
        };

        await actionUpdateInvite({
            cid: newInviteWithCid.cid,
            email: newInviteWithCid.email || '',
            full_name: newInviteWithCid.full_name || '',
            nickname: newInviteWithCid.nickname || '',
            notes: newInviteWithCid.notes || '',
            tag: newInviteWithCid.tag || '' // Include tag in the update
        });
        setIsAddingInvite(false);
        setNewInvite({
            email: '',
            full_name: '',
            nickname: '',
            notes: '',
            tag: '', // Reset tag field
        });
        await mutate(); // Fetch again
    }, [newInvite, mutate]);

    const handleUpdateInvite = useCallback(async (updatedData: Pick<InviteData, 'cid'> & Partial<InviteData>) => {
        if (!updatedData.cid) {
            console.error('Cannot update invite: cid is missing');
            return;
        }
        await actionUpdateInvite(updatedData);
        await mutate();
    }, [mutate]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setNewInvite(prev => ({ ...prev, [name]: value }));
    }, []);

    const Invites = invites && invites.filter((i: any, index: number) => i).map((i: any, index: number) => (
        <Invite
            key={`invite-${index}`}
            {...i}
            onUpdate={handleUpdateInvite}
        />
    ));


    return (
        <>
            <div className="w-full max-w-4xl mx-auto px-4">
                {/* Header for both desktop and mobile */}
                <h1 className="text-2xl font-bold mt-6 mb-6 text-gray-800 dark:text-gray-200">
                    Admin Invites
                </h1>

                <div className="hidden lg:flex flex-col justify-start w-full h-full font-roboto">
                    <div className="flex justify-center mb-4">
                        <button
                            onClick={handleAddInvite}
                            className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                        >
                            Add New Invite
                        </button>
                    </div>
                    {isAddingInvite && (
                        <div className="mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded">
                            <h3 className="text-xl font-semibold mb-2">New Invite</h3>
                            <input
                                type="email"
                                name="email"
                                value={newInvite.email}
                                onChange={handleInputChange}
                                placeholder="Email (optional)"
                                className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <input
                                type="text"
                                name="full_name"
                                value={newInvite.full_name}
                                onChange={handleInputChange}
                                placeholder="Full Name"
                                className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <input
                                type="text"
                                name="nickname"
                                value={newInvite.nickname}
                                onChange={handleInputChange}
                                placeholder="Nickname"
                                className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <textarea
                                name="notes"
                                value={newInvite.notes}
                                onChange={handleInputChange}
                                placeholder="Notes"
                                className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                rows={3}
                            />
                            <input
                                type="text"
                                name="tag"
                                value={newInvite.tag}
                                onChange={handleInputChange}
                                placeholder="Tag"
                                className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <div className="flex justify-end space-x-2">
                                <button
                                    onClick={handleCancelAdd}
                                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveNewInvite}
                                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    )}
                    <div className="flex flex-col justify-start items-start h-full">
                        {Invites}
                    </div>
                    <LoadMore setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
                </div>
            </div>

            <div className="lg:hidden flex flex-col justify-start w-full h-full font-roboto px-4">
                <div className="flex justify-center mb-4">
                    <button
                        onClick={handleAddInvite}
                        className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                    >
                        Add New Invite
                    </button>
                </div>
                {isAddingInvite && (
                    <div className="mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded">
                        <h3 className="text-xl font-semibold mb-2">New Invite</h3>
                        <input
                            type="email"
                            name="email"
                            value={newInvite.email}
                            onChange={handleInputChange}
                            placeholder="Email (optional)"
                            className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <input
                            type="text"
                            name="full_name"
                            value={newInvite.full_name}
                            onChange={handleInputChange}
                            placeholder="Full Name"
                            className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <input
                            type="text"
                            name="nickname"
                            value={newInvite.nickname}
                            onChange={handleInputChange}
                            placeholder="Nickname"
                            className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <textarea
                            name="notes"
                            value={newInvite.notes}
                            onChange={handleInputChange}
                            placeholder="Notes"
                            className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            rows={3}
                        />
                        <input
                            type="text"
                            name="tag"
                            value={newInvite.tag}
                            onChange={handleInputChange}
                            placeholder="Tag"
                            className="w-full mb-2 p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={handleCancelAdd}
                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNewInvite}
                                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 dark:bg-blue-700 dark:hover:bg-blue-600"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                )}
                <div className="flex flex-col justify-start items-start h-full">
                    {Invites}
                </div>
                <LoadMore setSize={setSize} size={size} isLoadingMore={isLoadingMore || false} isReachingEnd={isReachingEnd || false} />
                <div className="w-full flex flex-row justify-center items-center mb-24"></div>
            </div>
        </>
    );
};

export default Invites;

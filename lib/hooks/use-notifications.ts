import useSWRInfinite from 'swr/infinite';
import { useAppContext } from '@/lib/context';
import { actionNotifications, dismissNotification as apiDismissNotification, removeNotification as apiRemoveNotification, Notification } from '@/lib/fetchers/notifications';
import { NotificationsKey } from '@/lib/keys';

const PAGE_SIZE = 20;

// Helper function to ensure boolean type for dismissed and removed
const toBool = (value: number | boolean): boolean => value === 1 || value === true;

export const useNotifications = () => {
    const { fallback } = useAppContext();

    const fetchNotificationsKey = (pageIndex: number, previousPageData: any): NotificationsKey | null => {
        if (previousPageData && !previousPageData.length) return null; // reached the end
        return { type: "fetch-notifications", page: pageIndex + 1, limit: PAGE_SIZE };
    };

    const { data, mutate, size, setSize, isLoading } = useSWRInfinite(
        fetchNotificationsKey,
        actionNotifications,
        {
            initialSize: 1,
            revalidateAll: true,
            parallel: true,
            fallback,
            revalidateFirstPage: false
        }
    );

    let notifications = data ? ([] as Notification[]).concat(...data) : [];
    notifications = notifications.map(notif => ({
        ...notif,
        dismissed: toBool(notif.dismissed),
        removed: toBool(notif.removed)
    }));

    const isLoadingMore = isLoading || (size > 0 && data && typeof data[size - 1] === "undefined");
    const isEmpty = data?.[0]?.length === 0;
    const isReachingEnd = isEmpty || (data && data[data.length - 1]?.length < PAGE_SIZE);

    const dismissNotification = async (xid: number) => {
        const success = await apiDismissNotification(xid);
        if (success) {
            mutate(
                currentData => currentData?.map(page =>
                    page.map(n => n.xid === xid ? { ...n, dismissed: true } : n)
                ),
                false
            );
        }
    };

    const removeNotification = async (xid: number) => {
        const success = await apiRemoveNotification(xid);
        if (success) {
            mutate(
                currentData => currentData?.map(page =>
                    page.filter(n => n.xid !== xid)
                ),
                false
            );
        }
    };

    return {
        notifications,
        isLoading,
        isLoadingMore,
        isReachingEnd,
        fetchMore: () => setSize(size + 1),
        dismissNotification,
        removeNotification,
    };
};

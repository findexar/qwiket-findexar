import React, { useState, useEffect, useRef } from 'react';
import { FaBell } from 'react-icons/fa';
import { useNotifications } from '@lib/hooks/use-notifications';
import { Notification } from '@lib/fetchers/notifications';
import { useTheme } from 'next-themes';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { MarkdownComponents } from '@components/shared/markdown-components';

const NotificationIcon: React.FC<{ count: number; highestType: string }> = ({ count, highestType }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const getColorClass = () => {
        if (count === 0) return isDark ? 'text-gray-500' : 'text-gray-400';
        switch (highestType) {
            case 'ALERT': return 'text-red-500';
            case 'SUCCESS': return 'text-green-500';
            case 'WARN': return 'text-yellow-500';
            case 'INFO': return isDark ? 'text-blue-300' : 'text-blue-500';
            default: return isDark ? 'text-gray-300' : 'text-gray-700';
        }
    };

    return (
        <div className="relative">
            <FaBell className={`text-sm ${getColorClass()} ${count === 0 ? 'opacity-70' : ''}`} />
            {count > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {count}
                </span>
            )}
        </div>
    );
};

const NotificationItem: React.FC<{ notification: Notification; onRemove: () => void; onDismiss: () => void }> = ({ notification, onRemove, onDismiss }) => {
    const trimmedText = notification.text.trim();
    const displayText = trimmedText || 'Empty notification';

    return (
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex justify-between items-start">
            <div onClick={onDismiss} className="cursor-pointer flex-grow mr-2">
                <ReactMarkdown
                    components={MarkdownComponents}
                    className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2 overflow-hidden"
                >
                    {displayText}
                </ReactMarkdown>
            </div>
            <button
                onClick={onRemove}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 text-xs flex-shrink-0"
            >
                ×
            </button>
        </div>
    );
};

const NotificationPopup: React.FC<{ notification: Notification; onDismiss: () => void; onClose: () => void }> = ({ notification, onDismiss, onClose }) => {
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        const handleClickOutside = (event: MouseEvent) => {
            if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscKey);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleEscKey);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    console.log('Notification text:', notification.text); // Debugging line

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div ref={popupRef} className="bg-white dark:bg-gray-800 rounded-md shadow-lg w-full max-w-md mx-4">
                <div className="p-3 border-b border-gray-200 dark:border-gray-700 max-h-[60vh] overflow-y-auto">
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mb-8" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mb-4" {...props} />,
                            h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mb-2" {...props} />,
                            p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                            ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4" {...props} />,
                            ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4" {...props} />,
                            li: ({ node, ...props }) => <li className="mb-2" {...props} />,
                            small: ({ node, ...props }) => <small className="text-sm block mt-4 text-gray-600 dark:text-gray-400" {...props} />,
                            i: ({ node, ...props }) => <i className="italic" {...props} />,
                            strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                        }}
                        className="text-sm text-gray-800 dark:text-gray-200 text-left prose prose-sm dark:prose-invert max-w-none notification-content"
                    >
                        {notification.text}
                    </ReactMarkdown>

                </div>
                <div className="flex justify-end p-2 bg-gray-50 dark:bg-gray-700 rounded-b-md">
                    <button
                        onClick={onDismiss}
                        className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50 mr-2"
                    >
                        Dismiss
                    </button>
                    <button
                        onClick={onClose}
                        className="px-3 py-1 text-xs bg-gray-300 text-gray-800 rounded hover:bg-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-opacity-50"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const Notifications: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
    const { notifications, fetchMore, removeNotification, dismissNotification } = useNotifications();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeNotifications = notifications.filter(n => !n.dismissed && !n.removed);

    const highestType = activeNotifications.reduce((highest, n) => {
        if (n.type === 'ALERT') return 'ALERT';
        if (n.type === 'SUCCESS' && highest !== 'ALERT') return 'SUCCESS';
        if (n.type === 'WARN' && highest !== 'ALERT' && highest !== 'SUCCESS') return 'WARN';
        if (n.type === 'INFO' && highest !== 'ALERT' && highest !== 'SUCCESS' && highest !== 'WARN') return 'INFO';
        return highest;
    }, '');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const handleEscKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false);
                setSelectedNotification(null);
            }
        };

        document.addEventListener('keydown', handleEscKey);
        return () => {
            document.removeEventListener('keydown', handleEscKey);
        };
    }, []);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop === clientHeight) {
            fetchMore();
        }
    };

    const handleDismiss = (notification: Notification) => {
        dismissNotification(notification.xid);
        setSelectedNotification(null);
        setIsOpen(false);
    };

    const handleClose = () => {
        setSelectedNotification(null);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-center p-1">
                <NotificationIcon count={activeNotifications.length} highestType={highestType} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto overflow-x-hidden"
                    style={{
                        left: 'auto',
                        right: '0',
                        maxWidth: 'calc(100vw - 2rem)',
                        transform: 'translateX(0)',
                    }}
                    onScroll={handleScroll}>
                    {notifications.map(notification => (
                        <NotificationItem
                            key={notification.xid}
                            notification={notification}
                            onRemove={() => removeNotification(notification.xid)}
                            onDismiss={() => setSelectedNotification(notification)}
                        />
                    ))}
                </div>
            )}
            {selectedNotification && (
                <NotificationPopup
                    notification={selectedNotification}
                    onDismiss={() => handleDismiss(selectedNotification)}
                    onClose={handleClose}
                />
            )}
        </div>
    );
};

export default Notifications;

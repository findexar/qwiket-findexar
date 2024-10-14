'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '@lib/context';
import useSWR from 'swr';
import { UserUsageAccountKey, CidUsageAccountKey } from '@lib/keys';
import { actionUserUsage, actionCidUsage } from '@/lib/fetchers/account';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';
import { UserAccount, UserUsage, CidUsage } from '@/lib/types/user';
import Link from 'next/link';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
    const { userAccount, fallback } = useAppContext();
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));
    const isCid = useMemo(() => {
        return userAccount?.cid && userAccount?.cid.length > 0;
    }, [userAccount]);
    // Determine if we need to show the previous month
    const today = new Date();
    const isFirstWeekOfMonth = useMemo(() => {
        const currentYear = today.getFullYear().toString();
        const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
        return selectedYear === currentYear &&
            selectedMonth === currentMonth &&
            today.getDate() <= 7;
    }, [selectedYear, selectedMonth]);

    const [periods, setPeriods] = useState<{ year: string; month: string }[]>([]);

    useEffect(() => {
        let newPeriods = [];
        if (isFirstWeekOfMonth) {
            console.log(`Dashboard==>isFirstWeekOfMonth: ${isFirstWeekOfMonth}`);
            const prevMonth = new Date(parseInt(selectedYear), parseInt(selectedMonth) - 2, 1);
            newPeriods.push({
                year: prevMonth.getFullYear().toString(),
                month: (prevMonth.getMonth() + 1).toString().padStart(2, '0')
            });
        }
        newPeriods.push({ year: selectedYear, month: selectedMonth });
        setPeriods(newPeriods);
    }, [selectedYear, selectedMonth, isFirstWeekOfMonth]);

    const dailyUsageAccountKey: UserUsageAccountKey = { type: "daily-usage", periods };
    const { data: dailyUsageAccount, error, isLoading } = useSWR<UserUsage>(dailyUsageAccountKey, actionUserUsage, { fallback });
    console.log(`Dashboard==>dailyUsageAccount: ${JSON.stringify(dailyUsageAccount, null, 2)}`);
    // Prepare data for the chart
    const chartData: ChartData<'bar'> = {
        labels: dailyUsageAccount?.flatMap(monthData =>
            monthData.usage.map(item => parseInt(item.usageDate.split('-')[2], 10))
        ) || [],
        datasets: [
            {
                label: 'Monthly Credits',
                data: dailyUsageAccount?.flatMap(monthData =>
                    monthData.usage.map(item => item.usedCredits)
                ) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                barThickness: 'flex',
                maxBarThickness: 30,
            },
            {
                label: 'Extra Credits',
                data: dailyUsageAccount?.flatMap(monthData =>
                    monthData.usage.map(item => item.usedExtraCredits)
                ) || [],
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                barThickness: 'flex',
                maxBarThickness: 30,
            },
        ],
    };

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                stacked: true,
                offset: true,
                ticks: {
                    align: 'start',
                },
                grid: {
                    offset: true
                }
            },
            y: {
                stacked: true,
                beginAtZero: true,
                suggestedMax: 10, // Adjust this value based on your typical usage data
            },
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    title: (context) => {
                        const dataIndex = context[0].dataIndex;
                        const monthData = dailyUsageAccount?.[Math.floor(dataIndex / 31)];
                        const day = context[0].label.padStart(2, '0');
                        return monthData ? `${monthData.year}-${monthData.month}-${day}` : '';
                    },
                },
            },
        },
    };

    const years = Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => (2024 + i).toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    const [activeTab, setActiveTab] = useState('usage');

    const cidUsageAccountKey: CidUsageAccountKey = { cid: userAccount?.cid || '', periods };
    const { data: cidUsageAccount, error: cidError, isLoading: cidIsLoading } = useSWR<CidUsage>(cidUsageAccountKey, actionCidUsage, { fallback });

    // Prepare data for the CID usage chart
    const cidChartData: ChartData<'bar'> = {
        labels: cidUsageAccount?.usage.flatMap(monthData =>
            monthData.usage.map(item => parseInt(item.date.split('-')[2], 10))
        ) || [],
        datasets: [
            {
                label: 'Visitors',
                data: cidUsageAccount?.usage.flatMap(monthData =>
                    monthData.usage.map(item => item.visitors)
                ) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                barThickness: 'flex',
                maxBarThickness: 30,
            },
            {
                label: 'Subscribers',
                data: cidUsageAccount?.usage.flatMap(monthData =>
                    monthData.usage.map(item => item.subscribers)
                ) || [],
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                barThickness: 'flex',
                maxBarThickness: 30,
            },
        ],
    };

    // Prepare data for the totals chart
    const totalsChartData: ChartData<'bar'> = {
        labels: cidUsageAccount?.totals.map(item => parseInt(item.date.split('-')[2], 10)) || [],
        datasets: [
            {
                label: 'Total Visitors',
                data: cidUsageAccount?.totals.map(item => item.visitors) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                barThickness: 'flex',
                maxBarThickness: 30,
            },
            {
                label: 'Total Subscribers',
                data: cidUsageAccount?.totals.map(item => item.subscribers) || [],
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                barThickness: 'flex',
                maxBarThickness: 30,
            },
        ],
    };

    // Prepare data for the payments chart
    const paymentsChartData: ChartData<'bar'> = {
        labels: cidUsageAccount?.payments.map(item => `${item.billingYear}-${item.billingMonth.toString().padStart(2, '0')}`) || [],
        datasets: [
            {
                label: 'Payments',
                data: cidUsageAccount?.payments.map(item => item.value) || [],
                backgroundColor: 'rgba(255, 159, 64, 0.6)',
                barThickness: 'flex',
                maxBarThickness: 30,
            },
        ],
    };

    const paymentsChartOptions: ChartOptions<'bar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    text: 'Billing Period (Year-Month)'
                },
                ticks: {
                    autoSkip: false,
                    maxRotation: 45,
                    minRotation: 45
                }
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Amount ($)'
                }
            }
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
            tooltip: {
                callbacks: {
                    title: (context) => {
                        return `Billing Period: ${context[0].label}`;
                    },
                    label: (context) => {
                        return `Payment: $${context.parsed.y.toFixed(2)}`;
                    }
                },
            },
        },
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Account Dashboard</h1>

                {/* Account Info Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            {userAccount?.subscriptionStatus && userAccount?.subscriptionType ? (
                                <>
                                    <p><strong>Subscription Status:</strong> {userAccount.subscriptionStatus}</p>
                                    <p><strong>Subscription Type:</strong> {userAccount.subscriptionType}</p>
                                    <p><strong>Billing Day:</strong> {userAccount.billingDay}</p>
                                </>
                            ) : (
                                <Link href="/account/upgrade" className="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                    Upgrade
                                </Link>
                            )}
                        </div>
                        <div className="flex flex-col justify-between">
                            <div>
                                <p><strong>Credits Remaining:</strong> {userAccount?.creditsRemaining}</p>
                                <p><strong>Extra Credits Remaining:</strong> {userAccount?.extraCreditsRemaining}</p>
                                <p><strong>Subscription Active:</strong> {userAccount?.subscriptionActive ? 'Yes' : 'No'}</p>
                            </div>
                            {userAccount?.subscriptionStatus && userAccount?.subscriptionType && (
                                <Link href="/account/upgrade" className="self-end bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded">
                                    Upgrade
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Revised and entity-encoded explanation paragraph */}
                <p className="text-gray-600 dark:text-gray-400 italic text-center mb-8">
                    Monthly credits are renewed based on your subscription plan, except for free trials. Extra credits don&apos;t expire and are used after regular credits are depleted.
                </p>

                {/* Tabs and Usage Graph Section */}
                {isCid && (
                    <div className="flex mb-4 border-b border-gray-200 dark:border-gray-700">
                        <button
                            className={`py-2 px-4 text-sm font-medium ${activeTab === 'usage'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            onClick={() => setActiveTab('usage')}
                        >
                            Usage
                        </button>
                        <button
                            className={`ml-8 py-2 px-4 text-sm font-medium ${activeTab === 'revenue'
                                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                            onClick={() => setActiveTab('revenue')}
                        >
                            Revenue Sharing
                        </button>
                    </div>
                )}

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    {(!isCid || activeTab === 'usage') && (
                        <>
                            <h2 className="text-2xl font-semibold mb-4">Daily Usage</h2>
                            <div className="mb-4">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="mr-2 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>
                            {isLoading ? (
                                <p>Loading usage data...</p>
                            ) : error ? (
                                <p>Error loading usage data</p>
                            ) : (
                                <div style={{ height: '400px', width: '100%' }}>
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                            )}
                        </>
                    )}

                    {isCid && activeTab === 'revenue' && (
                        <>
                            <h2 className="text-2xl font-semibold mb-6">Revenue Sharing</h2>

                            {/* Date range selector */}
                            <div className="mb-6">
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(e.target.value)}
                                    className="mr-2 p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    {years.map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    className="p-2 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                >
                                    {months.map(month => (
                                        <option key={month} value={month}>{month}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Top card with total visitors, subscribers, and payments */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                                <h3 className="text-xl font-semibold mb-4">Current Totals</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <p className="text-lg font-medium">Total Visitors</p>
                                        <p className="text-3xl font-bold">{cidUsageAccount?.currentTotalVisitors || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium">Total Subscribers</p>
                                        <p className="text-3xl font-bold">{cidUsageAccount?.currentTotalSubscribers || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-medium">Total Payments</p>
                                        <p className="text-3xl font-bold">${cidUsageAccount?.totalPayments.toFixed(2) || '0.00'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Daily New Referred Users Graph Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                                <h3 className="text-xl font-semibold mb-4">Daily New Referred Users</h3>
                                {cidIsLoading ? (
                                    <p>Loading daily new referred users data...</p>
                                ) : cidError ? (
                                    <p>Error loading daily new referred users data</p>
                                ) : (
                                    <div style={{ height: '400px', width: '100%' }}>
                                        <Bar data={cidChartData} options={chartOptions} />
                                    </div>
                                )}
                            </div>

                            {/* Cumulative Totals Graph Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                                <h3 className="text-xl font-semibold mb-4">Cumulative Totals</h3>
                                {cidIsLoading ? (
                                    <p>Loading cumulative totals data...</p>
                                ) : cidError ? (
                                    <p>Error loading cumulative totals data</p>
                                ) : (
                                    <div style={{ height: '400px', width: '100%' }}>
                                        <Bar data={totalsChartData} options={chartOptions} />
                                    </div>
                                )}
                            </div>

                            {/* Payments Graph Card */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                                <h3 className="text-xl font-semibold mb-4">Monthly Payments</h3>
                                {cidIsLoading ? (
                                    <p>Loading payments data...</p>
                                ) : cidError ? (
                                    <p>Error loading payments data</p>
                                ) : (
                                    <div style={{ height: '400px', width: '100%' }}>
                                        <Bar data={paymentsChartData} options={paymentsChartOptions} />
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
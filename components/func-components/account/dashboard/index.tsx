'use client';
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@lib/context';
import useSWR from 'swr';
import { UserUsageAccountKey } from '@lib/keys';
import { actionUserUsage } from '@/lib/fetchers/account';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartData, ChartOptions } from 'chart.js';
import { UserAccount, UserUsage } from '@/lib/types/user';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
    const { userAccount, fallback } = useAppContext();
    const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
    const [selectedMonth, setSelectedMonth] = useState<string>((new Date().getMonth() + 1).toString().padStart(2, '0'));

    // Determine if we need to show the previous month
    const today = new Date();
    const isFirstWeekOfMonth = today.getDate() <= 7;
    const [periods, setPeriods] = useState<{ year: string; month: string }[]>([]);

    useEffect(() => {
        let newPeriods = [];
        if (isFirstWeekOfMonth) {
            const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
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

    // Prepare data for the chart
    const chartData: ChartData<'bar'> = {
        labels: dailyUsageAccount?.flatMap(monthData =>
            monthData.usage.map(item => `${monthData.year}-${monthData.month}-${item.usageDate.split('-')[2]}`)
        ) || [],
        datasets: [
            {
                label: 'Monthly Credits',
                data: dailyUsageAccount?.flatMap(monthData =>
                    monthData.usage.map(item => item.usedCredits)
                ) || [],
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
            },
            {
                label: 'Extra Credits',
                data: dailyUsageAccount?.flatMap(monthData =>
                    monthData.usage.map(item => item.usedExtraCredits)
                ) || [],
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
            },
        ],
    };

    const chartOptions: ChartOptions<'bar'> = {
        responsive: true,
        scales: {
            x: { stacked: true },
            y: { stacked: true },
        },
    };

    const years = Array.from({ length: new Date().getFullYear() - 2023 }, (_, i) => (2024 + i).toString());
    const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-8 text-center">Account Dashboard</h1>

                {/* Account Info Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Account Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p><strong>Subscription Status:</strong> {userAccount?.subscriptionStatus}</p>
                            <p><strong>Subscription Type:</strong> {userAccount?.subscriptionType}</p>
                            <p><strong>Billing Day:</strong> {userAccount?.billingDay}</p>
                        </div>
                        <div>
                            <p><strong>Credits Remaining:</strong> {userAccount?.creditsRemaining}</p>
                            <p><strong>Extra Credits Remaining:</strong> {userAccount?.extraCreditsRemaining}</p>
                            <p><strong>Subscription Active:</strong> {userAccount?.subscriptionActive ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>

                {/* Usage Graph Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4">Daily Usage</h2>
                    <div className="mb-4">
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="mr-2 p-2 rounded"
                        >
                            {years.map(year => (
                                <option key={year} value={year}>{year}</option>
                            ))}
                        </select>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="p-2 rounded"
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
                        <Bar data={chartData} options={chartOptions} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
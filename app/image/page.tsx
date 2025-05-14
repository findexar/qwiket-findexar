'use client';

import React from 'react';

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white">
            <h1 className="text-2xl font-bold mb-6">Political Cartoon: Tariffs and Prosperity</h1>
            <svg width="900" height="600" viewBox="0 0 900 600" xmlns="http://www.w3.org/2000/svg">
                {/* Tree trunk */}
                <rect x="420" y="150" width="60" height="400" fill="#8B5A2B" />
                <text x="450" y="140" textAnchor="middle" fontSize="18" fill="black">Global Trade</text>

                {/* Branch (rotated) */}
                <g transform="rotate(-10 450 250)">
                    <rect x="450" y="250" width="280" height="25" fill="#A0522D" />
                    <text x="590" y="245" textAnchor="middle" fontSize="16" fill="black">US Prosperity</text>
                </g>

                {/* Trump-like figure sitting on the branch */}
                <circle cx="520" cy="240" r="25" fill="#FFDAB9" /> {/* Head */}
                <rect x="510" y="265" width="20" height="50" fill="#00008B" /> {/* Body */}
                <text x="520" y="245" textAnchor="middle" fontSize="14" fill="black">T</text>

                {/* Saw */}
                <g transform="rotate(-10 480 270)">
                    <rect x="480" y="270" width="90" height="12" fill="gray" />
                    <text x="525" y="265" textAnchor="middle" fontSize="12" fill="black">Tariffs</text>
                    {/* Teeth */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <polygon
                            key={i}
                            points={`${485 + i * 10},282 ${490 + i * 10},282 ${487.5 + i * 10},295`}
                            fill="black"
                        />
                    ))}
                </g>

                {/* Ground */}
                <rect x="0" y="580" width="900" height="20" fill="#228B22" />
            </svg>
        </main>
    );
}

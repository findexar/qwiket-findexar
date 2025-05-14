'use client';

import React from 'react';

export default function HomePage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-white">
            <h1 className="text-2xl font-bold mb-6">Political Cartoon: Tariffs and Prosperity</h1>
            <svg width="800" height="500" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
                {/* Tree trunk */}
                <rect x="380" y="100" width="40" height="400" fill="#8B5A2B" />
                <text x="400" y="95" textAnchor="middle" fontSize="16" fill="black">Global Trade</text>

                {/* Branch */}
                <rect x="400" y="200" width="250" height="20" fill="#A0522D" transform="rotate(-10 400 200)" />
                <text x="500" y="190" textAnchor="middle" fontSize="14" fill="black" transform="rotate(-10 500 190)">
                    US Prosperity
                </text>

                {/* Saw */}
                <rect x="460" y="210" width="80" height="10" fill="gray" transform="rotate(-10 460 210)" />
                <text x="500" y="220" textAnchor="middle" fontSize="12" fill="black" transform="rotate(-10 500 220)">
                    Tariffs
                </text>

                {/* Saw teeth */}
                {Array.from({ length: 10 }).map((_, i) => (
                    <polygon
                        key={i}
                        points={`${465 + i * 7},220 ${468 + i * 7},220 ${466.5 + i * 7},230`}
                        fill="black"
                        transform="rotate(-10 500 220)"
                    />
                ))}

                {/* Trump-like figure */}
                <circle cx="430" cy="190" r="20" fill="#FFA07A" /> {/* Head */}
                <path d="M420,210 Q430,230 440,210" fill="#00008B" /> {/* Body */}
                <text x="430" y="195" textAnchor="middle" fontSize="12" fill="black">T</text>

                {/* Ground */}
                <rect x="0" y="480" width="800" height="20" fill="#228B22" />
            </svg>
        </main>
    );
}

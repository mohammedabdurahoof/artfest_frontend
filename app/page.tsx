"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation';
import './globals.css';

export default function HomePage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/login');
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Redirecting to login...</p>
            </div>
        </div>
    );
}
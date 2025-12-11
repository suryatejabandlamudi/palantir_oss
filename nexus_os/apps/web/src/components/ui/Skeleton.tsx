import React from 'react';
import { cn } from '@/lib/utils'; // Assuming cn exists, if not will use clsx/tailwind-merge directly or just string concat

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={`animate-pulse rounded-md bg-slate-100/50 ${className}`}
            {...props}
        />
    );
}

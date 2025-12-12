
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
    try {
        // Simple polling fetch: get latest 50 logs
        const logs = await prisma.terminalLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 50
        });
        // Reverse them for terminal display (oldest at top usually? or newest at bottom? standard terminal is append to bottom)
        // We fetching desc to get latest, but client might want asc. Let's return desc and let client handle or return asc.
        // Actually for chat/logs, usually we want historical order.
        return NextResponse.json(logs.reverse());
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
    }
}

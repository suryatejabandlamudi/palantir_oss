
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        // Fetch active alerts, most recent first
        const alerts = await prisma.alert.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { timestamp: 'desc' },
            take: 20
        });
        return NextResponse.json(alerts);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
    }
}


import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const fleet = await prisma.vehicle.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(fleet);
    } catch (e) {
        return NextResponse.json({ error: 'Failed to fetch fleet' }, { status: 500 });
    }
}

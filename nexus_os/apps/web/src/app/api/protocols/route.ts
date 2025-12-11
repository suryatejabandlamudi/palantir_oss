import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
    try {
        const protocolsRaw = await prisma.protocol.findMany({
            include: {
                steps: {
                    include: { action: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        // Map to Frontend Protocol Structure
        const protocols = protocolsRaw.map(p => ({
            ...p,
            contextSchema: JSON.parse(p.contextSchema), // Parse JSON
            steps: {
                // Map relational steps back to legacy "ProtocolSteps" shape if needed by UI
                // The UI expects: trigger, conditions, actions.
                // Our DB model is: ProtocolStep -> IntegrationAction.
                // We need to map this carefully or update UI to handle new shape.
                // For now, let's reconstruct the legacy shape for backward compatibility.
                trigger: JSON.parse(p.triggerConfig || '{}'), // DB stores trigger in triggerConfig
                conditions: [], // Conditions were not explicitly modeled in new schema step? Ah, distinct logic.
                // Wait, new schema: ProtocolStep.logicConfig.
                // If we want to keep UI working 100%, we should try to map it back.
                // But specifically for the "Actions" list in UI:
                actions: p.steps.map(s => ({
                    id: s.action?.key || s.id,
                    type: 'AUTOMATION', // Default
                    system: s.action?.integrationId || 'internal',
                    action: s.action?.name || 'unknown',
                    params: JSON.parse(s.action?.schema || '{}')
                }))
            }
        }));

        return NextResponse.json(protocols);
    } catch (error) {
        console.error('Error fetching protocols:', error);
        return NextResponse.json({ error: 'Failed to fetch protocols' }, { status: 500 });
    }
}

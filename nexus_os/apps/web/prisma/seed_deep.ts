import { PrismaClient } from '@prisma/client';
import { INITIAL_PROTOCOLS } from '../src/lib/protocols';

const prisma = new PrismaClient();

async function main() {
    // 0. Clean Slate
    try {
        await prisma.runLog.deleteMany();
        await prisma.protocolRun.deleteMany();
        await prisma.protocolStep.deleteMany();
        await prisma.protocol.deleteMany();
        await prisma.externalResource.deleteMany();
        await prisma.integrationAction.deleteMany();
        await prisma.integration.deleteMany();
    } catch (e) {
        console.log('Clean slate failed (expected if tables empty):', e);
    }

    console.log(`🌱 Starting Deep Enterprise Seeding for ${INITIAL_PROTOCOLS.length} Protocols...`);

    // Helper Maps to avoid duplicates
    const systemMap = new Map<string, string>(); // systemName -> integrationId
    const actionMap = new Map<string, string>(); // actionKey -> actionId

    for (const p of INITIAL_PROTOCOLS) {
        console.log(`Processing [${p.id}] ${p.title}...`);

        // 1. Ensure Integrations and Actions exist for this protocol
        // Legacy protocols have steps.actions array
        for (const stepAction of p.steps.actions) {
            const sysKey = stepAction.system.toUpperCase();
            const actionKey = stepAction.action; // e.g., "lock_user" OR the specific ID from legacy if unique? Legacy uses "action" as the verb.
            // stepAction also has "id" e.g. "a_sec1".
            // Let's use `stepAction.action` as the key for the IntegrationAction (e.g. "lock_user").
            // However, different systems might have "lock_user". So unique key should be `${sysKey}_${actionKey}`.

            const uniqueActionKey = `${sysKey}_${actionKey}`.toLowerCase(); // e.g. salesforce_lock_user

            // 1a. Upsert Integration
            if (!systemMap.has(sysKey)) {
                const integ = await prisma.integration.upsert({
                    where: { systemId: sysKey.toLowerCase() },
                    update: {},
                    create: {
                        systemId: sysKey.toLowerCase(),
                        type: sysKey,
                        name: `${sysKey} Production`,
                        status: 'ACTIVE',
                        config: '{}',
                        credentials: '{}'
                    }
                });
                systemMap.set(sysKey, integ.id);
            }
            const integId = systemMap.get(sysKey)!;

            // 1b. Upsert Action
            if (!actionMap.has(stepAction.id)) {
                // Special case for OPS-001 description improvement (hack for demo)
                let desc = `Execute ${stepAction.action}`;
                let name = stepAction.action;
                if (stepAction.id === 'ops_check_production' || stepAction.id === 'sap_check_inventory') {
                    name = 'Check Production Schedule';
                    desc = 'Verify incoming production schedule before ordering';
                }
                // Map legacy OPS name fix if needed
                if (p.id === 'OPS-001' && (actionKey === 'check_production_schedule' || actionKey === 'check_inventory')) {
                    name = 'Check Production Schedule';
                    desc = 'Verify incoming production schedule before ordering';
                }

                const act = await prisma.integrationAction.create({
                    data: {
                        integrationId: integId,
                        key: stepAction.id,
                        name: name,
                        description: desc,
                        schema: JSON.stringify(stepAction.params || {})
                    }
                });
                actionMap.set(stepAction.id, act.id);
            }
        }

        // 2. Create Protocol
        const createdP = await prisma.protocol.upsert({
            where: { id: p.id },
            update: {
                contextSchema: JSON.stringify(p.contextSchema), // Updates schema if changed in legacy
            },
            create: {
                id: p.id,
                title: p.title,
                description: p.description,
                category: p.category,
                status: 'ACTIVE',
                triggerType: 'EVENT',
                triggerConfig: JSON.stringify(p.steps.trigger || {}),
                contextSchema: JSON.stringify(p.contextSchema)
            }
        });

        // 3. Create Protocol Steps
        let order = 1;
        for (const stepAction of p.steps.actions) {
            const actionId = actionMap.get(stepAction.id); // Retrieve by the ID we used as key
            if (actionId) {
                await prisma.protocolStep.create({
                    data: {
                        protocolId: createdP.id,
                        order: order++,
                        description: `Step for ${stepAction.id}`,
                        actionId: actionId,
                        logicType: 'LLM_DECISION',
                        logicConfig: '{}'
                    }
                });
            }
        }
    }

    // 4. Mock External Resources ("Real Data") - Keep SAP example
    const sap = await prisma.integration.findUnique({ where: { systemId: 'sap' } }) || await prisma.integration.findFirst({ where: { type: 'SAP' } });
    if (sap) {
        await prisma.externalResource.create({
            data: {
                integrationId: sap.id,
                externalId: 'SKU-BATTERY-PACK-X',
                type: 'INVENTORY_ITEM',
                name: 'Tesla Model Y Battery Pack',
                metadata: JSON.stringify({ stock: 45, warehouse: 'US-West' }),
                lastSyncedAt: new Date()
            }
        });
    }

    console.log('🚀 Deep Seeding Complete (All Dynamic).');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

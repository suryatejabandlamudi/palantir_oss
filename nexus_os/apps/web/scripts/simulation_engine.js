
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Initial Fleet Data (Tesla Fleet)
const INITIAL_FLEET = [
    { name: 'T-800', model: 'Cybertruck', location: 'Austin, TX', lat: 30.2672, lng: -97.7431, battery: 85, status: 'ACTIVE', speed: 45, heading: 90 },
    { name: 'X-99', model: 'Model X Plaid', location: 'Fremont, CA', lat: 37.5485, lng: -121.9886, battery: 92, status: 'ACTIVE', speed: 65, heading: 180 },
    { name: 'S-PF', model: 'Model S', location: 'Palo Alto, CA', lat: 37.4419, lng: -122.1430, battery: 45, status: 'IDLE', speed: 0, heading: 0 },
    { name: 'Y-Giga', model: 'Model Y', location: 'Berlin, DE', lat: 52.5200, lng: 13.4050, battery: 78, status: 'ACTIVE', speed: 120, heading: 270 },
];

async function seedFleet() {
    console.log("🌱 Seeding Fleet...");
    for (const v of INITIAL_FLEET) {
        const existing = await prisma.vehicle.findFirst({ where: { name: v.name } });
        if (!existing) {
            await prisma.vehicle.create({ data: v });
        }
    }
}

async function updateFleet() {
    const vehicles = await prisma.vehicle.findMany({ where: { status: 'ACTIVE' } });

    for (const v of vehicles) {
        // Simulate movement: Random walk
        const latChange = (Math.random() - 0.5) * 0.01;
        const lngChange = (Math.random() - 0.5) * 0.01;
        const newSpeed = Math.max(0, Math.min(150, v.speed + (Math.random() - 0.5) * 10)); // Speed jitter
        const newBattery = Math.max(0, v.battery - 0.1); // Drain battery

        await prisma.vehicle.update({
            where: { id: v.id },
            data: {
                lat: v.lat + latChange,
                lng: v.lng + lngChange,
                speed: Math.round(newSpeed),
                battery: Math.round(newBattery),
                updatedAt: new Date()
            }
        });

        // Trigger Alert if speeding
        if (newSpeed > 100) {
            await createAlert(
                `Speed Violation: ${v.name}`,
                'FLEET',
                'HIGH',
                `Vehicle ${v.name} exceeded 100mph (Current: ${Math.round(newSpeed)}mph) at ${v.lat.toFixed(4)}, ${v.lng.toFixed(4)}.`
            );
        }
    }
}

async function createAlert(title, category, severity, message) {
    // Dedup: Don't create if recent alert exists
    const recent = await prisma.alert.findFirst({
        where: { title, timestamp: { gt: new Date(Date.now() - 60000) } } // 1 min cooldown
    });

    if (!recent) {
        console.log(`🚨 ALERT: ${title}`);
        await prisma.alert.create({
            data: { title, category, severity, message, status: 'ACTIVE' }
        });
        await logToTerminal('SYSTEM', `Alert Generated: ${title}`);
    }
}

async function logToTerminal(type, message) {
    await prisma.terminalLog.create({
        data: { type, message, source: 'SimulationEngine' }
    });
    console.log(`[${type}] ${message}`);
}

async function runSimulation() {
    try {
        await seedFleet();
        console.log("🚀 Simulation Engine Started via Prisma (JS Mode)...");

        // Loop
        setInterval(async () => {
            try {
                await updateFleet();
            } catch (e) {
                console.error("Error updating fleet:", e);
            }
        }, 2000); // Every 2s

        setInterval(async () => {
            try {
                // Random System Logs
                const msgs = [
                    "Scanning network traffic...",
                    "Optimizing route for T-800...",
                    "Checking giga-press hydraulic pressure...",
                    "Syncing Sentinel-1 telemetry...",
                    "Analysing patterns in sector 7..."
                ];
                const msg = msgs[Math.floor(Math.random() * msgs.length)];
                await logToTerminal('SYSTEM', msg);
            } catch (e) {
                console.error("Error logging:", e);
            }
        }, 5000); // Every 5s
    } catch (e) {
        console.error("Crash:", e);
    }
}

// Start
runSimulation();

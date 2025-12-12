
import axios from 'axios';

const routes = [
    '/',
    '/gotham',
    '/ontology',
    '/erp',
    '/crm',
    '/hcm',
    '/protocols',
    '/builder',
    '/aip/terminals',
    '/warp',
    '/ciso/sec-001',
    '/supply-chain',
    '/finance'
];

const baseUrl = 'http://localhost:3000';

async function checkRoutes() {
    console.log('Checking routes...');
    let success = true;
    for (const route of routes) {
        try {
            const url = `${baseUrl}${route}`;
            const start = Date.now();
            const res = await axios.get(url);
            const duration = Date.now() - start;
            console.log(`[PASS] ${route} - Status: ${res.status} - Time: ${duration}ms`);
        } catch (error: any) {
            success = false;
            if (error.response) {
                console.error(`[FAIL] ${route} - Status: ${error.response.status}`);
            } else {
                console.error(`[FAIL] ${route} - Error: ${error.message}`);
            }
        }
    }
    if (!success) {
        process.exit(1);
    }
}

checkRoutes();

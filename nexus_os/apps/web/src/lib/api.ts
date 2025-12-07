const API_BASE_URL = 'http://localhost:8000';

// --- Auth Helpers ---

export function setToken(token: string) {
    if (typeof window !== 'undefined') {
        localStorage.setItem('nexus_token', token);
    }
}

export function getToken(): string | null {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('nexus_token');
    }
    return null;
}

export async function login(username: string, password: string): Promise<boolean> {
    // Mock Login (or call API if endpoint existed)
    // For now, simple success
    if (username && password) {
        setToken(`mock-token-${Date.now()}`);
        return true;
    }
    return false;
}

export function removeToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('nexus_token');
    }
}

// --- API Client ---

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Token expired or invalid
        removeToken();
        // Redirect logic can be handled here or in components
        // For now, we just throw
        throw new Error('Unauthorized');
    }

    return res;
}

export const api = {
    // --- Ontology ---
    getObjectTypes: async () => {
        try {
            const res = await fetchWithAuth('/ontology/types');
            if (!res.ok) throw new Error('Failed to fetch object types');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    getObjects: async (objectTypeId?: string) => {
        try {
            const url = objectTypeId
                ? `/objects?object_type_id=${objectTypeId}`
                : `/objects`;
            const res = await fetchWithAuth(url);
            if (!res.ok) throw new Error('Failed to fetch objects');
            return await res.json();
        } catch (e) {
            console.error(e);
            return [];
        }
    },

    createObject: async (data: any) => {
        const res = await fetchWithAuth('/objects', {
            method: 'POST',
            body: JSON.stringify(data),
        });
        if (!res.ok) throw new Error('Failed to create object');
        return res.json();
    },

    // --- Agents ---
    chatWithAgent: async (message: string, history: any[], role: string = 'admin') => {
        try {
            const res = await fetchWithAuth('/chat', {
                method: 'POST',
                body: JSON.stringify({ message, history, role })
            });
            if (!res.ok) throw new Error('Chat failed');
            return await res.json();
        } catch (e) {
            console.error(e);
            return { response: "Error connecting to Agent backend.", tool_calls: [] };
        }
    },

    // --- AIP Logic ---
    runAIPLogic: async (graph: any, inputs: any) => {
        try {
            const res = await fetchWithAuth('/aip/logic/run', {
                method: 'POST',
                body: JSON.stringify({ graph, inputs })
            });
            if (!res.ok) throw new Error('Logic run failed');
            return await res.json();
        } catch (e) {
            console.error(e);
            return { error: String(e) };
        }
    },

    // --- Apollo (DevOps) ---
    triggerDeployment: async (env: string, version: string) => {
        const res = await fetchWithAuth('/apollo/deploy', {
            method: 'POST',
            body: JSON.stringify({ env, version }),
        });
        if (!res.ok) throw new Error('Deployment failed');
        return res.json();
    },

    getDeploymentStatus: async () => {
        try {
            const res = await fetchWithAuth('/apollo/status');
            if (!res.ok) throw new Error('Status check failed');
            return await res.json();
        } catch (e) {
            console.error(e);
            return null;
        }
    }
};

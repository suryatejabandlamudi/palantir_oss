const API_BASE_URL = 'http://127.0.0.1:8000';

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

export function removeToken() {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('nexus_token');
    }
}

export async function login(username: string, password: string): Promise<void> {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const res = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
    });

    if (!res.ok) {
        throw new Error('Login failed');
    }

    const data = await res.json();
    setToken(data.access_token);
}

// --- API Client ---

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = getToken();
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (res.status === 401) {
        // Token expired or invalid
        removeToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
        throw new Error('Unauthorized');
    }

    return res;
}

export async function getObjectTypes() {
    const res = await fetchWithAuth('/ontology/types');
    return res.json();
}

export async function getObjectType(id: string) {
    const res = await fetchWithAuth(`/ontology/types/${id}`);
    return res.json();
}

export async function getObjects(typeId: string) {
    const res = await fetchWithAuth(`/objects?object_type_id=${typeId}`);
    return res.json();
}

export async function getObject(id: string) {
    const res = await fetchWithAuth(`/objects/${id}`);
    return res.json();
}

export async function createObject(data: any) {
    const res = await fetchWithAuth('/objects', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return res.json();
}

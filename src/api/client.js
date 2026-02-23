// ===== API CLIENT =====
// Frontend API client for communicating with the QalqanAI backend.

const API_BASE = '/api';

export async function analyzeUrl(url) {
    const response = await fetch(`${API_BASE}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(err.error || 'Analysis failed');
    }

    return response.json();
}

export async function getCluster(url) {
    const params = url ? `?url=${encodeURIComponent(url)}` : '';
    const response = await fetch(`${API_BASE}/cluster${params}`);

    if (!response.ok) {
        throw new Error('Failed to load cluster data');
    }

    return response.json();
}

export async function getBlocklist() {
    const response = await fetch(`${API_BASE}/blocklist`);

    if (!response.ok) {
        throw new Error('Failed to load blocklist');
    }

    return response.json();
}

export async function getStats() {
    const response = await fetch(`${API_BASE}/stats`);

    if (!response.ok) {
        throw new Error('Failed to load stats');
    }

    return response.json();
}

export async function healthCheck() {
    const response = await fetch(`${API_BASE}/health`);
    return response.json();
}

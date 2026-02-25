// ===== NLP EMBEDDING SERVICE =====
// Uses Transformers.js v3 to generate text embeddings from URL features
// and compute semantic similarity between domains for graph connections.
// Model: all-MiniLM-L6-v2 (384-dim sentence embeddings, ~23MB ONNX)

import { pipeline, env } from '@huggingface/transformers';

// Configure for browser usage
env.allowLocalModels = false;
env.useBrowserCache = true;

let embedder = null;
let loadingPromise = null;

// Load the embedding model (runs in browser via WASM/WebGPU)
async function getEmbedder() {
    if (embedder) return embedder;
    if (loadingPromise) return loadingPromise;

    loadingPromise = (async () => {
        try {
            console.log('⏳ Loading NLP embedding model...');
            embedder = await pipeline(
                'feature-extraction',
                'Xenova/all-MiniLM-L6-v2',
                { dtype: 'q8' },
            );
            console.log('✓ NLP embedding model loaded successfully');
            return embedder;
        } catch (err) {
            console.error('✗ Failed to load NLP model:', err);
            loadingPromise = null;
            return null;
        }
    })();

    return loadingPromise;
}

// Begin loading immediately on import (non-blocking)
getEmbedder();

/**
 * Build descriptive text from domain features for embedding.
 * Captures the "digital fingerprint" of a website as natural language.
 */
export function buildFeatureText(domain, features, riskResult) {
    const parts = [domain];

    // Domain structure analysis
    const tld = domain.split('.').pop();
    parts.push(`TLD ${tld}`);
    if (domain.includes('-')) parts.push('hyphenated domain name');
    if (/\d/.test(domain)) parts.push('domain contains numbers');
    if (domain.length > 20) parts.push('unusually long domain');

    // Category and risk level
    if (riskResult.category) parts.push(`category ${riskResult.category}`);
    if (riskResult.riskScore >= 80) parts.push('high risk dangerous malicious');
    else if (riskResult.riskScore >= 50) parts.push('medium risk suspicious');
    else parts.push('low risk safe benign');

    // Hosting infrastructure
    if (features.hosting) {
        if (features.hosting.provider) parts.push(`hosted on ${features.hosting.provider}`);
        if (features.hosting.country) parts.push(`server in ${features.hosting.country}`);
        if (features.hosting.type) parts.push(`${features.hosting.type} hosting`);
    }

    // TLS certificate info
    if (features.tls) {
        if (features.tls.issuer) parts.push(`TLS certificate by ${features.tls.issuer}`);
        if (features.tls.selfSigned) parts.push('self-signed certificate untrusted');
    }

    // Tracking & marketing
    if (features.trackers) {
        if (features.trackers.gaId) parts.push(`Google Analytics ${features.trackers.gaId}`);
        if (features.trackers.fbPixel) parts.push(`Facebook Pixel tracking`);
        if (features.trackers.popunders) parts.push('popup ads popunder aggressive');
        if (features.trackers.adNetworks?.length) parts.push(`ad networks ${features.trackers.adNetworks.join(' ')}`);
    }

    // Financial signals
    if (features.financial) {
        if (features.financial.cryptoWallet) parts.push(`cryptocurrency wallet payment`);
        if (features.financial.paymentForm) parts.push('payment form checkout');
        if (features.financial.depositButton) parts.push('deposit button gambling betting');
    }

    // Risk explanations
    if (riskResult.explanations) {
        riskResult.explanations.slice(0, 5).forEach(e => {
            if (e.label) parts.push(e.label);
        });
    }

    return parts.join('. ');
}

/**
 * Generate a 384-dim embedding vector from text.
 * Returns a plain JS array or null if model not ready.
 */
export async function generateEmbedding(text) {
    const model = await getEmbedder();
    if (!model) return null;

    try {
        const output = await model(text, { pooling: 'mean', normalize: true });
        return Array.from(output.data);
    } catch (err) {
        console.error('Embedding generation error:', err);
        return null;
    }
}

/**
 * Cosine similarity between two embedding vectors.
 * Returns value in [-1, 1]; 1 = identical, 0 = orthogonal.
 */
export function cosineSimilarity(a, b) {
    if (!a || !b || a.length !== b.length) return 0;
    let dot = 0, normA = 0, normB = 0;
    for (let i = 0; i < a.length; i++) {
        dot += a[i] * b[i];
        normA += a[i] * a[i];
        normB += b[i] * b[i];
    }
    const denom = Math.sqrt(normA) * Math.sqrt(normB);
    return denom === 0 ? 0 : dot / denom;
}

// Similarity threshold for creating graph edges
export const SIMILARITY_THRESHOLD = 0.55;

/**
 * Check if the NLP model is loaded and ready.
 */
export function isModelReady() {
    return embedder !== null;
}

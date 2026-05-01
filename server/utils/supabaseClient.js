const dns = require("dns");
const https = require("https");
const { createClient } = require("@supabase/supabase-js");
const AppError = require("./appError");

const resolver = new dns.Resolver();
resolver.setServers(
    (process.env.SUPABASE_DNS_SERVERS || "1.1.1.1,8.8.8.8")
        .split(",")
        .map(server => server.trim())
        .filter(Boolean)
);

const lookupWithPublicDns = (hostname, options, callback) => {
    const done = typeof options === "function" ? options : callback;
    const lookupOptions = typeof options === "function" ? {} : options;

    resolver.resolve4(hostname, (ipv4Error, ipv4Addresses) => {
        if (!ipv4Error && ipv4Addresses?.length) {
            if (lookupOptions.all) {
                done(null, ipv4Addresses.map(address => ({ address, family: 4 })));
                return;
            }

            done(null, ipv4Addresses[0], 4);
            return;
        }

        resolver.resolve6(hostname, (ipv6Error, ipv6Addresses) => {
            if (!ipv6Error && ipv6Addresses?.length) {
                if (lookupOptions.all) {
                    done(null, ipv6Addresses.map(address => ({ address, family: 6 })));
                    return;
                }

                done(null, ipv6Addresses[0], 6);
                return;
            }

            dns.lookup(hostname, options, done);
        });
    });
};

const getHeaders = (headers) => {
    if (!headers) return {};
    if (typeof headers.entries === "function") {
        return Object.fromEntries(headers.entries());
    }
    return headers;
};

const getRequestBody = async (body) => {
    if (!body) return null;
    if (Buffer.isBuffer(body) || typeof body === "string") return body;
    if (body instanceof Uint8Array) return Buffer.from(body);
    if (body instanceof ArrayBuffer) return Buffer.from(body);
    if (typeof body.arrayBuffer === "function") {
        return Buffer.from(await body.arrayBuffer());
    }
    return body;
};

const supabaseFetch = async (resource, options = {}) => {
    const url = new URL(resource.url || resource);
    const method = options.method || resource.method || "GET";
    const bodySource = options.body ?? (
        typeof resource.arrayBuffer === "function" && !["GET", "HEAD"].includes(method)
            ? resource
            : null
    );
    const body = await getRequestBody(bodySource);
    const headers = getHeaders(options.headers || resource.headers);

    if (body !== null && !Object.keys(headers).some(header => header.toLowerCase() === "content-length")) {
        headers["content-length"] = Buffer.byteLength(body).toString();
    }

    return new Promise((resolve, reject) => {
        const request = https.request({
            method,
            hostname: url.hostname,
            port: url.port || 443,
            path: `${url.pathname}${url.search}`,
            headers,
            lookup: lookupWithPublicDns,
        }, response => {
            const chunks = [];

            response.on("data", chunk => chunks.push(chunk));
            response.on("end", () => {
                resolve(new Response(Buffer.concat(chunks), {
                    status: response.statusCode,
                    statusText: response.statusMessage,
                    headers: response.headers,
                }));
            });
        });

        request.on("error", reject);

        if (options.signal) {
            options.signal.addEventListener("abort", () => {
                request.destroy(options.signal.reason);
            });
        }

        if (body !== null) request.write(body);
        request.end();
    });
};

let warnedMissingServiceRoleKey = false;

const getSupabaseConfig = () => {
    const supabaseUrl = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL)?.trim();
    const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)?.trim();
    const fallbackKey = (
        process.env.SUPABASE_ANON_KEY ||
        process.env.SUPABASE_KEY ||
        process.env.SUPABASE_PUBLISHABLE_KEY ||
        process.env.VITE_SUPABASE_PUBLISHABLE_KEY
    )?.trim();
    const supabaseKey = serviceRoleKey || fallbackKey;

    if (!supabaseUrl || !supabaseKey) {
        throw new AppError("Supabase storage is not configured", 500);
    }

    if (!serviceRoleKey && !warnedMissingServiceRoleKey) {
        warnedMissingServiceRoleKey = true;
        console.warn("SUPABASE_SERVICE_ROLE_KEY is not set; falling back to a public Supabase key for server storage operations.");
    }

    return { supabaseUrl, supabaseKey };
};

const createSupabaseClient = () => {
    const { supabaseUrl, supabaseKey } = getSupabaseConfig();

    return createClient(supabaseUrl, supabaseKey, {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        global: {
            fetch: supabaseFetch,
        },
    });
};

const getSupabaseErrorMessage = (error) => {
    const message = error?.message || error?.error_description || error?.error || "Unknown Supabase storage error";
    const cause = error?.originalError?.cause || error?.cause;

    if (cause?.code || cause?.hostname) {
        return `${message} (${[cause.code, cause.hostname].filter(Boolean).join(": ")})`;
    }

    return message;
};

module.exports = {
    createSupabaseClient,
    getSupabaseConfig,
    getSupabaseErrorMessage,
    supabaseFetch,
};

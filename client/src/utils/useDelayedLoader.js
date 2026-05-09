import { useState, useEffect } from "react";

/**
 * Returns { loading, showLoader }.
 * - `loading` starts true, set it to false when your fetch completes.
 * - `showLoader` becomes true only after 1s, so fast loads never flash the loader.
 *
 * Usage:
 *   const { loading, setLoading, showLoader } = useDelayedLoader();
 *   if (loading && showLoader) return <PageLoader />;
 *   if (loading) return <div className="min-h-screen bg-[#0a0a0a]" />;
 */
export default function useDelayedLoader(delayMs = 1000) {
    const [loading, setLoading] = useState(true);
    const [showLoader, setShowLoader] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setShowLoader(true), delayMs);
        return () => clearTimeout(timer);
    }, [delayMs]);

    // Auto-clear loader flag when loading finishes
    useEffect(() => {
        if (!loading) setShowLoader(false);
    }, [loading]);

    return { loading, setLoading, showLoader };
}

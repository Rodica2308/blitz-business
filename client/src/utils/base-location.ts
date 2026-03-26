import { useEffect, useState, useCallback } from "react";

// This helper handles issues with routing in production
// by ensuring all paths are processed correctly relative to the base URL
const useBaseLocation = () => {
  const [path, setPath] = useState(window.location.pathname);
  
  useEffect(() => {
    // Handle navigation events
    const handler = () => setPath(window.location.pathname);
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);
  
  // Custom navigate function that maintains query parameters
  const navigateTo = useCallback((to: string) => {
    window.history.pushState(null, "", to);
    setPath(to);
  }, []);
  
  return [path, navigateTo];
};

export default useBaseLocation;
import { useState, useCallback } from "react";
import { Location } from "@shared/schema";

export const useMap = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  
  // Handle location selection
  const selectLocation = useCallback((location: Location) => {
    setSelectedLocation(location);
  }, []);
  
  // Clear selected location
  const clearSelectedLocation = useCallback(() => {
    setSelectedLocation(null);
  }, []);
  
  // Mark map as loaded
  const setMapLoaded = useCallback(() => {
    setIsMapLoaded(true);
  }, []);
  
  return {
    selectedLocation,
    isMapLoaded,
    selectLocation,
    clearSelectedLocation,
    setMapLoaded,
  };
};

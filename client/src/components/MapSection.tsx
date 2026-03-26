import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Map from "@/components/ui/map";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Location } from "@shared/schema";
import LocationModal from "@/components/LocationModal";
import LoginModal from "@/components/LoginModal";
import { useToast } from "@/hooks/use-toast";
import { Search, Loader2 } from "lucide-react";

const MapSection = () => {
  const [location, params] = useLocation();
  const { toast } = useToast();
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(params || window.location.search);
  const categoryParam = urlParams.get("category");
  const subcategoryParam = urlParams.get("subcategory");
  
  // State for filters and search
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : ["sport", "ong", "djst"]
  );
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | undefined>(
    subcategoryParam || undefined
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch locations
  const {
    data: locations = [],
    isLoading,
    error,
  } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Handle location selection
  const handleLocationSelect = (location: Location) => {
    setSelectedLocation(location);
  };

  // Handle category toggle
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else {
        return [...prev, category];
      }
    });
  };

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter locations based on selected categories
  const filteredLocations = locations.filter(
    (location) => selectedCategories.includes(location.category)
  );

  // Listen for login modal open event
  useState(() => {
    const handleOpenLoginModal = () => {
      setShowLoginModal(true);
    };

    window.addEventListener("open-login-modal", handleOpenLoginModal);

    return () => {
      window.removeEventListener("open-login-modal", handleOpenLoginModal);
    };
  });

  // Show error if locations fetch fails
  if (error) {
    toast({
      title: "Error loading locations",
      description: "Failed to load locations. Please try again later.",
      variant: "destructive",
    });
  }

  return (
    <div className="relative h-full">
      {/* Map */}
      <Map
        locations={filteredLocations}
        onLocationSelect={handleLocationSelect}
        selectedCategory={categoryParam || undefined}
        selectedSubcategory={selectedSubcategory}
        searchQuery={searchQuery}
      />

      {/* Search Bar */}
      <div className="absolute top-4 left-4 right-4 lg:left-auto lg:w-96 z-10">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={handleSearch}
            className="pl-10 pr-4 py-2 bg-white dark:bg-gray-800 shadow-sm"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="absolute top-16 left-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-10">
        <h4 className="font-medium text-sm mb-2">Filter Locations</h4>
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="sportFilter"
              checked={selectedCategories.includes("sport")}
              onCheckedChange={() => handleCategoryToggle("sport")}
              className="text-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
            />
            <Label
              htmlFor="sportFilter"
              className="text-sm font-normal cursor-pointer"
            >
              Sport Facilities
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="ongFilter"
              checked={selectedCategories.includes("ong")}
              onCheckedChange={() => handleCategoryToggle("ong")}
              className="text-secondary data-[state=checked]:bg-secondary data-[state=checked]:text-secondary-foreground"
            />
            <Label
              htmlFor="ongFilter"
              className="text-sm font-normal cursor-pointer"
            >
              ONG Locations
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="djstFilter"
              checked={selectedCategories.includes("djst")}
              onCheckedChange={() => handleCategoryToggle("djst")}
              className="text-accent data-[state=checked]:bg-accent data-[state=checked]:text-accent-foreground"
            />
            <Label
              htmlFor="djstFilter"
              className="text-sm font-normal cursor-pointer"
            >
              DJST HD Offices
            </Label>
          </div>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute top-4 right-4 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg z-10">
        <h4 className="font-medium text-sm mb-2">Legend</h4>
        <div className="space-y-1.5">
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-primary inline-block mr-2"></span>
            <span className="text-xs">Sport Facilities</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-secondary inline-block mr-2"></span>
            <span className="text-xs">ONG Locations</span>
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 rounded-full bg-accent inline-block mr-2"></span>
            <span className="text-xs">DJST HD Offices</span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-30 dark:bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <p className="text-lg font-medium">Loading locations...</p>
          </div>
        </div>
      )}

      {/* Location Detail Modal */}
      {selectedLocation && (
        <LocationModal
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal onClose={() => setShowLoginModal(false)} />
      )}
    </div>
  );
};

export default MapSection;

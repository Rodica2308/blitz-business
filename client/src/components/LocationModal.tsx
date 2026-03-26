import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Location, SportSection } from "@shared/schema";
import { MapPin, Phone, User, ExternalLink } from "lucide-react";

interface LocationModalProps {
  location: Location;
  onClose: () => void;
}

const LocationModal = ({ location, onClose }: LocationModalProps) => {
  // Parse sport sections from JSON if it exists
  const sportSections: SportSection[] = location.sportSections ? 
    (typeof location.sportSections === 'string' 
      ? JSON.parse(location.sportSections as string) 
      : location.sportSections as SportSection[]) 
    : [];

  // Handle "Get Directions" button click
  const handleGetDirections = () => {
    if (location.latitude && location.longitude) {
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`,
        "_blank"
      );
    }
  };

  // Get category-specific color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "sport":
        return "text-primary dark:text-blue-400";
      case "ong":
        return "text-secondary dark:text-emerald-400";
      case "djst":
        return "text-accent dark:text-amber-400";
      default:
        return "text-gray-600 dark:text-gray-300";
    }
  };

  // Get category-specific icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "sport":
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 0-6.88 17.26M12 2a10 10 0 0 1 6.88 17.26"/><circle cx="12" cy="12" r="3"/></svg>;
      case "ong":
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
      case "djst":
        return <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20v2H2z"/><path d="M12 2L2 8h20L12 2z"/><path d="M5 10v8h3v-8H5z"/><path d="M10.5 10v8h3v-8h-3z"/><path d="M16 10v8h3v-8h-3z"/></svg>;
      default:
        return <MapPin className="h-5 w-5" />;
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <span className={getCategoryColor(location.category)}>
              {getCategoryIcon(location.category)}
            </span>
            {location.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 my-2">
          {/* Location Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
              {/* We would ideally have an image here, but we're not generating mock data */}
              <div className="h-52 flex items-center justify-center text-gray-400 bg-gray-200 dark:bg-gray-700">
                <span className="text-sm">[Location image would appear here]</span>
              </div>
            </div>
            <div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 h-full space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {location.address}
                  </p>
                </div>
                {location.phone && (
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 text-primary dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {location.phone}
                    </p>
                  </div>
                )}
                {location.contactPerson && (
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-primary dark:text-blue-400 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {location.contactPerson}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description */}
          {location.description && (
            <div>
              <h4 className="text-lg font-medium mb-2">Description</h4>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {location.description}
              </p>
            </div>
          )}

          {/* Sport Sections - only show for sport category */}
          {location.category === "sport" && sportSections.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-3">Sport Sections</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sportSections.map((section, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <h5 className="font-medium text-primary dark:text-blue-400 mb-2">
                      {section.name}
                    </h5>
                    <div className="space-y-2">
                      {section.schedule && (
                        <div className="flex">
                          <span className="text-sm font-medium w-24">Schedule:</span>
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {section.schedule}
                          </span>
                        </div>
                      )}
                      {section.trainers && section.trainers.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Trainers:</p>
                          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 ml-4">
                            {section.trainers.map((trainer, trainerIdx) => (
                              <li key={trainerIdx}>
                                {trainer.name}
                                {trainer.phone && ` - ${trainer.phone}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Facilities */}
          {location.facilities && location.facilities.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-3">Facilities</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {location.facilities.map((facility, idx) => (
                  <div
                    key={idx}
                    className="flex items-center bg-gray-50 dark:bg-gray-700 p-2 rounded"
                  >
                    <span className="text-primary dark:text-blue-400 mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                        <polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </span>
                    <span className="text-sm">{facility}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={handleGetDirections}>
            <ExternalLink className="h-4 w-4 mr-2" />
            Get Directions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;

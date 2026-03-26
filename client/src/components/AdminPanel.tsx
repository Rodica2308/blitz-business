import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Location, SportSection, sportSectionSchema } from "@shared/schema";
import { Search, Plus, Edit, Trash, Loader2 } from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Location form schema
const locationFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  latitude: z.number().or(z.string().transform(v => parseFloat(v))),
  longitude: z.number().or(z.string().transform(v => parseFloat(v))),
  phone: z.string().optional(),
  contactPerson: z.string().optional(),
  email: z.string().email().optional().or(z.string().length(0)),
  facilities: z.array(z.string()).optional(),
  description: z.string().optional(),
  sportSections: z.array(sportSectionSchema).optional(),
});

type LocationFormValues = z.infer<typeof locationFormSchema>;

const AdminPanel = ({ isOpen, onClose }: AdminPanelProps) => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddLocationModalOpen, setIsAddLocationModalOpen] = useState(false);
  const [locationToEdit, setLocationToEdit] = useState<Location | null>(null);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [activeTab, setActiveTab] = useState("locations");

  // Fetch locations
  const {
    data: locations = [],
    isLoading,
  } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Create location mutation
  const createLocation = useMutation({
    mutationFn: async (data: LocationFormValues) => {
      // Convert sportSections to JSON string for storage
      const locationData = {
        ...data,
        sportSections: data.sportSections || [],
        facilities: data.facilities || [],
      };
      
      const res = await apiRequest("POST", "/api/locations", locationData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setIsAddLocationModalOpen(false);
      toast({
        title: "Success",
        description: "Location added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add location: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update location mutation
  const updateLocation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: LocationFormValues }) => {
      // Convert sportSections to JSON string for storage
      const locationData = {
        ...data,
        sportSections: data.sportSections || [],
        facilities: data.facilities || [],
      };
      
      const res = await apiRequest("PUT", `/api/locations/${id}`, locationData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setLocationToEdit(null);
      toast({
        title: "Success",
        description: "Location updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update location: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete location mutation
  const deleteLocation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/locations/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
      setLocationToDelete(null);
      toast({
        title: "Success",
        description: "Location deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete location: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Filter locations based on search query
  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get category badge color
  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case "sport":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "ong":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "djst":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full md:max-w-[800px] sm:max-w-full p-0 overflow-y-auto">
          <SheetHeader className="p-4 border-b dark:border-gray-700">
            <SheetTitle className="text-xl">Admin Panel</SheetTitle>
          </SheetHeader>

          <div className="p-4">
            <Tabs defaultValue="locations" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="locations">Manage Locations</TabsTrigger>
                <TabsTrigger value="account">Account</TabsTrigger>
              </TabsList>

              <TabsContent value="locations">
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <Button
                      onClick={() => setIsAddLocationModalOpen(true)}
                      className="whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add New Location
                    </Button>
                    <div className="relative flex-1">
                      <Input
                        type="text"
                        placeholder="Search locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto border rounded-lg dark:border-gray-700">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Address
                          </th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {isLoading ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center">
                              <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                              <p className="mt-2 text-gray-500 dark:text-gray-400">
                                Loading locations...
                              </p>
                            </td>
                          </tr>
                        ) : filteredLocations.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                              {searchQuery
                                ? "No locations found for your search query."
                                : "No locations added yet. Add your first location."}
                            </td>
                          </tr>
                        ) : (
                          filteredLocations.map((location) => (
                            <tr
                              key={location.id}
                              className="hover:bg-gray-50 dark:hover:bg-gray-700"
                            >
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="font-medium">{location.name}</div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <Badge variant="outline" className={getCategoryBadgeColor(location.category)}>
                                  {location.category === "sport"
                                    ? "Sport Facility"
                                    : location.category === "ong"
                                    ? "ONG"
                                    : "DJST HD"}
                                </Badge>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {location.address}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocationToEdit(location)}
                                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setLocationToDelete(location)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <Trash className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="account">
                <div className="mb-6">
                  <h4 className="text-lg font-medium mb-3">Account Settings</h4>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      You are logged in as an administrator
                    </p>
                    <Button variant="destructive" onClick={onClose}>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Close Admin Panel
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </SheetContent>
      </Sheet>

      {/* Add/Edit Location Modal */}
      {(isAddLocationModalOpen || locationToEdit) && (
        <LocationForm
          isOpen={true}
          onClose={() => {
            setIsAddLocationModalOpen(false);
            setLocationToEdit(null);
          }}
          location={locationToEdit}
          onSubmit={(data) => {
            if (locationToEdit) {
              updateLocation.mutate({ id: locationToEdit.id, data });
            } else {
              createLocation.mutate(data);
            }
          }}
          isSubmitting={createLocation.isPending || updateLocation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {locationToDelete && (
        <Dialog open={true} onOpenChange={() => setLocationToDelete(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <p className="py-4">
              Are you sure you want to delete <strong>{locationToDelete.name}</strong>? This action cannot be undone.
            </p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setLocationToDelete(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteLocation.mutate(locationToDelete.id)}
                disabled={deleteLocation.isPending}
              >
                {deleteLocation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Location form component
interface LocationFormProps {
  isOpen: boolean;
  onClose: () => void;
  location: Location | null;
  onSubmit: (data: LocationFormValues) => void;
  isSubmitting: boolean;
}

const LocationForm = ({ isOpen, onClose, location, onSubmit, isSubmitting }: LocationFormProps) => {
  const form = useForm<LocationFormValues>({
    resolver: zodResolver(locationFormSchema),
    defaultValues: location
      ? {
          ...location,
          sportSections: location.sportSections 
            ? (typeof location.sportSections === 'string' 
              ? JSON.parse(location.sportSections as string) 
              : location.sportSections as SportSection[])
            : [],
          facilities: location.facilities || [],
        }
      : {
          name: "",
          category: "sport",
          subcategory: "",
          address: "",
          latitude: 0,
          longitude: 0,
          phone: "",
          contactPerson: "",
          email: "",
          description: "",
          sportSections: [],
          facilities: [],
        },
  });

  // Facilities field array
  const { fields: facilityFields, append: appendFacility, remove: removeFacility } = useFieldArray({
    control: form.control,
    name: "facilities",
  });

  // Sport sections field array
  const { fields: sectionFields, append: appendSection, remove: removeSection } = useFieldArray({
    control: form.control,
    name: "sportSections",
  });

  // Handle geocoding of address
  const handleGeocodeAddress = () => {
    const address = form.getValues("address");
    
    if (!address) {
      return;
    }
    
    // Use Google Maps Geocoding API
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === "OK" && results && results[0]) {
        const lat = results[0].geometry.location.lat();
        const lng = results[0].geometry.location.lng();
        
        form.setValue("latitude", lat);
        form.setValue("longitude", lng);
      } else {
        // Show error
        alert("Geocoding failed. Please enter coordinates manually.");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{location ? "Edit Location" : "Add New Location"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name *</Label>
              <Input
                id="name"
                {...form.register("name")}
                placeholder="Enter location name"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                {...form.register("category")}
                className="w-full p-2 rounded-md border dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="sport">Sport Facility</option>
                <option value="ong">ONG</option>
                <option value="djst">DJST HD</option>
              </select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
          </div>

          {form.watch("category") === "sport" && (
            <div className="space-y-2">
              <Label htmlFor="subcategory">Sport Facility Type</Label>
              <select
                id="subcategory"
                {...form.register("subcategory")}
                className="w-full p-2 rounded-md border dark:border-gray-600 dark:bg-gray-700"
              >
                <option value="">Select a type</option>
                <option value="structure">Structură Sportivă</option>
                <option value="stadium">Stadion</option>
                <option value="field">Teren de sport</option>
                <option value="hall">Sală de Sport</option>
                <option value="tennis">Bază de tenis</option>
              </select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                {...form.register("address")}
                placeholder="Enter full address"
                className="flex-1"
              />
              <Button type="button" onClick={handleGeocodeAddress} variant="outline">
                Geocode
              </Button>
            </div>
            {form.formState.errors.address && (
              <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="latitude">Latitude *</Label>
              <Input
                id="latitude"
                type="number"
                step="any"
                {...form.register("latitude", { valueAsNumber: true })}
                placeholder="Enter latitude"
              />
              {form.formState.errors.latitude && (
                <p className="text-sm text-red-500">{form.formState.errors.latitude.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude *</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                {...form.register("longitude", { valueAsNumber: true })}
                placeholder="Enter longitude"
              />
              {form.formState.errors.longitude && (
                <p className="text-sm text-red-500">{form.formState.errors.longitude.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="Enter contact phone"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                {...form.register("contactPerson")}
                placeholder="Enter contact person"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...form.register("email")}
              placeholder="Enter email address"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              {...form.register("description")}
              className="w-full p-2 rounded-md border dark:border-gray-600 dark:bg-gray-700 min-h-[100px]"
              placeholder="Enter description"
            />
          </div>

          {/* Facilities */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Facilities</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendFacility("")}
              >
                Add Facility
              </Button>
            </div>

            {facilityFields.length === 0 ? (
              <p className="text-sm text-gray-500 italic">No facilities added yet.</p>
            ) : (
              <div className="space-y-2">
                {facilityFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...form.register(`facilities.${index}`)}
                      placeholder="Enter facility name"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFacility(index)}
                      className="text-red-500"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sport Sections (only for sport category) */}
          {form.watch("category") === "sport" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sport Sections</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    appendSection({
                      name: "",
                      schedule: "",
                      trainers: [],
                    })
                  }
                >
                  Add Sport Section
                </Button>
              </div>

              {sectionFields.length === 0 ? (
                <p className="text-sm text-gray-500 italic">No sport sections added yet.</p>
              ) : (
                <div className="space-y-4">
                  {sectionFields.map((field, index) => (
                    <div key={field.id} className="border p-3 rounded-md dark:border-gray-700">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">Sport Section {index + 1}</h4>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSection(index)}
                          className="text-red-500 h-8 w-8 p-0"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor={`sportSections.${index}.name`}>Sport Name</Label>
                          <Input
                            id={`sportSections.${index}.name`}
                            {...form.register(`sportSections.${index}.name`)}
                            placeholder="e.g. Basketball, Tennis"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label htmlFor={`sportSections.${index}.schedule`}>Schedule</Label>
                          <Input
                            id={`sportSections.${index}.schedule`}
                            {...form.register(`sportSections.${index}.schedule`)}
                            placeholder="e.g. Mon-Fri, 16:00-20:00"
                          />
                        </div>

                        <div className="space-y-1">
                          <Label>Trainers</Label>
                          <div className="space-y-2">
                            {form.watch(`sportSections.${index}.trainers`)?.map(
                              (trainer, trainerIndex) => (
                                <div
                                  key={trainerIndex}
                                  className="flex flex-col sm:flex-row sm:items-end gap-2"
                                >
                                  <div className="flex-1 space-y-1">
                                    <Label
                                      htmlFor={`sportSections.${index}.trainers.${trainerIndex}.name`}
                                      className="text-xs"
                                    >
                                      Name
                                    </Label>
                                    <Input
                                      id={`sportSections.${index}.trainers.${trainerIndex}.name`}
                                      {...form.register(
                                        `sportSections.${index}.trainers.${trainerIndex}.name`
                                      )}
                                      placeholder="Trainer name"
                                    />
                                  </div>
                                  <div className="flex-1 space-y-1">
                                    <Label
                                      htmlFor={`sportSections.${index}.trainers.${trainerIndex}.phone`}
                                      className="text-xs"
                                    >
                                      Phone
                                    </Label>
                                    <Input
                                      id={`sportSections.${index}.trainers.${trainerIndex}.phone`}
                                      {...form.register(
                                        `sportSections.${index}.trainers.${trainerIndex}.phone`
                                      )}
                                      placeholder="Phone number"
                                    />
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      const trainers = [...form.getValues(`sportSections.${index}.trainers`) || []];
                                      trainers.splice(trainerIndex, 1);
                                      form.setValue(`sportSections.${index}.trainers`, trainers);
                                    }}
                                    className="text-red-500 h-8 w-8 p-0 mt-1"
                                  >
                                    <Trash className="h-4 w-4" />
                                  </Button>
                                </div>
                              )
                            )}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const trainers = [...form.getValues(`sportSections.${index}.trainers`) || []];
                                trainers.push({ name: "", phone: "" });
                                form.setValue(`sportSections.${index}.trainers`, trainers);
                              }}
                            >
                              Add Trainer
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {location ? "Updating..." : "Creating..."}
                </>
              ) : location ? (
                "Update Location"
              ) : (
                "Create Location"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;

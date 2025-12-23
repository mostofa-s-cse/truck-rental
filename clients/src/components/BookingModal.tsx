"use client";

import { useState, useEffect, useCallback } from 'react';
import type { SyntheticEvent } from 'react';
import { X, Truck, MapPin, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useSweetAlert } from '@/hooks/useSweetAlert';
import { apiClient } from '@/lib/api';
import { Driver } from '@/types';
import { useAppSelector } from '@/hooks/redux';
import DynamicMap from '@/components/ui/DynamicMap';

interface BookingModalProps {
  driver: Driver | null;
  isOpen: boolean;
  onClose: () => void;
  onBookingComplete: () => void;
}

interface BookingFormData {
  source: string;
  destination: string;
  pickupTime: string;
  fare: number;
  distance: number;
  sourceLat?: number;
  sourceLng?: number;
  destLat?: number;
  destLng?: number;
  // Detailed address parts (optional)
  sourceHouse?: string;
  sourceRoad?: string;
  sourceAreaDetail?: string;
  sourceCity?: string;
  destHouse?: string;
  destRoad?: string;
  destAreaDetail?: string;
  destCity?: string;
}

interface AreaData {
  value: string;
  label: string;
  area: string;
  latitude: number;
  longitude: number;
}

interface ServerArea {
  id: string;
  name: string;
  city: string;
  latitude: number;
  longitude: number;
  address: string;
}

type TruckImageItem = string | { url?: string; path?: string; src?: string };

export default function BookingModal({
  driver,
  isOpen,
  onClose,
  onBookingComplete,
}: BookingModalProps) {
  const { errorToast, successToast, question } = useSweetAlert();
  const { user } = useAppSelector((state) => state.auth);

  // Helper function to get proper image URL
  const getImageUrl = (imagePath: string | undefined | null): string => {
    if (!imagePath) return "";

    // If it's already a full URL (http/https), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // For local uploads, ensure the path starts with /
    // Next.js rewrites will proxy to the backend
    const normalizedPath = imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

    return normalizedPath;
  };

  // Normalize possible shapes of truckImages coming from API
  const normalizeTruckImages = (
    imgs: TruckImageItem | TruckImageItem[] | null | undefined
  ): string[] => {
    if (!imgs) return [];
    const toStringUrl = (item: TruckImageItem): string | null => {
      if (typeof item === 'string') return item;
      if (item.url) return item.url;
      if (item.path) return item.path;
      if (item.src) return item.src;
      return null;
    };
    if (Array.isArray(imgs)) {
      return imgs.map(toStringUrl).filter((v): v is string => typeof v === 'string');
    }
    const single = toStringUrl(imgs);
    return single ? [single] : [];
  };

  // Compose a full address using detailed parts and base label
  const formatFullAddress = (
    baseLabel: string,
    house?: string,
    road?: string,
    area?: string,
    city?: string
  ): string => {
    const clean = (s?: string) => (s || "").trim();
    const splitTokens = (s?: string) => {
      const c = clean(s);
      return c ? c.split(",").map((t) => t.trim()).filter(Boolean) : [];
    };

    const orderedTokens: string[] = [];

    if (house && house.trim()) orderedTokens.push(`House ${house.trim()}`);
    if (road && road.trim()) orderedTokens.push(`Road ${road.trim()}`);

    // Area may include comma-separated parts (e.g., "Nikunja 2, Khilkhet, Dhaka")
    orderedTokens.push(...splitTokens(area));

    if (city && city.trim()) orderedTokens.push(city.trim());

    // Base label often includes area + city (e.g., "Khilkhet, Dhaka").
    const baseTokens = splitTokens(baseLabel);

    // Ordered de-duplication (case-insensitive)
    const seen = new Set<string>();
    const result: string[] = [];
    const add = (token: string) => {
      const key = token.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(token);
      }
    };

    for (const t of orderedTokens) add(t);
    for (const t of baseTokens) add(t);

    // Fallback: if nothing after cleaning, return original base label
    return result.length ? result.join(", ") : clean(baseLabel);
  };

  // Form states
  const [bookingData, setBookingData] = useState<BookingFormData>({
    source: "",
    destination: "",
    pickupTime: "",
    fare: 0,
    distance: 0,
    sourceHouse: "",
    sourceRoad: "",
    sourceAreaDetail: "",
    sourceCity: "Dhaka",
    destHouse: "",
    destRoad: "",
    destAreaDetail: "",
    destCity: "Dhaka",
  });

  // UI states
  const [step, setStep] = useState<"booking" | "success" | "error">("booking");
  const [isLoading, setIsLoading] = useState(false);
  const [calculatedFare, setCalculatedFare] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Selected area coordinates
  const [selectedSourceArea, setSelectedSourceArea] = useState<AreaData | null>(null);
  const [selectedDestinationArea, setSelectedDestinationArea] = useState<AreaData | null>(null);

  const [areaOptions, setAreaOptions] = useState<AreaData[]>([]);
  const [sourceQuery, setSourceQuery] = useState<string>("");
  const [destinationQuery, setDestinationQuery] = useState<string>("");

  // Route details for map preview
  const [routeDetails, setRouteDetails] = useState<{
    distance: number;
    duration: number;
    routeGeometry: string;
    waypoints: Array<{ latitude: number; longitude: number }>;
  } | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setStep("booking");
      setBookingData({
        source: "",
        destination: "",
        pickupTime: "",
        fare: 0,
        distance: 0,
        sourceHouse: "",
        sourceRoad: "",
        sourceAreaDetail: "",
        sourceCity: "Dhaka",
        destHouse: "",
        destRoad: "",
        destAreaDetail: "",
        destCity: "Dhaka",
      });
      setCalculatedFare(0);
      setSelectedSourceArea(null);
      setSelectedDestinationArea(null);
      setErrorMessage(null);
    } else {
      // Ensure calculated fare is reset when modal closes
      setCalculatedFare(0);
    }
  }, [isOpen]);

  // Load Dhaka areas for dropdown search (server provides all Dhaka areas)
  useEffect(() => {
    const loadAreas = async () => {
      try {
        const res = await apiClient.getDhakaAreas(undefined, 500);
        if (res?.success && Array.isArray(res.data)) {
          setAreaOptions(
            res.data.map((a: ServerArea) => ({
              value: a.id,
              label: `${a.name}, ${a.city}`,
              area: a.address,
              latitude: a.latitude,
              longitude: a.longitude,
            }))
          );
        }
      } catch {
        // ignore
      }
    };
    if (isOpen) loadAreas();
  }, [isOpen]);

  const fetchRouteDetails = useCallback(async () => {
    try {
      if (!selectedSourceArea || !selectedDestinationArea) {
        return;
      }

      const sourceAddressFull = formatFullAddress(
        bookingData.source,
        bookingData.sourceHouse,
        bookingData.sourceRoad,
        bookingData.sourceAreaDetail,
        bookingData.sourceCity
      );
      const destAddressFull = formatFullAddress(
        bookingData.destination,
        bookingData.destHouse,
        bookingData.destRoad,
        bookingData.destAreaDetail,
        bookingData.destCity
      );

      const response = await apiClient.getRouteDetails(
        {
          latitude: selectedSourceArea.latitude,
          longitude: selectedSourceArea.longitude,
          address: sourceAddressFull,
        },
        {
          latitude: selectedDestinationArea.latitude,
          longitude: selectedDestinationArea.longitude,
          address: destAddressFull,
        }
      );
      if (response.success && response.data) {
        setRouteDetails(response.data);
      }
    } catch (error) {
      console.error("Error fetching route details:", error);
    }
  }, [
    selectedSourceArea,
    selectedDestinationArea,
    bookingData.source,
    bookingData.destination,
    bookingData.sourceHouse,
    bookingData.sourceRoad,
    bookingData.sourceAreaDetail,
    bookingData.sourceCity,
    bookingData.destHouse,
    bookingData.destRoad,
    bookingData.destAreaDetail,
    bookingData.destCity,
  ]);

  const calculateFare = useCallback(async () => {
    try {
      // Use coordinates from selected areas if available
      if (!selectedSourceArea || !selectedDestinationArea) {
        return; // Don't calculate if areas aren't selected
      }

      // Fetch route details for map display
      await fetchRouteDetails();

      const sourceAddressFull = formatFullAddress(
        bookingData.source,
        bookingData.sourceHouse,
        bookingData.sourceRoad,
        bookingData.sourceAreaDetail,
        bookingData.sourceCity
      );
      const destAddressFull = formatFullAddress(
        bookingData.destination,
        bookingData.destHouse,
        bookingData.destRoad,
        bookingData.destAreaDetail,
        bookingData.destCity
      );

      const response = await apiClient.calculateFare({
        source: {
          latitude: selectedSourceArea.latitude,
          longitude: selectedSourceArea.longitude,
          address: sourceAddressFull,
        },
        destination: {
          latitude: selectedDestinationArea.latitude,
          longitude: selectedDestinationArea.longitude,
          address: destAddressFull,
        },
        truckType: driver!.truckType,
      });

      if (response.success && response.data) {
        const fareData = response.data;
        setCalculatedFare(fareData.totalFare);
        setBookingData((prev) => ({
          ...prev,
          fare: fareData.totalFare,
          distance: fareData.distance,
          sourceLat: selectedSourceArea.latitude,
          sourceLng: selectedSourceArea.longitude,
          destLat: selectedDestinationArea.latitude,
          destLng: selectedDestinationArea.longitude,
        }));
      }
    } catch (error) {
      console.error("Error calculating fare:", error);
      // Set a default fare if calculation fails
      setCalculatedFare(500); // Default 500 BDT
      setBookingData((prev) => ({
        ...prev,
        fare: 500,
        distance: 10, // Default 10 km
      }));
    }
  }, [
    selectedSourceArea,
    selectedDestinationArea,
    bookingData.source,
    bookingData.destination,
    driver,
    fetchRouteDetails,
    bookingData.sourceHouse,
    bookingData.sourceRoad,
    bookingData.sourceAreaDetail,
    bookingData.sourceCity,
    bookingData.destHouse,
    bookingData.destRoad,
    bookingData.destAreaDetail,
    bookingData.destCity,
  ]);

  // Calculate fare when selected areas change
  useEffect(() => {
    if (selectedSourceArea && selectedDestinationArea && driver) {
      void calculateFare();
    }
  }, [selectedSourceArea, selectedDestinationArea, driver, calculateFare]);

  const handleBookingSubmit = async () => {
    if (!driver) return;

    // Debug: Check authentication status
    console.log("Booking submit - Authentication check:", {
      isAuthenticated: !!user,
      user: user,
      token: localStorage.getItem("token"),
      tokenLength: localStorage.getItem("token")?.length,
    });

    // Check if user is authenticated
    if (!user || !localStorage.getItem("token")) {
      errorToast("Please login to create a booking");
      return;
    }

    // Validate booking data
    if (
      !bookingData.source ||
      !bookingData.destination ||
      !bookingData.pickupTime
    ) {
      errorToast("Please fill in all required fields");
      return;
    }

    if (calculatedFare <= 0) {
      errorToast("Please enter valid source and destination to calculate fare");
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiClient.createBooking({
        driverId: driver.id,
        source: formatFullAddress(
          bookingData.source,
          bookingData.sourceHouse,
          bookingData.sourceRoad,
          bookingData.sourceAreaDetail,
          bookingData.sourceCity
        ),
        destination: formatFullAddress(
          bookingData.destination,
          bookingData.destHouse,
          bookingData.destRoad,
          bookingData.destAreaDetail,
          bookingData.destCity
        ),
        sourceLat: bookingData.sourceLat,
        sourceLng: bookingData.sourceLng,
        destLat: bookingData.destLat,
        destLng: bookingData.destLng,
        distance: bookingData.distance,
        fare: calculatedFare,
      });

      if (response.success && response.data) {
        const bookingDataResponse = response.data as { id: string };
        console.log("Booking created successfully:", {
          bookingId: bookingDataResponse.id,
          response: response,
        });
        setStep("success");
        successToast(
          "Booking created successfully! The driver will complete the trip and you can pay afterwards."
        );
      } else {
        console.error("Booking creation failed:", response);
        errorToast(response.message || "Failed to create booking");
      }
    } catch (error) {
      console.error("Error creating booking:", error);
      errorToast("Failed to create booking. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = async () => {
    if (
      step === "booking" &&
      (bookingData.source || bookingData.destination || calculatedFare > 0)
    ) {
      // Use SweetAlert confirmation
      const result = await question(
        "Are you sure you want to cancel this booking? All entered data will be lost.",
        "Cancel Booking"
      );

      if (result.isConfirmed) {
        // Reset all form data and calculated fare
        setBookingData({
          source: "",
          destination: "",
          pickupTime: "",
          fare: 0,
          distance: 0,
        });
        setCalculatedFare(0);
        onClose();
      }
    } else {
      // Reset calculated fare even if no data entered
      setCalculatedFare(0);
      onClose();
    }
  };

  if (!isOpen || !driver) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {step === "booking" && "Book Truck"}
            {step === "success" && "Booking Successful"}
            {step === "error" && "Booking Error"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Main Truck Image */}
          {driver?.truckImage && (
            <div className="mb-4">
              <div className="relative h-40 sm:h-48 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={getImageUrl(driver.truckImage) || "/placeholder-truck.jpg"}
                  alt={`${driver?.user?.name ?? 'Driver'}'s truck`}
                  fill
                  className="object-cover"
                  unoptimized
                  onError={(e: SyntheticEvent<HTMLImageElement>) => {
                    // Hide container on error
                    const container = (e.target as HTMLImageElement).closest(
                      ".mb-4"
                    ) as HTMLElement;
                    if (container) container.style.display = "none";
                  }}
                />
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  Main Truck
                </div>
              </div>
            </div>
          )}

          {/* Additional Truck Images Gallery */}
          {normalizeTruckImages(driver?.truckImages).length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                  <Truck className="w-3 h-3 mr-1" />
                  More Views:
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {normalizeTruckImages(driver?.truckImages).map((image, idx) => (
                    <div
                      key={idx}
                      className="flex-shrink-0 w-20 h-16 sm:w-24 sm:h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors bg-gray-100 relative"
                    >
                      <Image
                        src={getImageUrl(image) || "/placeholder-truck.jpg"}
                        alt={`Truck view ${idx + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                        unoptimized
                        onError={(e: SyntheticEvent<HTMLImageElement>) => {
                          // Hide this specific image on error
                          const container = (e.target as HTMLImageElement).closest(
                            ".flex-shrink-0"
                          ) as HTMLElement;
                          if (container) container.style.display = "none";
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Driver Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {driver?.user?.name ?? 'Driver'}
                </h3>
                <p className="text-sm text-gray-600">
                  {(driver?.truckType || '').replace("_", " ")}{driver?.capacity ? ` • ${driver.capacity} tons` : ''}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {driver?.location ?? 'Unknown location'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Form */}
          {step === "booking" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Pickup Location */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pickup Location *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bookingData.source}
                      onChange={(e) => {
                        setBookingData((prev) => ({
                          ...prev,
                          source: e.target.value,
                        }));
                        setSourceQuery(e.target.value);
                      }}
                      disabled={isLoading}
                      placeholder="Type to search Dhaka locations..."
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {sourceQuery && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {areaOptions
                          .filter((area) =>
                            area.label.toLowerCase().includes(sourceQuery.toLowerCase())
                          )
                          .slice(0, 10)
                          .map((area) => (
                            <button
                              key={area.value}
                              onClick={() => {
                                setBookingData((prev) => ({
                                  ...prev,
                                  source: area.label,
                                }));
                                setSelectedSourceArea(area);
                                setSourceQuery("");
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                            >
                              <div className="font-medium">{area.label}</div>
                              <div className="text-gray-500 text-xs">{area.area}</div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  {/* Detailed Pickup Address */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={bookingData.sourceHouse || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, sourceHouse: e.target.value }))
                      }
                      disabled={isLoading}
                      placeholder="House/Basa No. (e.g., 13)"
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    <input
                      type="text"
                      value={bookingData.sourceRoad || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, sourceRoad: e.target.value }))
                      }
                      disabled={isLoading}
                      placeholder="Road No. (e.g., 10)"
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={bookingData.sourceAreaDetail || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, sourceAreaDetail: e.target.value }))
                      }
                      disabled={isLoading}
                      placeholder="Area/Sector (e.g., Nikunja 2)"
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    <input
                      type="text"
                      value={bookingData.sourceCity || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, sourceCity: e.target.value }))
                      }
                      disabled={isLoading}
                      placeholder="City (e.g., Dhaka)"
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {/* Destination */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={bookingData.destination}
                      onChange={(e) => {
                        setBookingData((prev) => ({
                          ...prev,
                          destination: e.target.value,
                        }));
                        setDestinationQuery(e.target.value);
                      }}
                      disabled={isLoading}
                      placeholder="Type to search Dhaka locations..."
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {destinationQuery && (
                      <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
                        {areaOptions
                          .filter((area) =>
                            area.label.toLowerCase().includes(destinationQuery.toLowerCase())
                          )
                          .slice(0, 10)
                          .map((area) => (
                            <button
                              key={area.value}
                              onClick={() => {
                                setBookingData((prev) => ({
                                  ...prev,
                                  destination: area.label,
                                }));
                                setSelectedDestinationArea(area);
                                setDestinationQuery("");
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                            >
                              <div className="font-medium">{area.label}</div>
                              <div className="text-gray-500 text-xs">{area.area}</div>
                            </button>
                          ))}
                      </div>
                    )}
                  </div>
                  {/* Detailed Destination Address */}
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={bookingData.destHouse || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, destHouse: e.target.value }))
                      }
                      disabled={isLoading}
                      placeholder="House/Basa No. (e.g., 13)"
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    <input
                      type="text"
                      value={bookingData.destRoad || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, destRoad: e.target.value }))
                      }
                      disabled={isLoading}
                      placeholder="Road No. (e.g., 10)"
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={bookingData.destAreaDetail || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, destAreaDetail: e.target.value }))
                      }
                      disabled={isLoading}
                      placeholder="Area/Sector (e.g., Nikunja 2)"
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    <input
                      type="text"
                      value={bookingData.destCity || ''}
                      onChange={(e) =>
                        setBookingData((prev) => ({ ...prev, destCity: e.target.value }))
                      }
                      disabled={isLoading}
                      placeholder="City (e.g., Dhaka)"
                      className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pickup Time *
                </label>
                <input
                  type="datetime-local"
                  value={bookingData.pickupTime}
                  onChange={(e) =>
                    setBookingData((prev) => ({
                      ...prev,
                      pickupTime: e.target.value,
                    }))
                  }
                  disabled={isLoading}
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                />
              </div>

              {/* Map Preview */}
              {selectedSourceArea && selectedDestinationArea && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Route Preview</h4>
                  <div className="h-64 rounded-lg overflow-hidden">
                    <DynamicMap
                      sourceLat={selectedSourceArea.latitude}
                      sourceLng={selectedSourceArea.longitude}
                      destLat={selectedDestinationArea.latitude}
                      destLng={selectedDestinationArea.longitude}
                      routeGeometry={routeDetails?.routeGeometry}
                    />
                  </div>
                </div>
              )}

              {/* Fare Display */}
              {calculatedFare > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900">Estimated Fare</h4>
                      <p className="text-sm text-gray-600">
                        Distance: {bookingData.distance || 0} km
                      </p>
                      <p className="text-xs text-blue-600 mt-2">
                        Payment will be processed after trip completion
                      </p>
                    </div>
                    <span className="text-2xl font-bold text-green-600">৳{calculatedFare.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleBookingSubmit}
                  disabled={isLoading || calculatedFare <= 0}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Booking...
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4 mr-2" />
                      Create Booking
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Success State */}
          {step === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Booking Created Successfully!
              </h3>
              <p className="text-gray-600 mb-4">
                Your booking has been created and sent to the driver.
              </p>
              <p className="text-sm text-blue-600 mb-6">
                You will be notified to make payment after the driver completes the trip.
              </p>
              <Button
                onClick={() => {
                  onBookingComplete();
                  onClose();
                }}
                className="w-full"
              >
                View My Bookings
              </Button>
            </div>
          )}

          {/* Error State */}
          {step === "error" && (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Error</h3>
              {errorMessage && (
                <p className="text-gray-600 mb-4">{errorMessage}</p>
              )}
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => setStep("booking")}
                  variant="outline"
                >
                  Try Again
                </Button>
                <Button
                  onClick={handleClose}
                  variant="outline"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
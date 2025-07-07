import React from "react";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";
import API_BASE_URL from "../lib/utils.url.js";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { useState, useEffect } from "react";
import { haversineDistance } from "../lib/utils.js";

export default function Trip() {
  // Fix for default marker icon issue in Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tripInfo, setTripInfo] = useState([]);
  const [err, setErr] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    starttime: "",
    endtime: "",
    startlatitude1: null,
    startlongitude1: null,
    endlatitude1: null,
    endlongitude1: null,
    distancetravalled1: null,
  });
  const [formAnimation, setFormAnimation] = useState("opacity-100");
  const [markers, setMarkers] = useState([]);
  const [distancetravalled1, setdistancetravalled1] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [editFormData, setEditFormData] = useState({
    starttime: "",
    endtime: "",
    startlatitude1: null,
    startlongitude1: null,
    endlatitude1: null,
    endlongitude1: null,
    distancetravalled1: null,
    revenue: "",
  });
  const [editMarkers, setEditMarkers] = useState([]);
  const [editDistancetravalled1, setEditDistancetravalled1] = useState(null);

  useEffect(() => {
    getTripInfo();
  }, []);

  const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

  const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      },
    });
    return null;
  };
  // haversian distance formula
  const calculatedistancetravalled1 = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const point1 = L.latLng(lat1, lon1);
    const point2 = L.latLng(lat2, lon2);

    fetch(
      `https://api.openrouteservice.org/v2/isochrones/driving-car?api_key=5b3ce3597851110001cf62486cc0c7dfd89a427fb7c4696119ea8ad9&start=${lon1},${lat1}&end=${lon2},${lat2}`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        const distanceInMeters = data.routes[0].summary.distance;
        const distanceInKm = (distanceInMeters / 1000).toFixed(2);
        console.log(`${distanceInKm} km`);
      })
      .catch((error) => console.error(error));
    // console.log(distanceInKm);
    return R * c;
  };

  const handleComplete = async (trip) => {
    const registrationnumber = trip.registrationnumber;
    const endtime = trip.endtime;
    setSuccess("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/tripcompletion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ registrationnumber, endtime }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error in marking trip");
      }

      const result = await response.json();
      console.log("status here", result);
      setSuccess("Trip Marked Successfully!");
      setTimeout(() => setSuccess(null), 3000);
      console.log(result);

      // Refresh the trip data to update the UI
      getTripInfo();
    } catch (error) {
      setErr("Failed to mark the trip");
    }
  };

  const handleMapClick = async (lat, lng) => {
    setMarkers((prevMarkers) => {
      const newMarkers = [...prevMarkers, { lat, lng }];
      if (newMarkers.length === 2) {
        const dist = calculatedistancetravalled1(
          newMarkers[0].lat,
          newMarkers[0].lng,
          newMarkers[1].lat,
          newMarkers[1].lng
        );
        setdistancetravalled1(dist.toFixed(2));

        // Update formData with both markers and distancetravalled1
        setFormData((prev) => ({
          ...prev,
          startlatitude1: parseFloat(newMarkers[0].lat.toFixed(2)),
          startlongitude1: parseFloat(newMarkers[0].lng.toFixed(2)),
          endlatitude1: parseFloat(newMarkers[1].lat.toFixed(2)),
          endlongitude1: parseFloat(newMarkers[1].lng.toFixed(2)),
          distancetravalled1: parseInt(dist.toFixed(2)),
        }));
        // console.log(FormData);
      } else if (newMarkers.length > 2) {
        setdistancetravalled1(null);
        setFormData((prev) => ({
          ...prev,
          startlatitude1: null,
          startlongitude1: null,
          endlatitude1: null,
          endlongitude1: null,
          distancetravalled1: null,
        }));
        return [{ lat, lng }];
      } else {
        // Update just the start coordinates when first marker is placed
        setFormData((prev) => ({
          ...prev,
          startlatitude1: lat,
          startlongitude1: lng,
        }));
      }
      return newMarkers;
    });
  };

  const getTripInfo = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/get_all_trips`, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error fetching trip list");
      }

      const data = await response.json();
      // console.log(data);
      setTripInfo(data);
    } catch (error) {
      console.error("Failed to fetch trips:", error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");

    // Validate that all coordinates and distancetravalled1 are present
    if (
      !formData.startlatitude1 ||
      !formData.startlongitude1 ||
      !formData.endlatitude1 ||
      !formData.endlongitude1 ||
      !formData.distancetravalled1
    ) {
      setErr("Please select both start and end locations on the map");
      return;
    }

    try {
      // console.log(formData);
      const response = await fetch(`${API_BASE_URL}/api/tripregistered`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error registering trip");
      }

      const result = await response.json();
      console.log("Trips registered:", result);

      getTripInfo();

      // Reset form data
      setFormData({
        starttime: "",
        endtime: "",
        startlatitude1: null,
        startlongitude1: null,
        endlatitude1: null,
        endlongitude1: null,
        distancetravalled1: null,
      });
      setMarkers([]); // Clear markers
      setdistancetravalled1(null); // Reset distancetravalled1
      setSuccess("Trip Added Successfully!");

      setTimeout(() => {
        setSuccess(null);
      }, 3000);

      setFormAnimation("opacity-0");
      setTimeout(() => {
        setIsFormOpen(false);
        setFormAnimation("opacity-100");
      }, 300);
    } catch (error) {
      console.error("Error submitting form:", error.message);
      setErr(error.message || "Failed to add");
      setTimeout(() => {
        setErr(null);
      }, 3000);
    }
  };

  const handleCancel = () => {
    setFormAnimation("opacity-0");
    setTimeout(() => {
      setIsFormOpen(false);
      setFormAnimation("opacity-100");
    }, 300);
  };

  // Edit functionality
  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setEditFormData({
      starttime: new Date(trip.starttime).toISOString().split("T")[0],
      endtime: new Date(trip.endtime).toISOString().split("T")[0],
      startlatitude1: trip.startlatitude,
      startlongitude1: trip.startlongitude,
      endlatitude1: trip.endlatitude,
      endlongitude1: trip.endlongitude,
      distancetravalled1: trip.distancetravelled,
      revenue: trip.revenue,
    });
    setEditMarkers([
      { lat: trip.startlatitude, lng: trip.startlongitude },
      { lat: trip.endlatitude, lng: trip.endlongitude },
    ]);
    setEditDistancetravalled1(trip.distancetravelled);
    setIsEditMode(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditMapClick = async (lat, lng) => {
    setEditMarkers((prevMarkers) => {
      const newMarkers = [...prevMarkers, { lat, lng }];
      if (newMarkers.length === 2) {
        const dist = calculatedistancetravalled1(
          newMarkers[0].lat,
          newMarkers[0].lng,
          newMarkers[1].lat,
          newMarkers[1].lng
        );
        setEditDistancetravalled1(dist.toFixed(2));

        setEditFormData((prev) => ({
          ...prev,
          startlatitude1: parseFloat(newMarkers[0].lat.toFixed(2)),
          startlongitude1: parseFloat(newMarkers[0].lng.toFixed(2)),
          endlatitude1: parseFloat(newMarkers[1].lat.toFixed(2)),
          endlongitude1: parseFloat(newMarkers[1].lng.toFixed(2)),
          distancetravalled1: parseInt(dist.toFixed(2)),
        }));
      } else if (newMarkers.length > 2) {
        setEditDistancetravalled1(null);
        setEditFormData((prev) => ({
          ...prev,
          startlatitude1: null,
          startlongitude1: null,
          endlatitude1: null,
          endlongitude1: null,
          distancetravalled1: null,
        }));
        return [{ lat, lng }];
      } else {
        setEditFormData((prev) => ({
          ...prev,
          startlatitude1: lat,
          startlongitude1: lng,
        }));
      }
      return newMarkers;
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");

    if (
      !editFormData.startlatitude1 ||
      !editFormData.startlongitude1 ||
      !editFormData.endlatitude1 ||
      !editFormData.endlongitude1 ||
      !editFormData.distancetravalled1
    ) {
      setErr("Please select both start and end locations on the map");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/update_trip/${editingTrip.tripid}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(editFormData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating trip");
      }

      const result = await response.json();
      console.log("Trip updated:", result);

      getTripInfo();

      setEditFormData({
        starttime: "",
        endtime: "",
        startlatitude1: null,
        startlongitude1: null,
        endlatitude1: null,
        endlongitude1: null,
        distancetravalled1: null,
        revenue: "",
      });
      setEditMarkers([]);
      setEditDistancetravalled1(null);
      setEditingTrip(null);
      setIsEditMode(false);
      setSuccess("Trip Updated Successfully!");

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating trip:", error.message);
      setErr(error.message || "Failed to update");
      setTimeout(() => {
        setErr(null);
      }, 3000);
    }
  };

  const handleEditCancel = () => {
    setEditingTrip(null);
    setIsEditMode(false);
    setEditFormData({
      starttime: "",
      endtime: "",
      startlatitude1: null,
      startlongitude1: null,
      endlatitude1: null,
      endlongitude1: null,
      distancetravalled1: null,
      revenue: "",
    });
    setEditMarkers([]);
    setEditDistancetravalled1(null);
  };

  // Separate RoutingMachine component with better control management
  const RoutingMachine = ({ from, to, color = "#0000ff" }) => {
    // Added color prop with default value
    const map = useMap();
    const [routingControl, setRoutingControl] = useState(null);

    useEffect(() => {
      if (!map || !from || !to) return;

      try {
        // Remove existing routing control if it exists
        if (routingControl) {
          map.removeControl(routingControl);
        }

        // Create new routing control with dynamic color
        const control = L.Routing.control({
          waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: false,
          showAlternatives: false,
          lineOptions: {
            styles: [{ color: color, opacity: 0.6, weight: 4 }], // Use dynamic color here
          },
          createMarker: () => null, // Disable default markers
        })
          .on("routingerror", function (e) {
            console.log("Routing error:", e);
          })
          .addTo(map);

        setRoutingControl(control);

        // Cleanup function
        return () => {
          if (map && control) {
            try {
              control.getPlan().setWaypoints([]);
              map.removeControl(control);
              // Clean up any remaining routing layers
              map.eachLayer((layer) => {
                if (layer._routing) {
                  map.removeLayer(layer);
                }
              });
            } catch (error) {
              console.log("Cleanup error:", error);
            }
          }
        };
      } catch (error) {
        console.log("Routing control error:", error);
      }
    }, [map, from, to, color]); // Added color to dependency array

    return null;
  };
  // console.log(formData.startlatitude1);
  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black w-screen">
      <Navigation />
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900    border border-gray-700 shadow-2xl hover:shadow-blue-500 transition-shadow duration-300 mx-auto py-10 mt-4 mb-2 rounded-lg">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-bold text-white">Trips</h1>
                <p className="mt-2 text-lg text-gray-300">
                  Track and manage all fleet trips, including start/end times,
                  locations, distances traveled, and revenue generated. Monitor
                  trip completion status and driver assignments for
                  comprehensive fleet operations oversight.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <div className="text-center justify-center">
                  {err && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-5 text-center justify-center animate-pulse opacity-100 transition-opacity duration-3000 ease-in-out">
                      {err}
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg mb-5 text-center justify-center animate-pulse opacity-100 transition-opacity duration-3000 ease-in-out">
                      {success}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 transition hover:-translate-y-1"
                >
                  Add Trips
                </button>
              </div>
            </div>
            {isFormOpen && (
              <div
                className={`mt-8 bg-gray-800 p-6 rounded-lg shadow-md transition-opacity duration-300 ease-in-out ${formAnimation}`}
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Add New Trip
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="starttime"
                    >
                      Start Time
                    </label>
                    <input
                      type="text"
                      id="starttime"
                      name="starttime"
                      value={formData.starttime}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="endtime"
                    >
                      End Time
                    </label>
                    <input
                      type="text"
                      id="endtime"
                      name="endtime"
                      value={formData.endtime}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="endtime"
                    >
                      Revenue
                    </label>
                    <input
                      type="text"
                      id="revenue"
                      name="revenue"
                      value={formData.revenue}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <h2 className="text-center text-xl font-bold mt-4 mb-4 text-white">
                      {distancetravalled1
                        ? `distancetravalled1: ${distancetravalled1} km`
                        : "Click two points to calculate distancetravalled1"}
                    </h2>
                    <div className="text-sm text-gray-300 mb-4">
                      {formData.startlatitude1 && formData.startlongitude1 && (
                        <div>
                          Start: (
                          {typeof formData.startlatitude1 === "number"
                            ? formData.startlatitude1.toFixed(5)
                            : parseFloat(formData.startlatitude1 || 0).toFixed(
                                5
                              )}
                          ,{" "}
                          {typeof formData.startlongitude1 === "number"
                            ? formData.startlongitude1.toFixed(5)
                            : parseFloat(formData.startlongitude1 || 0).toFixed(
                                5
                              )}
                          )
                        </div>
                      )}
                      {formData.endlatitude1 && formData.endlongitude1 && (
                        <div>
                          End: (
                          {typeof formData.endlatitude1 === "number"
                            ? formData.endlatitude1.toFixed(5)
                            : parseFloat(formData.endlatitude1 || 0).toFixed(5)}
                          ,{" "}
                          {typeof formData.endlongitude1 === "number"
                            ? formData.endlongitude1.toFixed(5)
                            : parseFloat(formData.endlongitude1 || 0).toFixed(
                                5
                              )}
                          )
                        </div>
                      )}
                    </div>
                    <MapContainer
                      center={[12.9716, 77.5946]}
                      zoom={15}
                      style={{ height: "90vh", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                      />
                      <MapClickHandler onMapClick={handleMapClick} />
                      {markers.map((marker, index) => (
                        <Marker
                          key={index}
                          position={[marker.lat, marker.lng]}
                          icon={customIcon}
                        >
                          <Popup>
                            {index === 0 ? "Start Location" : "End Location"}
                            <br />
                            Latitude:{" "}
                            {typeof marker.lat === "number"
                              ? marker.lat.toFixed(5)
                              : parseFloat(marker.lat || 0).toFixed(5)}
                            <br />
                            Longitude:{" "}
                            {typeof marker.lng === "number"
                              ? marker.lng.toFixed(5)
                              : parseFloat(marker.lng || 0).toFixed(5)}
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="mr-4 px-4 py-2 bg-gray-600 text-sm font-medium text-white rounded-md hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-500 text-sm font-medium text-white rounded-md hover:bg-indigo-400"
                    >
                      Save
                    </button>
                  </div>
                </form>
              </div>
            )}
            {isEditMode && (
              <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Edit Trip: {editingTrip?.tripid}
                </h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_starttime"
                    >
                      Start Time
                    </label>
                    <input
                      type="date"
                      id="edit_starttime"
                      name="starttime"
                      value={editFormData.starttime}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_endtime"
                    >
                      End Time
                    </label>
                    <input
                      type="date"
                      id="edit_endtime"
                      name="endtime"
                      value={editFormData.endtime}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_revenue"
                    >
                      Revenue
                    </label>
                    <input
                      type="number"
                      id="edit_revenue"
                      name="revenue"
                      value={editFormData.revenue}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <h2 className="text-center text-xl font-bold mt-4 mb-4 text-white">
                      {editDistancetravalled1
                        ? `Distance: ${editDistancetravalled1} km`
                        : "Click two points to calculate distance"}
                    </h2>
                    <div className="text-sm text-gray-300 mb-4">
                      {editFormData.startlatitude1 &&
                        editFormData.startlongitude1 && (
                          <div>
                            Start: (
                            {typeof editFormData.startlatitude1 === "number"
                              ? editFormData.startlatitude1.toFixed(5)
                              : parseFloat(
                                  editFormData.startlatitude1 || 0
                                ).toFixed(5)}
                            ,{" "}
                            {typeof editFormData.startlongitude1 === "number"
                              ? editFormData.startlongitude1.toFixed(5)
                              : parseFloat(
                                  editFormData.startlongitude1 || 0
                                ).toFixed(5)}
                            )
                          </div>
                        )}
                      {editFormData.endlatitude1 &&
                        editFormData.endlongitude1 && (
                          <div>
                            End: (
                            {typeof editFormData.endlatitude1 === "number"
                              ? editFormData.endlatitude1.toFixed(5)
                              : parseFloat(
                                  editFormData.endlatitude1 || 0
                                ).toFixed(5)}
                            ,{" "}
                            {typeof editFormData.endlongitude1 === "number"
                              ? editFormData.endlongitude1.toFixed(5)
                              : parseFloat(
                                  editFormData.endlongitude1 || 0
                                ).toFixed(5)}
                            )
                          </div>
                        )}
                    </div>
                    <MapContainer
                      center={[12.9716, 77.5946]}
                      zoom={15}
                      style={{ height: "90vh", width: "100%" }}
                    >
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"
                      />
                      <MapClickHandler onMapClick={handleEditMapClick} />
                      {editMarkers.map((marker, index) => (
                        <Marker
                          key={index}
                          position={[marker.lat, marker.lng]}
                          icon={customIcon}
                        >
                          <Popup>
                            {index === 0 ? "Start Location" : "End Location"}
                            <br />
                            Latitude:{" "}
                            {typeof marker.lat === "number"
                              ? marker.lat.toFixed(5)
                              : parseFloat(marker.lat || 0).toFixed(5)}
                            <br />
                            Longitude:{" "}
                            {typeof marker.lng === "number"
                              ? marker.lng.toFixed(5)
                              : parseFloat(marker.lng || 0).toFixed(5)}
                          </Popup>
                        </Marker>
                      ))}
                    </MapContainer>
                  </div>
                  <div className="flex items-center justify-end">
                    <button
                      type="button"
                      onClick={handleEditCancel}
                      className="mr-4 px-4 py-2 bg-gray-600 text-sm font-medium text-white rounded-md hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-yellow-500 text-sm font-medium text-white rounded-md hover:bg-yellow-400"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
            )}
            <div className="mt-8 flow-root">
              <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                        >
                          Driver
                        </th>
                        <th
                          scope="col"
                          className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                        >
                          Vehicle
                        </th>

                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          StartTime
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          EndTime
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Trip Distance(KM)
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Revenue
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Is Completed?
                        </th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {tripInfo && tripInfo.length > 0 ? (
                        tripInfo.map((trip, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                              {trip.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {trip.registrationnumber}
                            </td>

                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {
                                new Date(trip.starttime)
                                  .toISOString()
                                  .split("T")[0]
                              }
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {
                                new Date(trip.endtime)
                                  .toISOString()
                                  .split("T")[0]
                              }
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300 text-center">
                              {haversineDistance(
                                trip.startlatitude,
                                trip.startlongitude,
                                trip.endlatitude,
                                trip.endlongitude
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {trip.tripstatus}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              ₹{trip.revenue != "0" ? trip.revenue : "0"}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {trip.tripstatus === "Completed" ? (
                                <span className="px-3 py-1 rounded bg-green-500 text-white">
                                  ✓ Completed
                                </span>
                              ) : (
                                <button
                                  className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition hover:-translate-x-1"
                                  onClick={() => handleComplete(trip)}
                                >
                                  Mark Completed
                                </button>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              <button
                                className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition hover:-translate-x-1"
                                onClick={() => handleEdit(trip)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={4}
                            className="text-center text-white py-4"
                          >
                            No Trips Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* <MapContainer
            className="w-full max-w-4xl h-96 rounded-lg shadow-md"
            center={[12.9716, 77.5946]}
            zoom={8}
            key={tripInfo.length} // Force re-render when trips change
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {tripInfo.map((trip, index) => {
              const pathColors = [
                "#FF5733",
                "#33FF57",
                "#3357FF",
                "#FF33A1",
                "#FF8C00",
              ]; // List of colors
              const color = pathColors[index % pathColors.length]; // Cycle through colors

              return (
                trip.startlatitude &&
                trip.startlongitude &&
                trip.endlatitude &&
                trip.endlongitude && (
                  <React.Fragment key={index}>
                    <Marker
                      position={[trip.startlatitude, trip.startlongitude]}
                      icon={customIcon}
                    >
                      <Popup>
                        Trip Start Point
                        <br />
                        Start: {trip.startlatitude}, {trip.startlongitude}
                        <br />
                        Distance: {haversineDistance(trip.startlatitude, trip.startlongitude, trip.endlatitude, trip.endlongitude)} km
                      </Popup>
                    </Marker>
                    <Marker
                      position={[trip.endlatitude, trip.endlongitude]}
                      icon={customIcon}
                    >
                      <Popup>
                        Trip End Point
                        <br />
                        End: {trip.endlatitude}, {trip.endlongitude}
                        <br />
                        Distance: {haversineDistance(trip.startlatitude, trip.startlongitude, trip.endlatitude, trip.endlongitude)} km
                      </Popup>
                    </Marker>
                    <RoutingMachine
                      from={[trip.startlatitude, trip.startlongitude]}
                      to={[trip.endlatitude, trip.endlongitude]}
                      color={color} // Pass the unique color for this route
                    />
                  </React.Fragment>
                )
              );
            })}
          </MapContainer> */}
        </div>
      </div>
      <Footer />
    </div>
  );
}

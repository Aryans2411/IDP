import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";
import "leaflet/dist/leaflet.css";
import API_BASE_URL from "../lib/utils.url.js";
import L from "leaflet";
import { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Marker,
  Popup,
} from "react-leaflet";

export default function Vehicle() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [vehicleInfo, setVehicleInfo] = useState([]);
  const [status, setStatus] = useState("Active");
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();
  const [maintenanceform, setMaintenanceform] = useState({
    vehicleid: null,
    maintenancetype: "",
    cost: null,
    maintenancedate: null,
    remarks: "",
  });
  const [formData, setFormData] = useState({
    make: "",
    registrationnumber: "",
    fueltype: "",
    idealmileage: "",
    latitude: null,
    longitude: null,
  });
  const [formAnimation, setFormAnimation] = useState("opacity-100");
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [editFormData, setEditFormData] = useState({
    make: "",
    registrationnumber: "",
    fueltype: "",
    idealmileage: "",
    latitude: null,
    longitude: null,
  });

  useEffect(() => {
    getVehicleInfo();
  }, []);
  const customIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconSize: [35, 45],
    iconAnchor: [17, 45],
    popupAnchor: [0, -40],
  });

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const LocationMarker = () => {
    const [markerPosition, setMarkerPosition] = useState(null);

    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        setLatitude(lat);
        setLongitude(lng);
        console.log(`Latitude: ${lat}, Longitude: ${lng}`);
      },
    });
  };

  const MapClickHandler = ({ onMapClick }) => {
    useMapEvents({
      click: (e) => {
        const { lat, lng } = e.latlng;
        onMapClick(lat, lng);
      },
    });
    return null;
  };

  const getVehicleInfo = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/get_all_vehicles`,
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching driver list");
      }

      const data = await response.json();
      console.log(data);
      setVehicleInfo(data);
    } catch (error) {
      console.error("Failed to fetch vehicles:", error.message);
    }
  };
  const handlemaintenancechange = (e) => {
    const { name, value } = e.target;
    setMaintenanceform((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  //for maintenance form
  const handleClick = (vehicleid) => {
    maintenanceform.vehicleid = vehicleid;
    if (status === "Active") {
      setStatus("Inactive");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlesubmit2 = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/maintenanceregister`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(maintenanceform),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(
          errorData.error || "Error registering maintenance record"
        );
      }

      const result = await response.json();
      console.log("Maintenance record registered successfully:", result);

      setMaintenanceform({
        vehicleid: null,
        maintenancetype: "",
        cost: "",
        maintenancedate: "",
        remarks: "",
      });

      setSuccess("Maintenance added Successfully!");
      setTimeout(() => setSuccess(null), 3000);
      setStatus("Active");
    } catch (error) {
      console.error("Error submitting form:", error.message);
      setErr(error.message || "Failed to add");
      setTimeout(() => setErr(null), 3000);
    }
  };
  const handleCancel2 = async () => {
    setStatus("Active");
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    try {
      console.log(formData);
      const response = await fetch(
        `${API_BASE_URL}/api/vehicle_register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error registering vehicle");
      }

      const result = await response.json();
      console.log("Vehicle registered:", result);

      getVehicleInfo();

      setFormData({
        make: "",
        registrationnumber: "",
        fueltype: "",
        idealmileage: "",
        latitude: null,
        longitude: null,
      });

      setSuccess("Vehicle Added Successfully!");
      setTimeout(() => setSuccess(null), 3000);

      setFormAnimation("opacity-0");
      setTimeout(() => {
        setIsFormOpen(false);
        setFormAnimation("opacity-100");
      }, 300);
    } catch (error) {
      console.error("Error submitting form:", error.message);
      setErr(error.message || "Failed to add");
      setTimeout(() => setErr(null), 3000);
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
  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setEditFormData({
      make: vehicle.make,
      registrationnumber: vehicle.registrationnumber,
      fueltype: vehicle.fueltype,
      idealmileage: vehicle.idealmileage,
      latitude: vehicle.latitude,
      longitude: vehicle.longitude,
    });
    setIsEditMode(true);
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditMapClick = (lat, lng) => {
    setEditFormData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/update_vehicle/${editingVehicle.vehicleid}`,
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
        throw new Error(errorData.error || "Error updating vehicle");
      }

      const result = await response.json();
      console.log("Vehicle updated:", result);

      getVehicleInfo();

      setEditFormData({
        make: "",
        registrationnumber: "",
        fueltype: "",
        idealmileage: "",
        latitude: null,
        longitude: null,
      });
      setEditingVehicle(null);
      setIsEditMode(false);
      setSuccess("Vehicle Updated Successfully!");

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating vehicle:", error.message);
      setErr(error.message || "Failed to update");
      setTimeout(() => {
        setErr(null);
      }, 3000);
    }
  };

  const handleEditCancel = () => {
    setEditingVehicle(null);
    setIsEditMode(false);
    setEditFormData({
      make: "",
      registrationnumber: "",
      fueltype: "",
      idealmileage: "",
      latitude: null,
      longitude: null,
    });
  };

  // Dynamic label for idealmileage/range
  const getMileageLabel = (fueltype) => {
    if (fueltype === "Electric" || fueltype === "EV") return "Range (km)";
    if (fueltype === "Petrol" || fueltype === "Diesel") return "Mileage (km/l)";
    return "Mileage/Range";
  };

  // Add this handler to set vehicle status to Active
  const handleUndoMaintenance = async (vehicleid) => {
    setErr("");
    setSuccess("");
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/vehicle/${vehicleid}/set_active`,
        {
          method: "PUT",
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error updating vehicle status");
      }
      setSuccess("Vehicle status set to Active and ready for trips.");
      getVehicleInfo();
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setErr(error.message || "Failed to update status");
      setTimeout(() => setErr(null), 3000);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black  w-full  min-h-screen">
      <Navigation />
      <div className="mx-auto max-w-7xl w-full shadow-2xl hover:shadow-blue-500 transition-shadow duration-300">
        <div className="bg-gray-900 border border-gray-700 py-10 mt-2 rounded-lg mb-2">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto">
                <h1 className="text-base font-bold text-white">Vehicles</h1>
                <p className="mt-2 text-lg text-gray-300">
                  View and manage your fleet vehicles, including model,
                  registration, fuel type, range/mileage, and current status.
                  Use this table to keep your vehicle records up to date and
                  track maintenance efficiently.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                {err && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg mb-5 animate-pulse">
                    {err}
                  </div>
                )}
                {success && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded-lg mb-5 animate-pulse">
                    {success}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setIsFormOpen(true)}
                  className="block rounded-md bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 transition hover:-translate-y-1 focus:outline-none"
                >
                  Add Vehicle
                </button>
              </div>
            </div>
            {isFormOpen && (
              <div
                className={`mt-8 bg-gray-800 p-6 rounded-lg shadow-md transition-opacity duration-300 ease-in-out ${formAnimation}`}
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Add New Vehicle
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="make"
                    >
                      Model
                    </label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      value={formData.make}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="registrationnumber"
                    >
                      Registration Number
                    </label>
                    <input
                      type="text"
                      id="registrationnumber"
                      name="registrationnumber"
                      value={formData.registrationnumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="fueltype"
                    >
                      Fuel Type
                    </label>
                    <select
                      id="fueltype"
                      name="fueltype"
                      value={formData.fueltype}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="" disabled>
                        Select Fuel Type
                      </option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">EV</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="idealmileage"
                    >
                      {getMileageLabel(formData.fueltype)}
                    </label>
                    <input
                      type="number"
                      id="idealmileage"
                      name="idealmileage"
                      value={formData.idealmileage}
                      onChange={handleInputChange}
                      step={0.01}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      placeholder={getMileageLabel(formData.fueltype)}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="location"
                    >
                      Map
                    </label>
                    <div className="flex justify-center items-center mt-10">
                      <MapContainer
                        className="w-full max-w-4xl h-96 rounded-lg shadow-md"
                        center={[12.9716, 77.5946]}
                        zoom={8}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {latitude && longitude && (
                          <Marker
                            position={[latitude, longitude]}
                            icon={customIcon}
                          >
                            <Popup>
                              Latitude: {latitude}, Longitude: {longitude}
                            </Popup>
                          </Marker>
                        )}
                        <LocationMarker />
                      </MapContainer>
                    </div>
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
                  Edit Vehicle: {editingVehicle?.registrationnumber}
                </h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_make"
                    >
                      Model
                    </label>
                    <input
                      type="text"
                      id="edit_make"
                      name="make"
                      value={editFormData.make}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_registrationnumber"
                    >
                      Registration Number
                    </label>
                    <input
                      type="text"
                      id="edit_registrationnumber"
                      name="registrationnumber"
                      value={editFormData.registrationnumber}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_fueltype"
                    >
                      Fuel Type
                    </label>
                    <select
                      id="edit_fueltype"
                      name="fueltype"
                      value={editFormData.fueltype}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    >
                      <option value="" disabled>
                        Select Fuel Type
                      </option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">EV</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_idealmileage"
                    >
                      {getMileageLabel(editFormData.fueltype)}
                    </label>
                    <input
                      type="number"
                      id="edit_idealmileage"
                      name="idealmileage"
                      value={editFormData.idealmileage}
                      onChange={handleEditInputChange}
                      step={0.01}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                      required
                      placeholder={getMileageLabel(editFormData.fueltype)}
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_location"
                    >
                      Map (Click to update location)
                    </label>
                    <div className="flex justify-center items-center mt-10">
                      <MapContainer
                        className="w-full max-w-4xl h-96 rounded-lg shadow-md"
                        center={[12.9716, 77.5946]}
                        zoom={8}
                      >
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                        {editFormData.latitude && editFormData.longitude && (
                          <Marker
                            position={[
                              editFormData.latitude,
                              editFormData.longitude,
                            ]}
                            icon={customIcon}
                          >
                            <Popup>
                              Latitude: {editFormData.latitude}, Longitude:{" "}
                              {editFormData.longitude}
                            </Popup>
                          </Marker>
                        )}
                        <MapClickHandler onMapClick={handleEditMapClick} />
                      </MapContainer>
                    </div>
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
                          Model
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Registration Number
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Fuel Type
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Mileage
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Latitude
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Longitude
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
                          Maintenance status
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Next Due Date
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                      {vehicleInfo && vehicleInfo.length > 0 ? (
                        vehicleInfo.map((vehicle, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                              {vehicle.make}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {vehicle.registrationnumber}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {vehicle.fueltype}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {vehicle.idealmileage}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {vehicle.latitude}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {vehicle.longitude}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                              <span
                                className={
                                  vehicle.status === "Inactive"
                                    ? "text-green-400"
                                    : vehicle.status === "Under Maintenance"
                                    ? "text-red-500"
                                    : "text-yellow-400"
                                }
                              >
                                {vehicle.status}
                              </span>
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              <button
                                className="px-3 py-1 rounded bg-blue-500 text-white hover:bg-blue-600  transition hover:-translate-x-1"
                                onClick={() => handleClick(vehicle.vehicleid)}
                              >
                                Maintenance
                              </button>
                              {status === "Inactive" &&
                                maintenanceform.vehicleid ===
                                  vehicle.vehicleid && (
                                  <form
                                    onSubmit={handlesubmit2}
                                    className="space-y-4 mt-4"
                                  >
                                    <div>
                                      <label
                                        className="block text-sm font-medium text-gray-300"
                                        htmlFor="maitenancetype"
                                      >
                                        Maitenancetype
                                      </label>
                                      <input
                                        type="text"
                                        id="maintenancetype"
                                        name="maintenancetype"
                                        value={maintenanceform.maintenancetype}
                                        onChange={handlemaintenancechange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="block text-sm font-medium text-gray-300"
                                        htmlFor="cost"
                                      >
                                        Cost
                                      </label>
                                      <input
                                        type="text"
                                        id="cost"
                                        name="cost"
                                        value={maintenanceform.cost}
                                        onChange={handlemaintenancechange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="block text-sm font-medium text-gray-300"
                                        htmlFor="maintenancedate"
                                      >
                                        Maintenance Date
                                      </label>
                                      <input
                                        type="text"
                                        id="maintenancedate"
                                        name="maintenancedate"
                                        value={maintenanceform.maintenancedate}
                                        onChange={handlemaintenancechange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                      />
                                    </div>
                                    <div>
                                      <label
                                        className="block text-sm font-medium text-gray-300"
                                        htmlFor="remarks"
                                      >
                                        remarks
                                      </label>
                                      <input
                                        type="text"
                                        id="remarks"
                                        name="remarks"
                                        value={maintenanceform.remarks}
                                        onChange={handlemaintenancechange}
                                        className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500"
                                        required
                                      />
                                    </div>

                                    <div className="flex items-center justify-end">
                                      <button
                                        type="button"
                                        onClick={handleCancel2}
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
                                )}
                              {/* Undo Maintenance button for Under Maintenance vehicles */}
                              {vehicle.status === "Under Maintenance" && (
                                <button
                                  className="ml-2 px-3 py-1 rounded bg-gray-500 text-white hover:bg-gray-600 transition hover:-translate-x-1"
                                  onClick={() =>
                                    handleUndoMaintenance(vehicle.vehicleid)
                                  }
                                >
                                  Undo Maintenance
                                </button>
                              )}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {vehicle.nextduedate === null
                                ? null
                                : new Date(vehicle.nextduedate)
                                    .toISOString()
                                    .split("T")[0]}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              <button
                                className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition hover:-translate-x-1 mr-2"
                                onClick={() => handleEdit(vehicle)}
                              >
                                Edit
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={8}
                            className="text-center text-white py-4"
                          >
                            No Vehicles Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-white">Vehicle Locations</h3>
              <div className="flex items-center justify-center w-full">
                {" "}
                <MapContainer
                  className="w-full h-96 rounded-lg shadow-md"
                  center={[12.9716, 77.5946]}
                  zoom={12}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {vehicleInfo.map((mark, index) => (
                    <Marker
                      key={index}
                      position={[mark.latitude, mark.longitude]}
                      icon={customIcon}
                    ></Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";
import ChartDataLabels from "chartjs-plugin-datalabels";
import Lenis from "lenis";
import { FaRupeeSign } from "react-icons/fa";

import "lenis/dist/lenis.css";
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
import { Bar, Doughnut, Line, Pie, Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  BarElement,
  LinearScale,
  PointElement,
  LineElement,
  RadialLinearScale,
} from "chart.js";
import {
  FaDollarSign,
  FaCar,
  FaWrench,
  FaUser,
  FaChartLine,
  FaGasPump,
  FaCoins,
  FaLeaf,
} from "react-icons/fa"; // Import icons from Font Awesome
import ChargingStationsMap from "../Components/ChargingStationsMap";
import MyPreBookings from "../Components/MyPreBookings";
import { haversineDistance } from "../lib/utils.js";

// Register the components you need, including CategoryScale, BarElement, and LinearScale
ChartJS.register(
  ArcElement,
  PointElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  BarElement,
  LineElement,
  LinearScale,
  RadialLinearScale
);

export default function Home() {
  const [driversFreq, setDriverFreq] = useState(0);
  const [vehiclesFreq, setVehicleFreq] = useState(0);
  const [actvvehicle, setActvehicle] = useState(0);
  const [maintv, setmainv] = useState(0);
  const [tripInfo, setTripInfo] = useState([]);
  const [totalrevenue, setTotalRevenue] = useState(0);
  const [cost, setCost] = useState(0);
  const [driver_info, setdriver_info] = useState([]);
  const [month_rev, set_month_rev] = useState([]);
  const [month_cost, set_month_cost] = useState([]);
  const [co2emissionsaved, setCo2emissionsaved] = useState([]);
  const [vehicle_maintenance_cost, set_vehicle_maintenance_cost] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    profit: 0,
    revenue: 0,
    cost: 0,
    totalVehicles: 0,
    activeVehicles: 0,
    vehiclesInMaintenance: 0,
    unusedVehicles: 0,
    drivers: 0,
    totalrevenue: 0,
  });

  useEffect(() => {
    drivernumber();
    vehiclesnumber();
    actvehicle();
    maintenance_vehicle();
    getTripInfo();
    getTotalRevenue();
    getCost();
    get_driver_info();
    get_month_revenue();
    get_month_cost();
    get_monthly_maintenance();
    getcarbondata();
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

  const drivernumber = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/get_totaldriver",
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Error in fetching total frequency of drivers");
      }
      const data = await response.json();
      setDriverFreq(data);
    } catch (error) {
      console.error("Failed to fetch drivers frequency:", error.message);
    }
  };

  const vehiclesnumber = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/get_totalvehicles",
        {
          method: "GET",
        }
      );
      if (!response.ok) {
        throw new Error("Error in fetching total frequency of vehicles");
      }
      const data = await response.json();
      setVehicleFreq(data);
    } catch (error) {
      console.error("Failed to fetch vehicles frequency:", error);
    }
  };

  const actvehicle = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/get_active_vehicle",
        {
          method: "GET",
        }
      );
      if (!response.ok)
        throw new Error("Error in fetching total active vehicles");

      const data = await response.json();
      setActvehicle(data);
    } catch (error) {
      console.error("Failed to fetch active vehicles", error);
    }
  };

  const getCost = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/get_totalcost", {
        method: "GET",
      });
      if (!response.ok) {
        throw new Error("Error in fetching total cost!");
      }
      const data = await response.json();
      setCost(data);
    } catch (error) {
      console.error("Failed to fetch cost", error);
    }
  };

  const maintenance_vehicle = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/get_total_maintenance_vehicles",
        {
          method: "GET",
        }
      );
      if (!response.ok)
        throw new Error("Error in fetching total active vehicles");

      const data = await response.json();
      setmainv(data);
    } catch (error) {
      console.error("Failed to fetch active vehicles", error);
    }
  };

  const getTripInfo = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/get_all_trips", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error fetching trip list");
      }

      const data = await response.json();
      setTripInfo(data);
    } catch (error) {
      console.error("Failed to fetch trips:", error.message);
    }
  };

  const getTotalRevenue = async () => {
    const response = await fetch("http://localhost:4000/api/get_totalrevenue", {
      method: "GET",
    });
    if (!response.ok) {
      throw new Error("Error in fetching the total revenue");
    }
    try {
      const data = await response.json();
      setTotalRevenue(data);
    } catch (error) {
      console.error("Failed to fetch trips:", error.status);
    }
  };
  const getcarbondata = async () => {
    const response = await fetch(
      "http://localhost:4000/api/carbonemissiondata",
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Error in fetching the carbon emission");
    }
    try {
      const data = await response.json();
      console.log(data);
      console.log("here ", co2emissionsaved);
      setCo2emissionsaved(data);
    } catch (error) {
      console.error("Failed to fetch carbon emission:", error.status);
    }
  };
  const RoutingMachine = ({ from, to, color = "#0000ff" }) => {
    const map = useMap();
    const [routingControl, setRoutingControl] = useState(null);

    useEffect(() => {
      if (!map || !from || !to) return;

      try {
        if (routingControl) {
          map.removeControl(routingControl);
        }

        const control = L.Routing.control({
          waypoints: [L.latLng(from[0], from[1]), L.latLng(to[0], to[1])],
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: false,
          showAlternatives: false,
          lineOptions: {
            styles: [{ color: color, opacity: 0.6, weight: 4 }],
          },
          createMarker: () => null,
        })
          .on("routingerror", function (e) {})
          .addTo(map);

        setRoutingControl(control);

        return () => {
          if (map && control) {
            try {
              control.getPlan().setWaypoints([]);
              map.removeControl(control);
              map.eachLayer((layer) => {
                if (layer._routing) {
                  map.removeLayer(layer);
                }
              });
            } catch (error) {}
          }
        };
      } catch (error) {}
    }, [map, from, to, color]);

    return null;
  };

  const get_driver_info = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/driver_cost", {
        method: "GET",
      });
      if (!response.ok)
        throw new Error("Error in fetching total active vehicles");

      const data = await response.json();
      setdriver_info(data);
    } catch (error) {
      console.error("Failed to fetch active vehicles", error);
    }
  };

  const get_month_revenue = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/month_revenue", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error fetching monthly data list");
      }

      const data = await response.json();
      set_month_rev(data);
    } catch (error) {
      console.error("Failed to fetch monthly data", error.message);
    }
  };

  const get_month_cost = async () => {
    try {
      const response = await fetch("http://localhost:4000/api/month_cost", {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Error fetching monthly data list");
      }

      const data = await response.json();
      set_month_cost(data);
    } catch (error) {
      console.error("Failed to fetch monthly data", error.message);
    }
  };

  const get_monthly_maintenance = async () => {
    const response = await fetch(
      "http://localhost:4000/api/vehicle_maintenance_cost",
      {
        method: "GET",
      }
    );
    if (!response.ok) {
      throw new Error("Error in fetching the total revenue");
    }
    try {
      const data = await response.json();
      set_vehicle_maintenance_cost(data);
    } catch (error) {
      console.error("Failed to fetch trips:", error.status);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex flex-col">
      <Navigation />
      <div className="mt-6 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Dashboard Cards */}
        <div className="card">
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-2">
              <FaCoins className="text-3xl text-green-400" />
              <h3 className="text-xl font-semibold mb-2">Profit</h3>
            </div>
            <p className="text-3xl font-bold text-green-400">
              ₹{totalrevenue - cost}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-3xl text-blue-400" />

              <h3 className="text-xl font-semibold mb-2">Revenue</h3>
            </div>
            <p className="text-3xl font-bold text-blue-400">₹{totalrevenue}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-2">
              <FaChartLine className="text-3xl text-red-400" />
              <h3 className="text-xl font-semibold mb-2">Cost</h3>
            </div>
            <p className="text-3xl font-bold text-red-400">
              ₹{cost === null ? 0 : cost}
            </p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-2">
              <FaCar className="text-3xl text-yellow-400" />
              <h3 className="text-xl font-semibold mb-2">Total Vehicles</h3>
            </div>
            <p className="text-3xl font-bold text-yellow-400">{vehiclesFreq}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-2">
              <FaCar className="text-3xl text-teal-400" />
              <h3 className="text-xl font-semibold mb-2">Active Vehicles</h3>
            </div>
            <p className="text-3xl font-bold text-teal-400">{actvvehicle}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-2">
              <FaWrench className="text-3xl text-orange-400" />
              <h3 className="text-xl font-semibold mb-2">
                Vehicles in Maintenance
              </h3>
            </div>
            <p className="text-3xl font-bold text-orange-400">{maintv}</p>
          </div>
        </div>
        <div className="card">
          <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
            <div className="flex items-center gap-2">
              <FaCar className="text-3xl text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">Unused Vehicles</h3>
            </div>
            <p className="text-3xl font-bold text-purple-400">
              {vehiclesFreq - actvvehicle - maintv}
            </p>
          </div>
        </div>
        <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-800 text-white rounded-xl shadow-lg hover:scale-105 transition-transform cursor-pointer">
          <div className="flex items-center gap-2">
            <FaUser className="text-3xl text-blue-400" />
            <h3 className="text-xl font-semibold mb-2">Drivers</h3>
          </div>
          <p className="text-3xl font-bold text-blue-400">{driversFreq}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 grid-rows-3 min-h-screen gap-6 p-4">
        {/* Line chart div: Full width on top */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl transition-all hover:shadow-sm   hover:shadow-blue-400 hover:scale-[1.02] duration-300 ease-in-out cursor-pointer col-span-2 rounded-2xl p-8 min-h-[250px]">
          <div className="w-full h-full min-h-[350px]">
            {month_rev.length > 0 ? (
              <Line
                data={{
                  labels: month_rev.map((rev) => rev.month_name),
                  datasets: [
                    {
                      label: "Revenue",
                      data: month_rev.map((rev) => rev.total_revenue),
                      backgroundColor: "rgba(54, 162, 235, 0.2)", // Softer blue fill
                      borderColor: "#36A2EB",
                      borderWidth: 3,
                      pointBackgroundColor: "#36A2EB",
                      pointBorderColor: "#fff",
                      pointHoverBackgroundColor: "#fff",
                      pointHoverBorderColor: "#36A2EB",
                      fill: false, // No filling for the Revenue line
                    },
                    {
                      label: "Cost",
                      data: month_cost.map((cst) => cst.total_cost),
                      backgroundColor: "rgba(255, 99, 132, 0.2)", // Softer red fill
                      borderColor: "#FF6384",
                      borderWidth: 3,
                      pointBackgroundColor: "#FF6384",
                      pointBorderColor: "#fff",
                      pointHoverBackgroundColor: "#fff",
                      pointHoverBorderColor: "#FF6384",
                      fill: true, // Fill the area under the Cost line
                    },
                    {
                      label: "Profit",
                      data: month_rev.map((rev, index) => {
                        const cost = month_cost[index]
                          ? month_cost[index].total_cost
                          : 0;
                        return rev.total_revenue - cost;
                      }),
                      backgroundColor: "rgba(75, 192, 192, 0.2)", // Lighter teal fill
                      borderColor: "#4BC0C0", // Teal border
                      borderWidth: 3,
                      pointBackgroundColor: "#4BC0C0", // Teal point background color
                      pointBorderColor: "#fff", // White point border
                      pointHoverBackgroundColor: "#fff", // White point hover background color
                      pointHoverBorderColor: "#4BC0C0", // Teal point hover border color
                      fill: true, // Fill the area under the Profit line
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        color: "#F7FAFC",
                        font: {
                          size: 16,
                          family: "Inter, sans-serif",
                          weight: "600",
                        },
                        boxWidth: 20,
                        padding: 15,
                      },
                    },
                    tooltip: {
                      enabled: true,
                      backgroundColor: "#2D3748",
                      titleColor: "#F7FAFC",
                      bodyColor: "#F7FAFC",
                      borderColor: "#4A5568",
                      borderWidth: 1,
                      cornerRadius: 6,
                      padding: 12,
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: "white",
                        font: {
                          size: 14,
                          family: "  sans-serif",
                        },
                      },
                      grid: {
                        display: true,
                      },
                    },
                    y: {
                      ticks: {
                        color: "#F7FAFC",
                        font: {
                          size: 14,
                          family: "sans-serif",
                        },
                      },
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                  },
                  animation: {
                    tension: {
                      duration: 1500,
                      easing: "easeInOutQuart",
                      from: 0.3,
                      to: 0.24,
                      loop: true,
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-lg font-semibold">
                  No Monthly info available
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-gray-800 transition-all shadow:2xl hover:shadow-sm hover:shadow-blue-400 hover:scale-[1.02]    duration-300 ease-in-out cursor-pointer rounded-2xl p-8 min-h-[250px]">
          <div className="w-full h-full">
            {actvvehicle || vehiclesFreq || maintv ? (
              <Bar
                data={{
                  labels: [
                    "Active Vehicles",
                    "Unused Vehicles",
                    "Vehicles Under Maintenance",
                  ],
                  datasets: [
                    {
                      label: ["Active Vehicle"],
                      data: [
                        actvvehicle,
                        vehiclesFreq - actvvehicle - maintv,
                        maintv,
                      ],
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.6)", // Softer blue fill (same as line chart)
                        "rgba(255, 99, 132, 0.6)", // Softer red fill (same as line chart)
                        "rgba(153, 102, 255, 0.6)", // Softer purple fill (new color for maintenance)
                      ],
                      hoverBackgroundColor: [
                        "rgba(54, 162, 235, 0.9)", // Brighter blue hover
                        "rgba(255, 99, 132, 0.9)", // Brighter red hover
                        "rgba(153, 102, 255, 0.9)", // Brighter purple hover
                      ],
                      borderColor: [
                        "#36A2EB", // Same border color as blue in the line chart
                        "#FF6384", // Same border color as red in the line chart
                        "#9966FF", // Purple border for maintenance
                      ],
                      borderWidth: 2, // Slight border for depth
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        color: "#F7FAFC",
                        font: {
                          size: 16,
                          weight: "600",
                        },
                        boxWidth: 20,
                        padding: 15,
                      },
                    },
                    tooltip: {
                      enabled: true,
                      backgroundColor: "#2D3748", // Dark background for tooltip
                      titleColor: "#F7FAFC", // Light text in tooltip
                      bodyColor: "#F7FAFC", // Light text in tooltip
                      borderColor: "#4A5568", // Dark border color
                      borderWidth: 1,
                      cornerRadius: 6,
                      padding: 12,
                    },
                  },
                  animation: {
                    duration: 1500, // Smooth animation
                    easing: "easeInOutQuart",
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                  scales: {
                    x: {
                      ticks: {
                        color: "white",
                        font: {
                          size: 14,
                          family: "sans-serif",
                        },
                      },
                      grid: {
                        display: true,
                      },
                    },
                    y: {
                      ticks: {
                        color: "white",
                        font: {
                          size: 14,
                          family: "sans-serif",
                        },
                      },
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                  },
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-lg font-semibold">
                  No Vehicle Info Available
                </p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 transition-all shadow-sm hover:shadow-blue-400 hover:scale-[1.02]    duration-300 ease-in-out cursor-pointer rounded-2xl p-8 min-h-[250px]">
          <div className="w-full h-full">
            {vehicle_maintenance_cost.length > 0 ? (
              <Bar
                data={{
                  labels: vehicle_maintenance_cost.map(
                    (mst) => mst.registrationnumber
                  ),
                  datasets: [
                    {
                      label: "Maintenance Cost",
                      data: vehicle_maintenance_cost.map((mst) => mst.sum),
                      backgroundColor: [
                        "rgba(54, 162, 235, 0.6)", // Softer blue fill (same as line chart)
                        "rgba(255, 99, 132, 0.6)", // Softer red fill (same as line chart)
                        "rgba(153, 102, 255, 0.6)",
                      ], // Softer purple fill (new color for maintenance)], // Blue fill for bars
                      borderColor: [
                        "rgba(54, 162, 235, 0.9)", // Softer blue fill (same as line chart)
                        "rgba(255, 99, 132, 0.9)", // Softer red fill (same as line chart)
                        "rgba(153, 102, 255, 0.9)",
                      ], // Blue border for bars
                      borderWidth: 2,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        color: "#F9FAFB", // Lighter text for contrast
                        font: {
                          size: 16,
                          family: "Inter, sans-serif",
                          weight: "600",
                        },
                        boxWidth: 20,
                        padding: 15,
                      },
                    },
                    tooltip: {
                      enabled: true,
                      backgroundColor: "#2D3748", // Dark background for tooltip
                      titleColor: "#F9FAFB", // Light text in tooltip
                      bodyColor: "#F9FAFB", // Light text in tooltip
                      borderColor: "black", // Dark border color
                      borderWidth: 1,
                      cornerRadius: 6,
                      padding: 12,
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: "white",
                        font: {
                          size: 12,
                          family: "  sans-serif",
                        },
                      },
                      grid: {
                        display: true,
                      },
                    },
                    y: {
                      ticks: {
                        color: "#F7FAFC",
                        font: {
                          size: 14,
                          family: "sans-serif",
                        },
                      },
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                  },
                  animation: {
                    duration: 1500, // Smooth animation
                    easing: "easeInOutQuart",
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-lg font-semibold">
                  No Vehicle Info Available
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gradient-to-b from-gray-900 to-gray-800 shadow-sm hover:shadow-blue-400 hover:scale-[1.02] transition-transform duration-300 ease-in-out cursor-pointer rounded-2xl p-8 min-h-[250px]">
          {driver_info.length > 0 ? (
            <Doughnut
              data={{
                labels: driver_info.map((driver) => driver.name),
                datasets: [
                  {
                    data: driver_info.map((driver) => driver.total_earning),
                    backgroundColor: [
                      "rgba(255, 99, 132, 0.6)",
                      "rgba(54, 162, 235, 0.6)",
                      "rgba(255, 206, 86, 0.6)",
                      "rgba(75, 192, 192, 0.6)",
                      "rgba(153, 102, 255, 0.6)",
                      "rgba(255, 159, 64, 0.6)",
                      "rgba(231, 233, 237, 0.6)",
                    ],
                    hoverBackgroundColor: [
                      "rgba(255, 99, 132, 0.9)",
                      "rgba(54, 162, 235, 0.9)",
                      "rgba(255, 206, 86, 0.9)",
                      "rgba(75, 192, 192, 0.9)",
                      "rgba(153, 102, 255, 0.9)",
                      "rgba(255, 159, 64, 0.9)",
                      "rgba(231, 233, 237, 0.9)",
                    ],
                    borderWidth: 2,
                    borderColor: "#FFFFFF",
                  },
                ],
              }}
              options={{
                plugins: {
                  legend: {
                    position: "top",
                    labels: {
                      color: "#F7FAFC",
                      font: {
                        size: 14,
                        family: "Inter, sans-serif",
                        weight: "500",
                      },
                    },
                  },
                  tooltip: {
                    enabled: true,
                    backgroundColor: "#2D3748",
                    titleColor: "#F7FAFC",
                    bodyColor: "#F7FAFC",
                    borderColor: "#4A5568",
                    borderWidth: 1,
                    cornerRadius: 6,
                    padding: 12,
                  },
                },
                animation: {
                  animateScale: true,
                  animateRotate: true,
                },
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-lg font-medium">
                No driver data available.
              </p>
            </div>
          )}
        </div>
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 shadow-2xl hover:shadow-sm hover:shadow-blue-400 hover:scale-[1.02] transition-transform duration-300 ease-in-out cursor-pointer   rounded-2xl p-8 min-h-[250px]">
          <div className="w-full h-full min-h-[350px]">
            {co2emissionsaved.length > 0 ? (
              <Line
                data={{
                  labels: co2emissionsaved.map((rev) => rev.month_name),
                  datasets: [
                    {
                      label: "Carbon emission Saved",
                      data: co2emissionsaved.map((rev) => rev.carbonemission),
                      backgroundColor: "rgba(147, 245, 127, 0.2)", // Softer blue fill
                      borderColor: "#93f57f",
                      borderWidth: 3,
                      pointBackgroundColor: "#93f57f",
                      pointBorderColor: "#fff",
                      pointHoverBackgroundColor: "#fff",
                      pointHoverBorderColor: "#36A2EB",
                      fill: false, // No filling for the Revenue line
                    },
                    {
                      label: "Fuel Saved",
                      data: co2emissionsaved.map(
                        (rev) => rev.carbonemission / 2.68
                      ),
                      backgroundColor: "rgba(209, 132, 17, 0.2)", // Softer red fill
                      borderColor: "#d18411",
                      borderWidth: 3,
                      pointBackgroundColor: "#d18411",
                      pointBorderColor: "#fff",
                      pointHoverBackgroundColor: "#fff",
                      pointHoverBorderColor: "#FF6384",
                      fill: true, // Fill the area under the Cost line
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: {
                      position: "top",
                      labels: {
                        color: "#F7FAFC",
                        font: {
                          size: 16,
                          family: "Inter, sans-serif",
                          weight: "600",
                        },
                        boxWidth: 20,
                        padding: 15,
                      },
                    },
                    tooltip: {
                      enabled: true,
                      backgroundColor: "#2D3748",
                      titleColor: "#F7FAFC",
                      bodyColor: "#F7FAFC",
                      borderColor: "#4A5568",
                      borderWidth: 1,
                      cornerRadius: 6,
                      padding: 12,
                    },
                  },
                  scales: {
                    x: {
                      ticks: {
                        color: "white",
                        font: {
                          size: 14,
                          family: "  sans-serif",
                        },
                      },
                      grid: {
                        display: true,
                      },
                    },
                    y: {
                      ticks: {
                        color: "#F7FAFC",
                        font: {
                          size: 14,
                          family: "sans-serif",
                        },
                      },
                      grid: {
                        color: "rgba(255, 255, 255, 0.1)",
                      },
                    },
                  },
                  animation: {
                    tension: {
                      duration: 1500,
                      easing: "easeInOutQuart",
                      from: 0.3,
                      to: 0.24,
                      loop: true,
                    },
                  },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-400 text-lg font-semibold">
                  No Monthly info available
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center  mb-12 mt-6 ">
        <MapContainer
          style={{ height: "75vh", width: "95%" }}
          center={[12.9716, 77.5946]}
          zoom={12.5}
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
                      Distance:{" "}
                      {haversineDistance(
                        trip.startlatitude,
                        trip.startlongitude,
                        trip.endlatitude,
                        trip.endlongitude
                      )}{" "}
                      km
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
                      Distance:{" "}
                      {haversineDistance(
                        trip.startlatitude,
                        trip.startlongitude,
                        trip.endlatitude,
                        trip.endlongitude
                      )}{" "}
                      km
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
        </MapContainer>
      </div>

      {/* Add Charging Stations Map */}
      <div className="px-4">
        <ChargingStationsMap />
      </div>

      <div className="px-4">
        <MyPreBookings />
      </div>

      <Footer />
    </div>
  );
}

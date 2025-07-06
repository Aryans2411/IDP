import React, { useEffect, useState } from "react";
import Navigation from "../Components/dashboard/navigation";
import Footer from "../Components/Footer/Footer";
export default function Driver() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [driveInfo, setDriveInfo] = useState([]);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    licensenumber: "",
    phonenumber: "",
    earningperkm: "",
  });
  const [formAnimation, setFormAnimation] = useState("opacity-100"); // for form fade-out animation
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    licensenumber: "",
    phonenumber: "",
    earningperkm: "",
  });

  // Fetch driver data on component mount
  useEffect(() => {
    getDriverInfo();
  }, []);

  const getDriverInfo = async () => {
    try {
      const response = await fetch(
        "http://localhost:4000/api/get_all_drivers",
        {
          method: "GET",
        }
      );

      if (!response.ok) {
        throw new Error("Error fetching driver list");
      }

      const data = await response.json();
      setDriveInfo(data); // Assuming data.rows contains the drivers
    } catch (error) {
      console.error("Failed to fetch drivers:", error.message);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");
    try {
      const response = await fetch(
        "http://localhost:4000/api/driver_register",
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
        throw new Error(errorData.error || "Error registering driver");
      }

      const result = await response.json();
      console.log("Driver registered:", result);

      // Fetch updated driver list
      getDriverInfo();

      // Reset form data
      setFormData({
        name: "",
        licensenumber: "",
        phonenumber: "",
        earningperkm: "",
      });
      setSuccess("Driver Added Successfully!");
      setTimeout(() => {
        setSuccess(null); // Remove success message after animation
      }, 3000); // Matches duration of animation

      // Fade out form and show success/error message
      setFormAnimation("opacity-0");
      setTimeout(() => {
        setIsFormOpen(false); // Hide form completely after animation
        setFormAnimation("opacity-100"); // Reset form animation state
      }, 300); // Duration of the fade-out effect
    } catch (error) {
      console.error("Error submitting form:", error.message);
      setErr(error.message || "Failed to add");
      setTimeout(() => {
        setErr(null); // Remove error message after animation
      }, 3000); // Matches duration of animation
    }
  };

  // Handle form close (cancel)
  const handleCancel = () => {
    setFormAnimation("opacity-0");
    setTimeout(() => {
      setIsFormOpen(false); // Hide form completely after animation
      setFormAnimation("opacity-100"); // Reset form animation state
    }, 300); // Duration of the fade-out effect
  };

  // Edit functionality
  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setEditFormData({
      name: driver.name,
      licensenumber: driver.licensenumber,
      phonenumber: driver.phonenumber,
      earningperkm: driver.earningperkm,
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setSuccess("");

    try {
      const response = await fetch(
        `http://localhost:4000/api/update_driver/${editingDriver.driverid}`,
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
        throw new Error(errorData.error || "Error updating driver");
      }

      const result = await response.json();
      console.log("Driver updated:", result);

      getDriverInfo();

      setEditFormData({
        name: "",
        licensenumber: "",
        phonenumber: "",
        earningperkm: "",
      });
      setEditingDriver(null);
      setIsEditMode(false);
      setSuccess("Driver Updated Successfully!");

      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error("Error updating driver:", error.message);
      setErr(error.message || "Failed to update");
      setTimeout(() => {
        setErr(null);
      }, 3000);
    }
  };

  const handleEditCancel = () => {
    setEditingDriver(null);
    setIsEditMode(false);
    setEditFormData({
      name: "",
      licensenumber: "",
      phonenumber: "",
      earningperkm: "",
    });
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black w-screen">
      <Navigation />
      <div className="mx-auto max-w-7xl">
        <div className="bg-gray-900    border border-gray-700 shadow-2xl   hover:shadow-blue-500 transition-shadow duration-300 mx-auto py-10 mt-4 mb-2 rounded-lg">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="sm:flex sm:items-center">
              <div className="sm:flex-auto ">
                <h1 className="text-base font-bold text-white">Drivers</h1>
                <p className="mt-2 text-lg text-gray-300   ">
                  Manage your fleet drivers, including their personal details,
                  license information, contact numbers, and earnings per
                  kilometer. Use this table to maintain driver records and track
                  their availability status.
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <div className="text-center justify-center">
                  {err && (
                    <div className="bg-red-100 border   border-red-400 text-red-700 px-4 py-2 rounded-lg mb-5 text-center justify-center animate-pulse opacity-100 transition-opacity duration-3000 ease-in-out">
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
                  className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-indigo-400 hover:-translate-y-1"
                >
                  Add Driver
                </button>
              </div>
            </div>
            {isFormOpen && (
              <div
                className={`mt-8 bg-gray-800 p-6 rounded-lg shadow-md transition-opacity duration-300 ease-in-out ${formAnimation}`}
              >
                <h2 className="text-lg font-semibold text-white mb-4">
                  Add New Driver
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="name"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="licensenumber"
                    >
                      License Number
                    </label>
                    <input
                      type="text"
                      id="licensenumber"
                      name="licensenumber"
                      value={formData.licensenumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="phonenumber"
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="phonenumber"
                      name="phonenumber"
                      value={formData.phonenumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="earningperkm"
                    >
                      Earning Per Km
                    </label>
                    <input
                      type="number"
                      id="earningperkm"
                      name="earningperkm"
                      value={formData.earningperkm}
                      onChange={handleInputChange}
                      step={1}
                      min={10}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
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
                  Edit Driver: {editingDriver?.name}
                </h2>
                <form onSubmit={handleEditSubmit} className="space-y-4">
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_name"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="edit_name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_licensenumber"
                    >
                      License Number
                    </label>
                    <input
                      type="text"
                      id="edit_licensenumber"
                      name="licensenumber"
                      value={editFormData.licensenumber}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_phonenumber"
                    >
                      Phone Number
                    </label>
                    <input
                      type="text"
                      id="edit_phonenumber"
                      name="phonenumber"
                      value={editFormData.phonenumber}
                      onChange={handleEditInputChange}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label
                      className="block text-sm font-medium text-gray-300"
                      htmlFor="edit_earningperkm"
                    >
                      Earning Per Km
                    </label>
                    <input
                      type="number"
                      id="edit_earningperkm"
                      name="earningperkm"
                      value={editFormData.earningperkm}
                      onChange={handleEditInputChange}
                      step={1}
                      min={10}
                      className="mt-1 block w-full rounded-md bg-gray-700 text-white border-gray-600 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
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
                          Name
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          License Number
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Phone Number
                        </th>
                        <th
                          scope="col"
                          className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                        >
                          Earning Per Km
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
                          Last Duty Date
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
                      {driveInfo && driveInfo.length > 0 ? (
                        driveInfo.map((driver, index) => (
                          <tr key={index}>
                            <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                              {driver.name}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {driver.licensenumber}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {driver.phonenumber}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {driver.earningperkm}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              {new Date() - driver.lastdutydate <= 2
                                ? "At Rest"
                                : driver.assignedvehicleid > 0
                                ? "Engaged"
                                : "Free"}
                            </td>
                            <td className="whitespace-normal px-3 py-4 text-sm text-gray-300">
                              {driver.lastdutydate != null
                                ? new Date(driver.lastdutydate)
                                    .toISOString()
                                    .split("T")[0]
                                : null}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                              <button
                                className="px-3 py-1 rounded bg-yellow-500 text-white hover:bg-yellow-600 transition hover:-translate-x-1"
                                onClick={() => handleEdit(driver)}
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
                            No Drivers Found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

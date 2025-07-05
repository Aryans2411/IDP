import { Disclosure, Menu } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom"; // Use Link and useLocation for navigation and current path detection
import { useNavigate } from "react-router-dom";

const initialNavigation = [
  { name: "Home", href: "/home", key: "home" },
  { name: "Vehicle", href: "/vehicle", key: "vehicle" },
  { name: "Driver", href: "/driver", key: "driver" },
  { name: "Analytics", href: "/analytics", key: "analytics" },
  { name: "Trip", href: "/trip", key: "trip" },
  { name: "DataBridgeAI", href: "/databridgeai", key: "databridgeai" },
  { name: "EV Range Predictor", href: "/ev-range", key: "ev-range" },
];

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navigation() {
  const navigate = useNavigate();
  const location = useLocation(); // Get the current path
  const handleLogout = () => {
    navigate("/");
  };
  return (
    <Disclosure as="nav" className="bg-gray-800">
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
              <span className="sr-only">Open main menu</span>
              <Bars3Icon
                aria-hidden="true"
                className="block h-6 w-6 group-data-[open]:hidden"
              />
              <XMarkIcon
                aria-hidden="true"
                className="hidden h-6 w-6 group-data-[open]:block"
              />
            </Disclosure.Button>
          </div>
          <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
            <div className="flex shrink-0 items-center">
              <img
                alt="Your Company"
                src="https://e7.pngegg.com/pngimages/894/400/png-clipart-car-fleet-vehicle-luxury-vehicle-fleet-management-fleet-company-logo.png"
                className="h-8 w-auto"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-4">
                {initialNavigation.map((item) => (
                  <Link
                    key={item.key}
                    to={item.href}
                    className={classNames(
                      location.pathname === item.href
                        ? "bg-gray-900 text-white" // Active link styling
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "rounded-md px-3 py-2 text-sm font-medium"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
            {/* Profile dropdown */}
            <Menu as="div" className="relative ml-3">
              <div>
                <Menu.Button className="relative flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt=""
                    src="https://i.pinimg.com/736x/d6/f1/8d/d6f18dcdfc48ef9c283fa8e68a5c7a9e.jpg"
                    className="h-8 w-8 rounded-full"
                  />
                </Menu.Button>
              </div>
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                    >
                      Your Profile
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                    >
                      Settings
                    </a>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-gray-100" : "",
                        "block px-4 py-2 text-sm text-gray-700"
                      )}
                      onClick={handleLogout}
                    >
                      Sign out
                    </a>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>

      <Disclosure.Panel className="sm:hidden">
        <div className="space-y-1 px-2 pb-3 pt-2">
          {initialNavigation.map((item) => (
            <Disclosure.Button
              key={item.key}
              as={Link}
              to={item.href}
              className={classNames(
                location.pathname === item.href
                  ? "bg-gray-900 text-white" // Active link styling
                  : "text-gray-300 hover:bg-gray-700 hover:text-white",
                "block rounded-md px-3 py-2 text-base font-medium"
              )}
            >
              {item.name}
            </Disclosure.Button>
          ))}
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
}

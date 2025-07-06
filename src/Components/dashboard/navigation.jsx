import { Disclosure, Menu } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom"; // Use Link and useLocation for navigation and current path detection
import { useNavigate } from "react-router-dom";

const initialNavigation = [
  { name: "Home", href: "/home", key: "home" },
  { name: "Vehicle", href: "/vehicle", key: "vehicle" },
  { name: "Driver", href: "/driver", key: "driver" },
  { name: "DriveHealth", href: "/analytics", key: "analytics" },
  { name: "Trip", href: "/trip", key: "trip" },
  { name: "RouteGenie", href: "/databridgeai", key: "databridgeai" },
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
    <Disclosure
      as="nav"
      className="bg-gradient-to-r from-dark-900 via-dark-800 to-dark-900 backdrop-blur-md border-b border-dark-700/50 shadow-xl"
    >
      <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
            {/* Mobile menu button */}
            <Disclosure.Button className="relative inline-flex items-center justify-center rounded-md p-3 text-dark-300 hover:bg-dark-700/50 hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset transition-all duration-200 min-h-[44px] min-w-[44px]">
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
                alt="DriveWise Logo"
                src="/LOGO.png"
                className="h-10 w-auto rounded-md shadow-md"
              />
            </div>
            <div className="hidden sm:ml-6 sm:block">
              <div className="flex space-x-1">
                {initialNavigation.map((item) => (
                  <Link
                    key={item.key}
                    to={item.href}
                    className={classNames(
                      location.pathname === item.href
                        ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-500/25" // Active link styling
                        : "text-dark-300 hover:bg-dark-700/50 hover:text-white hover:shadow-md",
                      "rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 transform hover:scale-105 min-h-[44px] flex items-center"
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
                <Menu.Button className="relative flex rounded-full bg-gradient-to-r from-primary-600 to-secondary-600 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 transition-all duration-200 hover:shadow-lg hover:shadow-primary-500/25">
                  <span className="sr-only">Open user menu</span>
                  <img
                    alt=""
                    src="https://i.pinimg.com/736x/d6/f1/8d/d6f18dcdfc48ef9c283fa8e68a5c7a9e.jpg"
                    className="h-8 w-8 rounded-full ring-2 ring-white/20"
                  />
                </Menu.Button>
              </div>
              <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-xl bg-dark-800/95 backdrop-blur-md py-1 shadow-2xl ring-1 ring-dark-600/50 focus:outline-none border border-dark-700/50">
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      to="/profile"
                      className={classNames(
                        active ? "bg-dark-700/50 text-white" : "text-dark-300",
                        "block px-4 py-2 text-sm transition-colors duration-200"
                      )}
                    >
                      Your Profile
                    </Link>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <a
                      href="#"
                      className={classNames(
                        active ? "bg-red-600/20 text-red-400" : "text-dark-300",
                        "block px-4 py-2 text-sm transition-colors duration-200"
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
        <div className="space-y-2 px-4 pb-4 pt-2">
          {initialNavigation.map((item) => (
            <Disclosure.Button
              key={item.key}
              as={Link}
              to={item.href}
              className={classNames(
                location.pathname === item.href
                  ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg" // Active link styling
                  : "text-dark-300 hover:bg-dark-700/50 hover:text-white",
                "block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 min-h-[48px] flex items-center"
              )}
            >
              {item.name}
            </Disclosure.Button>
          ))}
          <Disclosure.Button
            as={Link}
            to="/profile"
            className="text-dark-300 hover:bg-dark-700/50 hover:text-white block rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 min-h-[48px] flex items-center"
          >
            Profile
          </Disclosure.Button>
          <Disclosure.Button
            as="button"
            onClick={handleLogout}
            className="text-red-400 hover:bg-red-600/20 hover:text-red-300 block w-full text-left rounded-lg px-4 py-3 text-base font-medium transition-all duration-200 min-h-[48px] flex items-center"
          >
            Sign out
          </Disclosure.Button>
        </div>
      </Disclosure.Panel>
    </Disclosure>
  );
}

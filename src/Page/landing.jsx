"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useSpring, useInView } from "framer-motion";
import { useNavigate } from "react-router-dom";
import Footer from "../Components/Footer/Footer";
import { HoverEffect } from "../Components/ui/card-hover-effect";
import Lenis from "lenis";
import "lenis/dist/lenis.css";
import my_image from "../Components/assests/Screenshot 2025-02-07 010515.png";
import mimg from "../Components/assests/Screenshot 2025-02-07 010515.png";
const stats = [
  {
    value: 83,
    label: "Reduced time spent on inspections",
    company: "STANLEY STEEMER.",
  },
  {
    value: 48,
    label: "Saved on maintenance costs with Fleetio",
    company: "SMART WATT",
  },
  {
    value: 10,
    label: "Reduced time spent on fleet reports",
    company: "NEWKIRK ELECTRIC",
  },
];

const AnimatedNumber = ({ value, inView }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const springValue = useSpring(0, { stiffness: 100, damping: 10 });

  useEffect(() => {
    if (inView) {
      springValue.set(value); // Start animation when in view
    }
  }, [inView, springValue, value]);

  useEffect(() => {
    const updateDisplayValue = () =>
      setDisplayValue(Math.floor(springValue.get()));
    const interval = setInterval(updateDisplayValue, 50);

    return () => clearInterval(interval);
  }, [springValue]);

  return <span>{displayValue}</span>;
};

export function CardHoverEffectDemo() {
  return (
    <div className="max-w-5xl mx-auto px-8">
      <HoverEffect items={projects} />
    </div>
  );
}
export const projects = [
  {
    title: "Fleet Ease",
    description:
      "A smart fleet management system that streamlines driver and vehicle assignments, optimizing operations for business owners.",
    link: "#",
  },
  {
    title: "Auto Assign",
    description:
      "An automated system that efficiently assigns drivers to vehicles, reducing manual effort and ensuring smooth fleet operations.",
    link: "#",
  },
  {
    title: "Smart Maintenance",
    description:
      "AI-driven maintenance predictions help fleet owners anticipate service needs, minimizing downtime and repair costs.",
    link: "#",
  },
  {
    title: "Fleet Dashboard",
    description:
      "A real-time interactive dashboard providing insights into fleet performance, driver status, and maintenance schedules.",
    link: "#",
  },
  {
    title: "Route Optimizer",
    description:
      "Advanced route optimization ensures efficient trip planning, reducing fuel costs and improving delivery times.",
    link: "#",
  },
  {
    title: "Compliance Tracker",
    description:
      "Automated compliance tracking for vehicles and drivers, ensuring regulatory requirements are met without hassle.",
    link: "#",
  },
];
export const LandingPage = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const navigate = useNavigate();

  const handleLoginClick = () => navigate("/login");
  const handleSignupClick = () => navigate("/signup");

  return (
    <div>
      <div className="relative flex flex-col items-center justify-center   bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        {/* Buttons aligned to the top right */}
        <div className="   items-center justify-center">
          <div className="absolute top-6 right-6 flex space-x-4 z-20">
            <button
              onClick={handleLoginClick}
              className="px-6 py-3 text-white border border-neutral-200 rounded-md shadow-lg transition hover:bg-gradient-to-br from-neutral-500 to-gray-700 hover:text-black"
            >
              Login
            </button>
            <button
              onClick={handleSignupClick}
              className="px-6 py-3 text-white border border-white rounded-md shadow-lg transition hover:bg-gradient-to-br from-neutral-500 to-gray-700 hover:text-black "
            >
              Sign Up
            </button>
          </div>

          {/* Fleetio Heading */}
          <div className="mx-auto px-4 w-full text-center py-12">
            <h1 className="text-5xl font-extrabold text-white leading-tight">
              DriveWise
            </h1>
            <h3 className="text-lg text-gray-400 font-light max-w-lg mx-auto mt-4">
              One-stop solution for all your fleet management needs, from driver
              assignments to vehicle maintenance updates.
            </h3>
          </div>
          <div className="  h-[520px] bg-gradient-to-br from-gray-900 via-gray-600 to-black max-w-full mx-auto  rounded-lg mb-8 p-8 flex flex-col items-center justify-between shadow-2xl hover:shadow-3xl">
            <div className="text-center   ">
              <h1 className="text-2xl font-bold text-white leading-relaxed mb-1 px-4">
                Get Customized and informative dashboard to monitor your
                <br />
                business effectively and focus on profit
              </h1>
            </div>
            <div className="transition-transform duration-[1000ms] ease-in-out hover:scale-150 flex items-center justify-center mb-6 pb-6">
              <img
                src={my_image}
                className="w-full   max-h-[390px] object-fill rounded-lg hover:scale-105 transition-all"
              ></img>
            </div>
          </div>
          <div className="bg-gradient-to-br from-gray-900 via-gray-600 to-black rounded-lg mb-8 p-8">
            <h1 className="pt-5 text-2xl font-bold text-white text-center leading-relaxed  mt-4">
              Features to keep you ahead of the competition
            </h1>
            <CardHoverEffectDemo />
          </div>
          {/* Animated Stats Section */}
          <div
            ref={ref}
            className="mx-auto max-w-4xl  flex justify-center   py-12"
          >
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3     gap-6 text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className=" border border:bg border-transparent  dark:border-white/[0.2] rounded-lg p-6 transition duration-300 hover:-translate-x-2 shadow-md hover:shadow-blue-500/50  hover:bg-gray-900/50   bg-gray-800  "
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: index * 0.2, duration: 0.5 }}
                >
                  <h2 className="text-4xl font-bold  text-white">
                    <AnimatedNumber value={stat.value} inView={isInView} />
                    {index === 2 ? "x" : "%"}
                  </h2>
                  <p className="text-gray-400 hover:text-white mt-2  ">
                    {stat.label}
                  </p>
                  <p className="text-gray-500 hover:text-white font-semibold mt-2">
                    {stat.company}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LandingPage;

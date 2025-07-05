-- 1. Users Table
CREATE TABLE Users (
    userid VARCHAR(100) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    passwordhash VARCHAR(255) NOT NULL,
    phonenumber VARCHAR(15) NOT NULL
);

-- 2. Vehicles Table
CREATE TABLE Vehicles (
    vehicleid SERIAL PRIMARY KEY,
    userid VARCHAR(100) NOT NULL, -- Foreign key to Users table
    registrationnumber VARCHAR(20) UNIQUE NOT NULL,
    nextduedate DATE,
    make VARCHAR(50) NOT NULL, -- e.g., Toyota
    latitude NUMERIC(10, 6), -- Assuming precision for latitude
    longitude NUMERIC(10, 6), -- Assuming precision for longitude
    fueltype VARCHAR(10) CHECK (fueltype IN ('Petrol', 'Diesel', 'Electric', 'Hybrid')) NOT NULL,
    idealmileage NUMERIC(15,2),
    status VARCHAR(20) CHECK (status IN ('Active', 'Inactive', 'Under Maintenance')) DEFAULT 'Inactive',
    FOREIGN KEY (userid) REFERENCES Users(userid)
);

-- 3. Drivers Table
CREATE TABLE Drivers (
    driverid SERIAL PRIMARY KEY,
    userid VARCHAR(100) NOT NULL, -- Foreign key to Users table
    name VARCHAR(100) NOT NULL,
    earningperkm NUMERIC(15,2),
    LicenseNumber VARCHAR(50) UNIQUE NOT NULL,
    PhoneNumber VARCHAR(15) NOT NULL,
    AssignedVehicleID INT DEFAULT NULL, -- Nullable foreign key to Vehicles table
    FOREIGN KEY (userid) REFERENCES Users(userid),
    FOREIGN KEY (AssignedVehicleID) REFERENCES Vehicles(vehicleid)
);

-- 4. Trips Table
CREATE TABLE Trips (
    tripID SERIAL PRIMARY KEY,
    userid VARCHAR NOT NULL,
    vehicleID INT NOT NULL, -- Foreign key to Vehicles table
    driverid INT NOT NULL, -- Foreign key to Drivers table
    Startlatitude NUMERIC(11,8) NOT NULL,
    Startlongitude NUMERIC(11,8) NOT NULL,
    Endlatitude NUMERIC(11,8),
    Endlongitude NUMERIC(11,8),
    StartTime TIMESTAMP NOT NULL,
    EndTime TIMESTAMP,
    DistanceTravelled NUMERIC(10,2) DEFAULT 0.00,
    TripStatus VARCHAR(20) CHECK (TripStatus IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')) DEFAULT 'Scheduled',
    FOREIGN KEY (vehicleID) REFERENCES Vehicles(vehicleID),
    FOREIGN KEY (driverid) REFERENCES Drivers(driverid),
    FOREIGN KEY (userid) REFERENCES Users(userid)
);

--  for modifying vehicles table to inactive the default status
ALTER TABLE Vehicles
ALTER COLUMN status SET DEFAULT 'Inactive';
ALTER TABLE trips
ADD COLUMN savings NUMERIC(10,2);
-- for modifying trips table to add revenue generated in each trip
ALTER TABLE trips
ADD COLUMN revenue NUMERIC(15,2);
ALTER TABLE drivers
ADD COLUMN lastdutydate DATE
-- maintainance table
CREATE TABLE MaintenanceRecords (
    recordid SERIAL PRIMARY KEY,
	userid VARCHAR(100), 
    vehicleid INT, -- Foreign key to Vehicles table
    maintenancetype VARCHAR(100), -- e.g., Oil Change, Tire Replacement
    cost DECIMAL(10,2),
    maintenancedate DATE,
    remarks TEXT,
    FOREIGN KEY (vehicleid) REFERENCES Vehicles(vehicleid),
	FOREIGN KEY (userid) REFERENCES users(userid)
);

-- 5. Prebookings Table
-- 5. Prebookings Table
CREATE TABLE Prebookings (
    id SERIAL PRIMARY KEY,
    userid VARCHAR(100) NOT NULL,
    vehicleid INT NOT NULL,
    locationid VARCHAR(255)  NULL, -- Charging station/location ID from map
    latitude NUMERIC(10, 6) NOT NULL, -- Latitude of the charging location
    longitude NUMERIC(10, 6) NOT NULL, -- Longitude of the charging location
    currentcharge NUMERIC NOT NULL,
    eta_minutes NUMERIC NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, locked, expired, arrived
    lockexpiresat TIMESTAMP,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES Users(userid),
    FOREIGN KEY (vehicleid) REFERENCES Vehicles(vehicleid)
);
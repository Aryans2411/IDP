import express from "express";
import pkg from "pg";
import path from "path";
import { createClient } from '@supabase/supabase-js'
// import Groq from "groq-sdk";
import { fileURLToPath } from "url";
import fs from "fs";
import Groq from "groq-sdk";
import "dotenv/config";
import bcrypt from "bcrypt";
import cors from "cors";
import { start } from "repl";
import axios from "axios";
const { Client } = pkg;
const app = express();
const port = 4000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const API_KEY = process.env.GROQ_API_KEY;
const groq = new Groq({
  apiKey: API_KEY,
});


const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

const con = new Client({
  host: "localhost",
  user: "postgres",
  port: process.env.POSTGRES_PORT || 5432,
  password: process.env.POSTGRES_PASS, // Replace with your actual password
  database: process.env.POSTGRES_NAME,
});

con.connect(async (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to database");
  }
});
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded data

// Update CORS for deployment (allow all origins)
app.use(
  cors({
    origin: true, // Allow all origins for deployment; restrict as needed
    credentials: true,
  })
);

let userid = process.env.userid;
let emailid = process.env.emailid;
// Function to initialize database tables
async function initializeDatabase() {
  try {
    const sqlFilePath = path.join(__dirname, "db", "table.sql");
    const sqlCommands = fs.readFileSync(sqlFilePath, "utf8");
    await con.query(sqlCommands);
    // console.log("Tables initialized successfully");
  } catch (err) {
    console.error("Error initializing tables:", err);
  }
}

//login api controller
app.post("/formPost", async (req, res) => {
  try {
    // console.log("Received login request:", req.body); // Debug log

    const { email, password } = req.body;

    if (!email || !password) {
      console.error("Missing required fields");
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Check if the user exists in the database
    const checkQuery = "SELECT * FROM users WHERE email = $1";
    // console.log("Executing query with email:", email); // Debug log
    const result = await con.query(checkQuery, [email]);

    //  console.log("Query result:", result.rows.length); // Debug log

    if (result.rows.length === 0) {
      console.error("User does not exist in the database");
      return res
        .status(404)
        .json({ error: "User does not exist. Please sign up first." });
    }

    // User exists; verify the password
    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.passwordhash);
    // console.log("Password match:", passwordMatch); // Debug log

    if (!passwordMatch) {
      console.error("Invalid password");
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // console.log("reached here");
    // Route to the home page if credentials are valid
    // console.log("User authenticated successfully:", email);
    emailid = email;
    const query = "SELECT userid FROM users WHERE email=$1";
    const uuid = await con.query(query, [emailid]);

    userid = uuid.rows[0].userid;
    // console.log(userid);
    // console.log(uuid.rows[0].userid);
    res.status(200).json({ message: "Login successful" });
  } catch (err) {
    console.error("Detailed error in login:", err); // More detailed error logging
    res.status(500).json({ error: "Internal server error" });
  }
});

//sign up controller
app.post("/signUpPost", async (req, res) => {
  try {
    //console.log("Sign-up form submitted:", req.body);

    const { name, email, password, phonenumber } = req.body;

    // Validate input fields
    if (!name || !email || !password || !phonenumber) {
      console.error("Missing required fields");
      return res.status(400).json({
        error: "All fields (firstName, email, password) are required",
      });
    }

    // Check if the user already exists
    const checkQuery = "SELECT * FROM users WHERE email = $1";
    const existingUser = await con.query(checkQuery, [email]);

    if (existingUser.rows.length > 0) {
      console.error("User already exists with this email");
      return res
        .status(409)
        .json({ error: "User already exists. Please log in." });
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    // Insert new user into the users table
    const userid = `user-${Date.now()}`; // Generate a simple unique identifier
    const query = `
    INSERT INTO users (userid, name, email, passwordhash, phonenumber)
    VALUES ($1, $2, $3, $4, $5)
`;

    const values = [userid, name, email, hashedPassword, phonenumber];

    await con.query(query, values);

    // console.log("New user created successfully:", email);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Error processing sign-up:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//initialising table
app.get("/initialise_table", async (req, res) => {
  await initializeDatabase();
  res.send("Tables initialized successfully");
  // console.log("Tables initialized successfully");
});
// api endpoint for finding out total number of drivers
app.get("/api/get_totaldriver", async (req, res) => {
  try {
    const query = `
      SELECT Count(*) FROM Drivers WHERE userid= $1
    `;
    const response = await con.query(query, [userid]);
    res.json(response.rows[0].count);
  } catch (error) {
    // console.log("Error in fetching total number of drivers");
    res.status(500).json({ error: "Fetching total number of drivers" });
  }
});

app.get("/api/get_totalvehicles", async (req, res) => {
  try {
    const query = `
      SELECT Count(*) FROM vehicles WHERE userid= $1
    `;
    const response = await con.query(query, [userid]);
    res.json(response.rows[0].count);
  } catch (error) {
    //console.log("Error in fetching total number of vehicles");
    res.status(500).json({ error: "Fetching total number of vehicles" });
  }
});

//post api endpoint for vehicle register
app.post("/api/vehicle_register", async (req, res) => {
  try {
    // Destructure inputs from the request body
    const {
      registrationnumber,
      make,
      latitude,
      longitude,
      fueltype,
      idealmileage,
    } = req.body;

    // Validate required fields
    if (
      !registrationnumber ||
      !make ||
      !fueltype ||
      !idealmileage ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({
        error:
          "Required fields are missing: registrationnumber, make, fueltype, idealmileage",
      });
    }

    // Validate fueltype
    const validFuelTypes = ["Petrol", "Diesel", "Electric"];
    if (!validFuelTypes.includes(fueltype)) {
      return res.status(400).json({ error: "Invalid fuel type" });
    }

    // Insert data into the Vehicles table
    const query = `
            INSERT INTO Vehicles (
                userid, registrationnumber, make, fueltype, idealmileage,latitude,longitude
            )
            VALUES ($1, $2, $3, $4, $5,$6,$7)
            RETURNING vehicleid;
        `;

    const values = [
      userid,
      registrationnumber,
      make,
      fueltype,
      idealmileage, // Defaults to 'Active' if not provided
      latitude,
      longitude,
    ];

    const result = await con.query(query, values);

    // Respond with success and the newly created vehicle ID
    res.status(201).json({
      message: "Vehicle registered successfully",
      vehicleid: result.rows[0].vehicleid,
    });
  } catch (err) {
    console.error("Error registering vehicle:", err);

    // Handle unique constraint violation for registrationnumber
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Registration number already exists",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

//driver_register table
app.post("/api/driver_register", async (req, res) => {
  try {
    // Destructure inputs from the request body
    const { name, earningperkm, licensenumber, phonenumber } = req.body;
    // console.log(req.body);
    // console.log(req.body.licensenumber);
    // console.log(req.body.phonenumber);
    // Validate required fields
    if (!name || !licensenumber || !phonenumber) {
      return res.status(400).json({
        error: "Required fields are missing: name, licensenumber, phonenumber",
      });
    }

    // Validate the format of the license number (optional)
    if (licensenumber.length > 50) {
      return res
        .status(400)
        .json({ error: "License number exceeds maximum length" });
    }

    // Validate that earning per km, if provided, is a positive number
    if (earningperkm !== undefined && earningperkm < 0) {
      return res
        .status(400)
        .json({ error: "Earning per km must be a positive value" });
    }

    // Insert data into the Drivers table
    const query = `
            INSERT INTO Drivers (
              userid, name, earningperkm, LicenseNumber, PhoneNumber  
            )
            VALUES ($1, $2, $3, $4,$5)
            RETURNING driverid;
        `;

    const values = [
      userid,
      name,
      earningperkm,
      licensenumber,
      phonenumber,
      // Set to NULL if not provided
    ];

    const result = await con.query(query, values);

    // Respond with success and the newly created driver ID
    res.status(201).json({
      message: "Driver registered successfully",
      driverid: result.rows[0].driverid,
    });
  } catch (err) {
    console.error("Error registering driver:", err);

    // Handle unique constraint violation for licensenumber
    if (err.code === "23505") {
      return res.status(409).json({
        error: "License number already exists",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

//api for getting all drivers
app.get("/api/get_all_drivers", async (req, res) => {
  try {
    // console.log(userid);
    const query = `SELECT * FROM drivers WHERE userid=$1`;

    const response = await con.query(query, [userid]);
    // console.log(response.rows);
    res.json(response.rows);
  } catch (error) {
    console.error("Error fetching drivers data", error);
    res.status(500).json({
      error: "Error fetching in drivers data",
    });
  }
});
// api endpoint for editing the trips table
// app.put("/api/delete_trips",async(req,res)=>{
//   const query = `DELETE FROM Trips
//               WHERE tripID = $1;
//             `;
//   const result = await con.query(query,[])
// })
//api for getting all vehicles
app.get("/api/get_all_vehicles", async (req, res) => {
  try {
    const query = `SELECT * FROM vehicles WHERE userid=$1`;
    const response = await con.query(query, [userid]);
    // console.log(response.rows);
    res.json(response.rows);
  } catch (error) {
    console.error("Error fetching vehicles data", error);
    res.status(500).json({
      error: "Error fetching in vehicles data",
    });
  }
});

// API endpoint for trip backend
app.post("/api/tripregistered", async (req, res) => {
  try {
    const {
      starttime,
      endtime,
      startlatitude1,
      startlongitude1,
      endlatitude1,
      endlongitude1,
      distancetravalled1,
      revenue,
    } = req.body;
    // console.log(req.body);
    // Parse numeric and integer values
    const startlatitude = parseFloat(startlatitude1);
    const startlongitude = parseFloat(startlongitude1);
    const endlatitude = parseFloat(endlatitude1);
    const endlongitude = parseFloat(endlongitude1);
    const distancetravelled = parseFloat(distancetravalled1);
    const reveneue = parseInt(revenue);
    // console.log(distancetravalled1);

    // Validate required fields
    if (
      !startlatitude ||
      !startlongitude ||
      !endlatitude ||
      !endlongitude ||
      !starttime ||
      !revenue
    ) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields properly." });
    }

    // Find the best-suited vehicle ID (Placeholder for logic)
    let bestVehicleID = null; // Initialize variable to store the best vehicle ID

    /*
      Algorithm for finding the best-suited vehicle:
      1. Query the database to get all inactive vehicles and their current locations (latitude, longitude).
      2. Calculate the Euclidean distance between the start point of the trip (startlatitude, startlongitude) and each vehicle's location.
      3. Select the vehicle with the minimum distance.
      4. Assign the vehicle ID to the `bestVehicleID` variable.
    */
    let mileage;
    const inactiveVehiclesQuery = `
      SELECT vehicleid, latitude, longitude,idealmileage
      FROM vehicles
      WHERE status = 'Inactive' AND ($1<nextduedate OR nextduedate is NULL);
    `;
    const vehicles = await con.query(inactiveVehiclesQuery, [endtime]);

    if (vehicles.rows.length > 0) {
      let minDistance = Number.MAX_SAFE_INTEGER;

      vehicles.rows.forEach((vehicle) => {
        const vehicleLatitude = parseFloat(vehicle.latitude);
        const vehicleLongitude = parseFloat(vehicle.longitude);

        // Calculate Euclidean distance
        const distance = Math.sqrt(
          Math.pow(vehicleLatitude - startlatitude, 2) +
            Math.pow(vehicleLongitude - startlongitude, 2)
        );

        // Update the bestVehicleID if a closer vehicle is found
        if (distance < minDistance) {
          minDistance = distance;
          bestVehicleID = vehicle.vehicleid;
          mileage = vehicle.idealmileage;
        }
      });
    } else {
      return res.status(404).json({ error: "No free  vehicles available." });
    }
    // console.log(bestVehicleID);
    // selecting driver_id
    const query3 = `
      SELECT driverid
      FROM drivers
      WHERE userid = $1
      AND assignedvehicleid IS NULL
      AND (lastdutydate IS NULL OR $2 - lastdutydate > 1);
    `;
    const response3 = await con.query(query3, [userid, starttime]);
    const driverid = response3.rows[0].driverid;
    const percentagedistancesaved = Math.random() * (25 - 10) + 10;
    const distancesaved = (distancetravelled * percentagedistancesaved) / 100;
    const fuelsaved = distancesaved / mileage;
    const emissionfactor = 2.68;
    const co2emission = emissionfactor * fuelsaved;
    console.log("reached here ", co2emission);
    // console.log(driverid);
    // Define the query to insert the trip into the database
    const query = `
    INSERT INTO trips (
      userid,
      vehicleid,
      driverid,
      startlatitude,
      startlongitude,
        endlatitude,
        endlongitude,
        starttime,
        endtime,
        distancetravelled,
        revenue,
        savings
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12)
        RETURNING tripid;
        `;

    // console.log("reached here",distancetravelled);
    // Execute the query
    const response = await con.query(query, [
      userid,
      bestVehicleID,
      driverid,
      startlatitude,
      startlongitude,
      endlatitude,
      endlongitude,
      starttime,
      endtime,
      distancetravelled,
      revenue,
      co2emission,
    ]);
    const query4 = `
      UPDATE drivers
      SET assignedvehicleid = $1
      WHERE driverid = $2
    `;
    const response4 = await con.query(query4, [bestVehicleID, driverid]);
    const query5 = `
      UPDATE vehicles
      SET status = $1
      WHERE vehicleid = $2
    `;

    const response5 = await con.query(query5, ["Active", bestVehicleID]);

    // console.log(response4.rows);
    // Return the newly created trip ID
    // console.log(response.rows);
    res.json(response.rows);
  } catch (error) {
    console.error("Error in registering trips:", error);
    res.status(500).json({ error: "Error in registering for trips" });
  }
});
//api endpoint for creating a graph for carbon emission on monthly basis
app.get("/api/carbonemissiondata", async (req, res) => {
  try {
    const query1 = `
         WITH month AS (
        SELECT generate_series(1, 12) AS month_number
        )
        SELECT 
			TO_CHAR(TO_DATE(m.month_number::TEXT, 'MM'), 'FMMonth') AS month_name,
			COALESCE(SUM(t.savings),0) AS carbonemission
        FROM month m
          
        LEFT JOIN Trips t ON EXTRACT(MONTH FROM t.starttime) = m.month_number
        GROUP BY m.month_number
        ORDER BY m.month_number;
    `;
    const response = await con.query(query1);
    console.log(response.rows[0]);
    res.json(response.rows);
  } catch (error) {
    console.error({ message: "Error in getting all the carbon emission data" });
    res
      .status(400)
      .json({ error: "Error in getting all the carbon emission data" });
  }
});
//api endpoint for marking the trip completion
app.post("/api/tripcompletion", async (req, res) => {
  try {
    const { registrationnumber, endtime } = req.body;

    const query1 = `
      SELECT vehicleid
      FROM vehicles
      WHERE registrationnumber = $1
    `;
    const response1 = await con.query(query1, [registrationnumber]);
    const vehicleid = response1.rows[0].vehicleid;
    const query2 = `
      UPDATE trips
      SET
        tripstatus = 'Completed'
        WHERE vehicleid = $1 AND tripstatus = 'Scheduled'
    `;
    const response2 = await con.query(query2, [vehicleid]);
    const query3 = `
      UPDATE vehicles
      SET 
        status = 'Inactive'
        WHERE vehicleid = $1
    `;
    const response3 = await con.query(query3, [vehicleid]);
    const query4 = `
      UPDATE drivers
SET 
    assignedvehicleid = NULL, 
    lastdutydate = $1
WHERE assignedvehicleid = $2;
    `;
    const response4 = await con.query(query4, [endtime, vehicleid]);
    res.status(200).json({ message: "Updated successfully trip completion!" });
  } catch (error) {
    console.error("Error in registering the trip completion:", error);
    res.status(500).json({ error: "Error in trip completion registered" });
  }
});

//API endpoint for getting all trips
app.get("/api/get_all_trips", async (req, res) => {
  try {
    const query = `
      SELECT 
        Trips.tripid,
        Trips.userid,
        Drivers.name AS name,
        Vehicles.registrationNumber AS registrationnumber,
        Trips.Startlatitude,
        Trips.Startlongitude,
        Trips.Endlatitude,
        Trips.Endlongitude,
        Trips.StartTime,
        Trips.EndTime,
        Trips.DistanceTravelled,
        Trips.TripStatus,
        Trips.revenue
      FROM Trips
      INNER JOIN Drivers ON Trips.driverid = Drivers.driverid
      INNER JOIN Vehicles ON Trips.vehicleid = Vehicles.vehicleid
      WHERE Trips.userid = $1
    `;

    // console.log("reached here", userid)
    const response = await con.query(query, [userid]);
    res.json(response.rows);
  } catch (error) {
    console.error("Error fetching trips data:", error);
    res.status(500).json({
      error: "Error fetching trips data",
    });
  }
});

app.get("/api/get_totalrevenue", async (req, res) => {
  try {
    const query = `
          SELECT SUM(revenue) 
          FROM Trips
          WHERE userid = $1
      `;
    const result = await con.query(query, [userid]);
    // console.log("result", result.rows[0].sum);
    res.json(Number(result.rows[0].sum));
  } catch (error) {
    console.error({ error: "Error in fetching the total revenue" });
    res.status(500).json({ error: "Error in fetching the total revenue" });
  }
});

app.get("/api/get_totalcost", async (req, res) => {
  try {
    const petrolprice = 102;
    const dieselprice = 75;
    const query1 = `
    SELECT SUM(cost)
    FROM maintenancerecords
    WHERE userid=$1
    `;
    const result = await con.query(query1, [userid]);
    const sum = isNaN(parseInt(result.rows[0].sum))
      ? 0
      : parseInt(result.rows[0].sum);

    // console.log("this is sum ", sum);
    //this query2 is for fuel consumption cost
    const query2 = `
    SELECT 
    SUM(
      (t.distancetravelled / v.idealmileage) * 
      CASE 
      WHEN v.fueltype = 'Petrol' THEN $1
      WHEN v.fueltype = 'Diesel' THEN $2
      ELSE 0
      END
      ) AS net_amount
      FROM trips t
      JOIN vehicles v ON t.vehicleid = v.vehicleid
      WHERE v.userid = $3;
      
      `;
    const result2 = await con.query(query2, [petrolprice, dieselprice, userid]);
    const netamount1 = parseInt(result2.rows[0].net_amount);
    // console.log("netamount1", netamount1);
    const query3 = `
      SELECT 
      SUM(t.distancetravelled * d.earningperkm) AS net_earning
      FROM trips t
      JOIN drivers d ON t.driverid = d.driverid 
      WHERE d.userid = $1;
      `;
    const result3 = await con.query(query3, [userid]);
    const netamount2 = parseInt(result3.rows[0].net_earning);
    // console.log("this is netamount2", netamount2);
    // console.log(netamount2);
    // console.log(netamount1);
    // console.log("result",result.rows[0].sum,result2.rows[0].net_amount," ",result3.rows[0].net_earning);
    const cost = sum + netamount1 + netamount2;
    //console.log(cost);
    res.json(cost);
  } catch (error) {
    console.error({ error: "Error in fetching the total cost" });
    res.status(500).json({ error: "Error in fetching the total cost" });
  }
});
//API endpoint for getting total active vehicles
app.get("/api/get_active_vehicle", async (req, res) => {
  try {
    const query = `SELECT Count(*) FROM vehicles where userid=$1 AND status='Active'`;
    const response = await con.query(query, [userid]);
    const activeVehicleCount = response.rows[0].count;
    // console.log("active vehicles", activeVehicleCount);
    res.json(response.rows[0].count); // return only the count as an object
  } catch (error) {
    console.error("error in fetching total active vehicles", error);
    res.status(500).json({ error: "error in fetching active vehicles" });
  }
});
//api endpoint for getting all the maintenance record
app.get("/api/get_maintenance", async (req, res) => {
  try {
    const query = `SELECT * FROM maintenancerecords WHERE userid= $1`;
    const result = await con.query(query, [userid]);
    // console.log("Result :", result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error({ error: "Error in getting the maintainance record" });
    res.status(500).json({ error: "Error fetching in maintainance record" });
  }
});
//api endpoint for posting all the maintenance record
app.post("/api/maintenanceregister", async (req, res) => {
  try {
    const { vehicleid, maintenancetype, cost, maintenancedate, remarks } =
      req.body;
    if (
      !vehicleid ||
      !maintenancetype ||
      !cost ||
      !maintenancedate ||
      !remarks
    ) {
      res.status(400).json({ error: "Please fill all the details" });
    }
    const query5 = `
        SELECT status 
        FROM vehicles
        WHERE vehicleid = $1
    `;
    const result6 = await con.query(query5, [vehicleid]);
    if (
      result6.rows[0].status === "Active" ||
      result6.rows[0].status === "Under Maintenance"
    ) {
      return res
        .status(404)
        .json({ error: "Please select any inactive vehicle" });
    }

    const query = `INSERT INTO maintenancerecords(userid,vehicleid,maintenancetype,cost,maintenancedate,remarks)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING recordid`;
    const result = await con.query(query, [
      userid,
      vehicleid,
      maintenancetype,
      cost,
      maintenancedate,
      remarks,
    ]);
    // console.log(result.rows[0].recordid);

    const update_query = `UPDATE vehicles
                            SET status='Under Maintenance'
                            where vehicleid=$1;`;

    const result1 = await con.query(update_query, [vehicleid]);
    res.json(result.rows[0].recordid);
  } catch (error) {
    console.error({ error: "Error in posting the record" });
    res.status(400).json({ error: "Error in posting the record" });
  }
});

app.get("/api/get_total_maintenance_vehicles", async (req, res) => {
  try {
    const query = `
      SELECT Count(*) FROM vehicles WHERE userid= $1 AND status='Under Maintenance'
    `;
    const response = await con.query(query, [userid]);
    res.json(response.rows[0].count);
  } catch (error) {
    // console.log("Error in fetching total number of vehicles");
    res.status(500).json({ error: "Fetching total number of vehicles" });
  }
});
app.post("/api/set_maintenance_date", async (req, res) => {
  try {
    const { nextduedate, registrationnumber } = req.body;
    console.log("request body: ", req.body);

    // Validate required fields
    if (!nextduedate || !registrationnumber) {
      return res.status(400).json({
        error: "Both nextduedate and registrationnumber are required",
      });
    }

    const query = `UPDATE vehicles SET nextduedate = $1
                  WHERE registrationnumber = $2`;
    const response = await con.query(query, [nextduedate, registrationnumber]);

    if (response.rowCount === 0) {
      return res.status(404).json({
        error: "Vehicle with this registration number not found",
      });
    }

    res.json({
      message: "Maintenance date updated successfully",
      updatedRows: response.rowCount,
    });
  } catch (error) {
    console.error("Error in posting the record:", error);
    res.status(400).json({ error: "Error in posting the record" });
  }
});
// Function to get structure for all tables
const getTableStructures = async () => {
  const dbStructure = {};
  try {
    const query = `
      SELECT 
        table_name,
        column_name,
        data_type
      FROM 
        information_schema.columns
      WHERE 
        table_schema = 'public'
      ORDER BY 
        table_name, ordinal_position;
    `;

    const result = await con.query(query);
    result.rows.forEach((row) => {
      if (!dbStructure[row.table_name]) {
        dbStructure[row.table_name] = [];
      }
      dbStructure[row.table_name].push({
        column: row.column_name,
        type: row.data_type,
      });
    });

    return dbStructure;
  } catch (error) {
    console.error("Error fetching table structures:", error);
    throw error;
  }
};

// Function to let the agent decide which table to use
const determineRelevantTable = async (prompt, dbStructure) => {
  const schemaDescription = Object.entries(dbStructure)
    .map(([tableName, columns]) => {
      const columnDesc = columns
        .map((col) => `${col.column}: ${col.type}`)
        .join(", ");
      return `Table ${tableName} has columns: ${columnDesc}`;
    })
    .join("\n");

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a database expert. Given a user whose userid is ${userid} and user's question and database schema, return only the single most relevant table name that would be needed to answer the question. Return just the table name as a string without any additional text or formatting.`,
      },
      {
        role: "user",
        content: `Schema:\n${schemaDescription}\n\nQuestion: ${prompt}\n\nReturn only the most relevant table name.`,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.1,
    max_tokens: 50,
  });

  return completion.choices[0]?.message?.content.trim();
};

// Function to extract all content from the selected table
const extractTableContent = async (tableName) => {
  try {
    // Get all data from the table
    const query = `SELECT * FROM ${tableName};`;
    const result = await con.query(query);

    // Convert the table content to a formatted string
    const contentString = result.rows
      .map((row) => JSON.stringify(row))
      .join("\n");

    return {
      data: result.rows,
      contentString: contentString,
    };
  } catch (error) {
    console.error(`Error extracting content from ${tableName}:`, error);
    throw error;
  }
};

// Function to generate SQL query with table content context
const generateSQLQuery = async (
  prompt,
  dbStructure,
  tableName,
  tableContent
) => {
  // Create context with schema and table content
  const tableSchema = dbStructure[tableName];
  const schemaContext = `Table ${tableName}:\nColumns: ${tableSchema
    .map((col) => `${col.column}: ${col.type}`)
    .join(", ")}\n\nTable content sample:\n${tableContent.contentString.slice(
    0,
    1000
  )}...`; // Limiting content sample to avoid token limits

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `
       You are an SQL expert who can only READ the database. Do not generate any queries related to INSERT, UPDATE, DELETE or other modification queries. You have access to the following database context:\n${schemaContext}\n and userid is ${userid} and emailid is ${emailid}.
        Do not entertain queries that request information about other users.
        Return only the SQL query without any explanation.
        Generate a SQL query that answers the user's question using the provided table.`,
      },
      {
        role: "user",
        content: prompt,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.2,
    max_tokens: 512,
  });

  return completion.choices[0]?.message?.content.trim();
};

// Simple cache for geocoding results
const geocodingCache = new Map();
const GEOCODING_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

// Function to reverse geocode coordinates to address with caching
async function reverseGeocode(latitude, longitude) {
  try {
    // Create cache key
    const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;

    // Check cache first
    const cached = geocodingCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < GEOCODING_CACHE_TTL) {
      return cached.address;
    }

    // Add delay to respect rate limits (Nominatim allows 1 request per second)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
      {
        headers: {
          "User-Agent": "FleetManagementApp/1.0",
        },
      }
    );

    if (response.data && response.data.display_name) {
      const address = response.data.display_name;

      // Cache the result
      geocodingCache.set(cacheKey, {
        address: address,
        timestamp: Date.now(),
      });

      return address;
    }
    return null;
  } catch (error) {
    console.error("Error in reverse geocoding:", error);
    return null;
  }
}

// Function to process location data in query results
async function processLocationData(queryResults) {
  const processedResults = [];

  console.log(`Processing ${queryResults.length} rows for location data`);

  for (const row of queryResults) {
    const processedRow = { ...row };

    // Check if row has latitude and longitude fields (vehicle locations)
    if (row.latitude && row.longitude) {
      try {
        console.log(
          `Geocoding vehicle location: ${row.latitude}, ${row.longitude}`
        );
        const address = await reverseGeocode(row.latitude, row.longitude);
        if (address) {
          processedRow.address = address;
          console.log(`Vehicle address resolved: ${address}`);
        } else {
          console.log(
            `Failed to resolve address for vehicle at ${row.latitude}, ${row.longitude}`
          );
        }
      } catch (error) {
        console.error("Error processing vehicle location for row:", error);
      }
    }

    // Check for start coordinates in trips
    if (row.startlatitude && row.startlongitude) {
      try {
        console.log(
          `Geocoding trip start location: ${row.startlatitude}, ${row.startlongitude}`
        );
        const startAddress = await reverseGeocode(
          row.startlatitude,
          row.startlongitude
        );
        if (startAddress) {
          processedRow.startaddress = startAddress;
          console.log(`Trip start address resolved: ${startAddress}`);
        } else {
          console.log(
            `Failed to resolve start address for trip at ${row.startlatitude}, ${row.startlongitude}`
          );
        }
      } catch (error) {
        console.error("Error processing start location for row:", error);
      }
    }

    // Check for end coordinates in trips
    if (row.endlatitude && row.endlongitude) {
      try {
        console.log(
          `Geocoding trip end location: ${row.endlatitude}, ${row.endlongitude}`
        );
        const endAddress = await reverseGeocode(
          row.endlatitude,
          row.endlongitude
        );
        if (endAddress) {
          processedRow.endaddress = endAddress;
          console.log(`Trip end address resolved: ${endAddress}`);
        } else {
          console.log(
            `Failed to resolve end address for trip at ${row.endlatitude}, ${row.endlongitude}`
          );
        }
      } catch (error) {
        console.error("Error processing end location for row:", error);
      }
    }

    processedResults.push(processedRow);
  }

  console.log(
    `Location processing complete. Processed ${processedResults.length} rows.`
  );
  return processedResults;
}

// Function to interpret query results
const interpretResults = async (
  prompt,
  queryResults,
  query,
  tableName,
  tableContent
) => {
  // Check if the prompt is asking about location
  const isLocationQuery =
    prompt.toLowerCase().includes("location") ||
    prompt.toLowerCase().includes("where") ||
    prompt.toLowerCase().includes("address") ||
    prompt.toLowerCase().includes("place") ||
    prompt.toLowerCase().includes("coordinates") ||
    prompt.toLowerCase().includes("latitude") ||
    prompt.toLowerCase().includes("longitude");

  let processedResults = queryResults;

  // If it's a location query, add address information
  if (isLocationQuery && queryResults.length > 0) {
    console.log("Processing location data for query:", prompt);
    processedResults = await processLocationData(queryResults);
    console.log("Processed results with addresses:", processedResults);
  }

  // Create a more specific system prompt for location queries
  let systemPrompt = `You are an expert at interpreting database results. Provide a clear, natural language answer to the user's question. Include relevant context from the data but be concise.`;

  if (isLocationQuery) {
    systemPrompt += ` IMPORTANT: If the results include address information (address, startaddress, endaddress fields), ALWAYS use these human-readable addresses in your response instead of coordinates. Do not mention latitude/longitude coordinates if address information is available. Make the response user-friendly by focusing on the actual location names.`;
  }

  const completion = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: `Original question: ${prompt}\n
                 Query executed: ${query}\n
                 Table used: ${tableName}\n
                 Results: ${JSON.stringify(processedResults)}\n
                 ${
                   isLocationQuery
                     ? "IMPORTANT: Use the address fields (address, startaddress, endaddress) instead of coordinates in your response. Focus on human-readable locations."
                     : ""
                 }
                 Please provide a clear answer to the original question based on these results.`,
      },
    ],
    model: "llama3-70b-8192",
    temperature: 0.7,
    max_tokens: 512,
  });

  return completion.choices[0]?.message?.content;
};

// AI Inference API endpoint
app.post("/api/processPrompt", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("Processing prompt:", prompt);

    // Check if this is a location-related query
    const isLocationQuery =
      prompt.toLowerCase().includes("location") ||
      prompt.toLowerCase().includes("where") ||
      prompt.toLowerCase().includes("address") ||
      prompt.toLowerCase().includes("place") ||
      prompt.toLowerCase().includes("coordinates") ||
      prompt.toLowerCase().includes("latitude") ||
      prompt.toLowerCase().includes("longitude");

    // Step 1: Get database schema
    const dbStructure = await getTableStructures();

    // Step 2: Determine the relevant table
    const relevantTable = await determineRelevantTable(prompt, dbStructure);
    console.log("Relevant table determined:", relevantTable);

    // Step 3: Extract content from the relevant table
    const tableContent = await extractTableContent(relevantTable);

    // Step 4: Generate SQL query with context
    const sqlQuery = await generateSQLQuery(
      prompt,
      dbStructure,
      relevantTable,
      tableContent
    );
    console.log("Generated SQL Query:", sqlQuery);

    // Step 5: Execute the query
    const sqlQueryTrim = sqlQuery.replace(/^```|```$/g, "").trim();

    const queryResult = await con.query(sqlQueryTrim);
    console.log("Query results:", queryResult.rows);

    // Step 6: Process location data if it's a location query
    let processedResults = queryResult.rows;
    let geocodedData = null;

    if (isLocationQuery && queryResult.rows.length > 0) {
      console.log("Location query detected, processing geocoding...");
      processedResults = await processLocationData(queryResult.rows);

      // Extract geocoded information for frontend
      geocodedData = processedResults
        .map((row) => {
          const geocoded = {};

          if (row.address) {
            geocoded.address = row.address;
          }
          if (row.startaddress) {
            geocoded.startaddress = row.startaddress;
          }
          if (row.endaddress) {
            geocoded.endaddress = row.endaddress;
          }

          // Include original coordinates for reference
          if (row.latitude && row.longitude) {
            geocoded.coordinates = {
              latitude: row.latitude,
              longitude: row.longitude,
            };
          }
          if (row.startlatitude && row.startlongitude) {
            geocoded.startCoordinates = {
              latitude: row.startlatitude,
              longitude: row.startlongitude,
            };
          }
          if (row.endlatitude && row.endlongitude) {
            geocoded.endCoordinates = {
              latitude: row.endlatitude,
              longitude: row.endlongitude,
            };
          }

          // Include vehicle/trip identification
          if (row.vehicleid) geocoded.vehicleid = row.vehicleid;
          if (row.registrationnumber)
            geocoded.registrationnumber = row.registrationnumber;
          if (row.tripid) geocoded.tripid = row.tripid;

          return geocoded;
        })
        .filter((item) => Object.keys(item).length > 0);

      console.log("Geocoded data prepared for frontend:", geocodedData);
    }

    // Step 7: Interpret results with full context
    const interpretation = await interpretResults(
      prompt,
      processedResults,
      sqlQuery,
      relevantTable,
      tableContent
    );
    console.log("Final interpretation:", interpretation);

    // Send response with geocoded data if available
    const response = {
      response: interpretation,
      query: sqlQuery,
      relevantTable: relevantTable,
      rawResults: queryResult.rows,
    };

    // Include geocoded data in response if it's a location query
    if (isLocationQuery && geocodedData && geocodedData.length > 0) {
      response.geocodedData = geocodedData;
      response.isLocationQuery = true;
    }

    res.json(response);
  } catch (err) {
    console.error("Error processing prompt:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

//api call to get driver cost
app.get("/api/driver_cost", async (req, res) => {
  try {
    // console.log("here");
    const query = `SELECT d.name ,(t.distancetravelled*d.earningperkm) AS total_earning
FROM drivers d
JOIN trips t ON d.driverid=t.driverid
WHERE t.userid=$1
                     `;

    const result = await con.query(query, [userid]);
    //  console.log(result.rows);
    res.json(result.rows);
  } catch (error) {
    console.error({ error: "Error getting data record" });
    res.status(400).json({ error: "Error getting data record" });
  }
});

//api to get month revenue
app.get("/api/month_revenue", async (req, res) => {
  try {
    const query1 = `
      WITH months AS (
          -- List all 12 months
          SELECT generate_series(1, 12) AS month_number
      ),
      revenue_data AS (
          SELECT 
              EXTRACT(MONTH FROM t.StartTime) AS month_number,  -- Extract the month number from StartTime
              SUM(t.revenue) AS total_revenue  -- Directly sum revenue from Trips table
          FROM 
              Trips t
          WHERE 
              t.TripStatus = 'Scheduled'  -- Only consider scheduled trips
              AND t.userid = $1  -- Filter by specific user ID
          GROUP BY 
              EXTRACT(MONTH FROM t.StartTime)  -- Group by month number
      )
      SELECT 
          TO_CHAR(TO_DATE(m.month_number::TEXT, 'MM'), 'FMMonth') AS month_name,  -- Converts month number to month name
          COALESCE(r.total_revenue, 0) AS total_revenue  -- If no revenue, show 0
      FROM 
          months m
      LEFT JOIN 
          revenue_data r ON m.month_number = r.month_number  -- Left join to include all months, even with 0 revenue
      ORDER BY 
          m.month_number;  -- Sort by month number
    `;

    const result = await con.query(query1, [userid]);
    res.json(result.rows);
  } catch (error) {
    console.error({ error: "Error in getting record", details: error.message });
    res.status(500).json({ error: "Error in getting record" });
  }
});
//api to get month cost
app.get("/api/month_cost", async (req, res) => {
  try {
    const petrolprice = 102;
    const dieselprice = 75;

    const query1 = `
    WITH months AS (
        -- List all 12 months
        SELECT generate_series(1, 12) AS month_number
    ),
    maintenance_data AS (
        SELECT 
            EXTRACT(MONTH FROM m.maintenancedate) AS month_number,
            CAST(SUM(m.cost) AS NUMERIC(15,2)) AS total_maintenance_cost  
        FROM 
            MaintenanceRecords m
        WHERE 
            m.userid = $1  -- Use $1 for user ID
        GROUP BY 
            EXTRACT(MONTH FROM m.maintenancedate)  
    ),
    trip_fuel_cost AS (
        SELECT
            EXTRACT(MONTH FROM t.starttime) AS month_number,
            CAST(SUM(
                (t.distancetravelled / NULLIF(v.idealmileage, 1)) * 
                CASE 
                    WHEN v.fueltype = 'Petrol' THEN $2  -- Use $2 for petrol price
                    WHEN v.fueltype = 'Diesel' THEN $3  -- Use $3 for diesel price
                    ELSE 0
                END
            ) AS NUMERIC(15,2)) AS total_fuel_cost  
        FROM 
            Trips t
        JOIN 
            Vehicles v ON t.vehicleid = v.vehicleid
        WHERE 
            t.userid = $1  -- Use $1 for user ID
        GROUP BY 
            EXTRACT(MONTH FROM t.starttime)  
    ),
    driver_earnings AS (
        SELECT
            EXTRACT(MONTH FROM t.starttime) AS month_number,
            CAST(SUM(t.distancetravelled * d.earningperkm) AS NUMERIC(15,2)) AS total_driver_earnings  
        FROM 
            Trips t
        JOIN 
            Drivers d ON t.driverid = d.driverid
        WHERE 
            t.userid = $1  -- Use $1 for user ID
        GROUP BY 
            EXTRACT(MONTH FROM t.starttime)  
    )
    SELECT 
        TO_CHAR(TO_DATE(m.month_number::TEXT, 'MM'), 'FMMonth') AS month_name,  
        CAST(
            COALESCE(maintenance_data.total_maintenance_cost, 0) + 
            COALESCE(trip_fuel_cost.total_fuel_cost, 0) + 
            COALESCE(driver_earnings.total_driver_earnings, 0) 
            AS INTEGER
        ) AS total_cost  
    FROM 
        months m
    LEFT JOIN 
        maintenance_data ON m.month_number = maintenance_data.month_number  
    LEFT JOIN 
        trip_fuel_cost ON m.month_number = trip_fuel_cost.month_number  
    LEFT JOIN 
        driver_earnings ON m.month_number = driver_earnings.month_number  
    ORDER BY 
        m.month_number;  
    `;

    const result = await con.query(query1, [userid, petrolprice, dieselprice]);
    res.json(result.rows); // Return the result in the same month-wise format
  } catch (error) {
    console.error({ error: "Error in getting month-wise cost" });
    res.status(500).json({ error: "Error in getting month-wise cost" });
  }
});
//api call to get maintenance cost of vehicles
app.get("/api/vehicle_maintenance_cost", async (req, res) => {
  try {
    const query1 = `
     SELECT v.registrationnumber,SUM(m.cost)
FROM maintenancerecords m
JOIN vehicles v ON v.vehicleid=m.vehicleid
where v.userid=$1
GROUP BY v.registrationnumber
    `;

    const result = await con.query(query1, [userid]);
    res.json(result.rows); // Return the result in the same month-wise format
  } catch (error) {
    console.error({ error: "Error in getting month-wise cost" });
    res.status(500).json({ error: "Error in getting month-wise cost" });
  }
});

// EV Range Prediction endpoint
app.post("/api/ev/predict-range", async (req, res) => {
  try {
    const response = await axios.post(
      "http://localhost:5001/api/ev/predict-range",
      req.body
    );
    res.json(response.data);
  } catch (error) {
    console.error("Error calling EV range prediction service:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get EV range prediction",
    });
  }
});

// Test endpoint to verify geocoding integration
app.post("/api/test-geocoding", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    console.log("Testing geocoding with prompt:", prompt);

    // Simulate a location query result
    const mockResults = [
      {
        vehicleid: 1,
        registrationnumber: "AD-1200",
        latitude: 12.975802,
        longitude: 77.587152,
        make: "Tesla",
      },
    ];

    // Test the location processing
    const processedResults = await processLocationData(mockResults);

    // Test the interpretation
    const interpretation = await interpretResults(
      prompt,
      processedResults,
      "SELECT * FROM vehicles WHERE vehicleid = 1",
      "vehicles",
      "mock content"
    );

    res.json({
      originalPrompt: prompt,
      originalResults: mockResults,
      processedResults: processedResults,
      finalResponse: interpretation,
      geocodingWorked: processedResults[0].address ? true : false,
    });
  } catch (error) {
    console.error("Error in geocoding test:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Standalone API endpoint to test reverse geocoding
app.get("/api/geocode/:latitude/:longitude", async (req, res) => {
  try {
    const { latitude, longitude } = req.params;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const lat = parseFloat(latitude);
    const lon = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).json({ error: "Invalid latitude or longitude" });
    }

    const address = await reverseGeocode(lat, lon);

    if (address) {
      res.json({
        latitude: lat,
        longitude: lon,
        address: address,
        cached: geocodingCache.has(`${lat.toFixed(6)},${lon.toFixed(6)}`),
      });
    } else {
      res
        .status(404)
        .json({ error: "Could not find address for these coordinates" });
    }
  } catch (error) {
    console.error("Error in geocoding endpoint:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get available vehicles for pre-booking (excluding those already in queue)
app.get("/api/available-vehicles", async (req, res) => {
  try {
    const { locationid } = req.query;

    if (!locationid) {
      return res.status(400).json({ error: "Location ID is required" });
    }

    // Check if the location queue is full
    const queueCountQuery = `
            SELECT COUNT(*) as queue_count 
            FROM prebookings 
            WHERE locationid = $1 AND status IN ('pending', 'locked')
        `;

    const queueCountResult = await con.query(queueCountQuery, [locationid]);
    const currentQueueCount = parseInt(queueCountResult.rows[0].queue_count);
    const maxCapacity = 5;

    // If queue is full, return empty array with queue status
    if (currentQueueCount >= maxCapacity) {
      return res.json({
        availableVehicles: [],
        queueStatus: {
          isFull: true,
          currentCount: currentQueueCount,
          maxCapacity: maxCapacity,
          message: "This charging location is at maximum capacity",
        },
      });
    }

    // Get all electric vehicles for the user
    const vehiclesQuery = `
            SELECT vehicleid, registrationnumber, make, fueltype, latitude, longitude
            FROM vehicles 
            WHERE userid = $1 AND fueltype = 'Electric'
        `;

    const vehiclesResult = await con.query(vehiclesQuery, [userid]);

    // Get vehicles that are already in any queue (pending or locked status)
    const queuedVehiclesQuery = `
            SELECT DISTINCT vehicleid 
            FROM prebookings 
            WHERE userid = $1 AND status IN ('pending', 'locked')
        `;

    const queuedVehiclesResult = await con.query(queuedVehiclesQuery, [userid]);
    const queuedVehicleIds = queuedVehiclesResult.rows.map(
      (row) => row.vehicleid
    );

    // Filter out vehicles that are already in queue
    const availableVehicles = vehiclesResult.rows.filter(
      (vehicle) => !queuedVehicleIds.includes(vehicle.vehicleid)
    );

    res.json({
      availableVehicles: availableVehicles,
      queueStatus: {
        isFull: false,
        currentCount: currentQueueCount,
        maxCapacity: maxCapacity,
        remainingSlots: maxCapacity - currentQueueCount,
      },
    });
  } catch (error) {
    console.error("Error fetching available vehicles:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Pre-booking API endpoints
// Create a new pre-booking request
app.post("/api/prebook", async (req, res) => {
  try {
    const { vehicleid, locationid, latitude, longitude, currentcharge } =
      req.body;

    if (
      !vehicleid ||
      !locationid ||
      !latitude ||
      !longitude ||
      currentcharge === undefined
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if vehicle is already in queue
    const existingBookingQuery = `
            SELECT id FROM prebookings 
            WHERE userid = $1 AND vehicleid = $2 AND status IN ('pending', 'locked')
        `;

    const existingBookingResult = await con.query(existingBookingQuery, [
      userid,
      vehicleid,
    ]);

    if (existingBookingResult.rows.length > 0) {
      return res.status(409).json({
        error:
          "This vehicle is already in a pre-booking queue. Please wait for the current booking to complete or mark it as arrived.",
      });
    }

    // Check if the location queue is full (maximum 5 vehicles)
    const queueCountQuery = `
            SELECT COUNT(*) as queue_count 
            FROM prebookings 
            WHERE locationid = $1 AND status IN ('pending', 'locked')
        `;

    const queueCountResult = await con.query(queueCountQuery, [locationid]);
    const currentQueueCount = parseInt(queueCountResult.rows[0].queue_count);

    if (currentQueueCount >= 5) {
      return res.status(429).json({
        error:
          "This charging location is currently at maximum capacity (5 vehicles in queue). Please try again later or choose a different location.",
        queueCount: currentQueueCount,
        maxCapacity: 5,
      });
    }

    // Get vehicle location to calculate distance
    const vehicleQuery =
      "SELECT latitude, longitude FROM vehicles WHERE vehicleid = $1 AND userid = $2";
    const vehicleResult = await con.query(vehicleQuery, [vehicleid, userid]);

    if (vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }

    const vehicle = vehicleResult.rows[0];

    // Calculate distance between vehicle and charging station (Haversine formula)
    const R = 6371; // Earth's radius in km
    const lat1 = (vehicle.latitude * Math.PI) / 180;
    const lat2 = (latitude * Math.PI) / 180;
    const deltaLat = ((latitude - vehicle.latitude) * Math.PI) / 180;
    const deltaLon = ((longitude - vehicle.longitude) * Math.PI) / 180;

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) *
        Math.cos(lat2) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    // Estimate ETA based on distance (assuming average speed of 30 km/h in city)
    const averageSpeed = 30; // km/h
    const etaMinutes = (distance / averageSpeed) * 60;

    // Check if vehicle can reach within 4 minutes
    if (etaMinutes > 4) {
      return res.status(400).json({
        error: "Vehicle cannot reach the charging station within 4 minutes",
        eta: etaMinutes,
        distance: distance,
      });
    }

    // Insert the pre-booking
    const insertQuery = `
            INSERT INTO prebookings (userid, vehicleid, locationid, latitude, longitude, currentcharge, eta_minutes, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
            RETURNING id
        `;

    const insertResult = await con.query(insertQuery, [
      userid,
      vehicleid,
      locationid,
      latitude,
      longitude,
      currentcharge,
      etaMinutes,
    ]);

    const bookingId = insertResult.rows[0].id;

    // Process the booking queue and assign lock
    await processBookingQueue(locationid);

    res.status(201).json({
      message: "Pre-booking created successfully",
      bookingId: bookingId,
      eta: etaMinutes,
      distance: distance,
    });
  } catch (error) {
    console.error("Error creating pre-booking:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all pre-bookings for a location
app.get("/api/prebookings", async (req, res) => {
  try {
    const { locationid } = req.query;

    if (!locationid) {
      return res.status(400).json({ error: "Location ID is required" });
    }

    const query = `
            SELECT p.*, v.registrationnumber, v.make
            FROM prebookings p
            JOIN vehicles v ON p.vehicleid = v.vehicleid
            WHERE p.locationid = $1
            ORDER BY p.eta_minutes ASC, p.createdat ASC
        `;

    const result = await con.query(query, [locationid]);

    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching pre-bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Mark vehicle as arrived (release lock)
app.post("/api/prebook/:id/arrived", async (req, res) => {
  try {
    const { id } = req.params;

    // Update booking status to arrived
    const updateQuery = `
            UPDATE prebookings 
            SET status = 'arrived', lockexpiresat = NULL
            WHERE id = $1 AND userid = $2
        `;

    const result = await con.query(updateQuery, [id, userid]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Get the location ID to process the queue
    const locationQuery = "SELECT locationid FROM prebookings WHERE id = $1";
    const locationResult = await con.query(locationQuery, [id]);
    const locationid = locationResult.rows[0].locationid;

    // Process the booking queue to assign lock to next vehicle
    await processBookingQueue(locationid);

    res.json({ message: "Vehicle marked as arrived" });
  } catch (error) {
    console.error("Error marking vehicle as arrived:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Function to calculate priority score for a booking
function calculatePriorityScore(booking) {
  const { eta_minutes, currentcharge, createdat } = booking;

  // Base score starts at 100
  let score = 100;

  // 1. ETA Factor (40% weight) - Lower ETA = Higher priority
  // ETA of 0-1 min gets max points, 3-4 min gets min points
  const etaScore = Math.max(0, 40 - eta_minutes * 10);
  score += etaScore;

  // 2. Charge Level Factor (35% weight) - Lower charge = Higher priority
  // Charge below 20% gets max priority, above 80% gets min priority
  let chargeScore = 0;
  if (currentcharge <= 20) {
    chargeScore = 35; // Critical battery - highest priority
  } else if (currentcharge <= 40) {
    chargeScore = 25; // Low battery - high priority
  } else if (currentcharge <= 60) {
    chargeScore = 15; // Medium battery - medium priority
  } else if (currentcharge <= 80) {
    chargeScore = 5; // Good battery - low priority
  } else {
    chargeScore = 0; // Full battery - lowest priority
  }
  score += chargeScore;

  // 3. Urgency Factor (15% weight) - Based on how long they've been waiting
  const now = new Date();
  const createdTime = new Date(createdat);
  const waitTimeMinutes = (now - createdTime) / (1000 * 60);

  // Waiting more than 10 minutes gets max urgency points
  const urgencyScore = Math.min(15, waitTimeMinutes * 1.5);
  score += urgencyScore;

  // 4. Emergency Factor (10% weight) - Critical situations
  let emergencyScore = 0;

  // If ETA > 3 minutes but charge < 15%, this is an emergency
  if (eta_minutes > 3 && currentcharge < 15) {
    emergencyScore = 10;
  }
  // If charge < 10%, always emergency
  else if (currentcharge < 10) {
    emergencyScore = 10;
  }
  // If ETA < 1 minute and charge < 30%, high urgency
  else if (eta_minutes < 1 && currentcharge < 30) {
    emergencyScore = 8;
  }

  score += emergencyScore;

  return Math.round(score);
}

// Function to process booking queue and assign locks with smart priority
async function processBookingQueue(locationid) {
  try {
    // Get all pending bookings for this location
    const queueQuery = `
            SELECT * FROM prebookings 
            WHERE locationid = $1 AND status = 'pending'
        `;

    const queueResult = await con.query(queueQuery, [locationid]);

    if (queueResult.rows.length === 0) {
      return;
    }

    // Clear any expired locks
    const clearExpiredQuery = `
            UPDATE prebookings 
            SET status = 'expired', lockexpiresat = NULL
            WHERE locationid = $1 AND status = 'locked' AND lockexpiresat < NOW()
        `;

    await con.query(clearExpiredQuery, [locationid]);

    // Check if there's already an active lock
    const activeLockQuery = `
            SELECT * FROM prebookings 
            WHERE locationid = $1 AND status = 'locked' AND lockexpiresat > NOW()
        `;

    const activeLockResult = await con.query(activeLockQuery, [locationid]);

    if (activeLockResult.rows.length === 0 && queueResult.rows.length > 0) {
      // Calculate priority scores for all bookings
      const bookingsWithScores = queueResult.rows.map((booking) => ({
        ...booking,
        priorityScore: calculatePriorityScore(booking),
      }));

      // Sort by priority score (highest first), then by creation time (earliest first)
      bookingsWithScores.sort((a, b) => {
        if (b.priorityScore !== a.priorityScore) {
          return b.priorityScore - a.priorityScore;
        }
        return new Date(a.createdat) - new Date(b.createdat);
      });

      // Get the highest priority booking
      const nextBooking = bookingsWithScores[0];

      console.log(
        `Assigning lock to booking ${nextBooking.id} with priority score ${nextBooking.priorityScore}`
      );
      console.log(
        `ETA: ${nextBooking.eta_minutes}min, Charge: ${
          nextBooking.currentcharge
        }%, Wait time: ${(
          (new Date() - new Date(nextBooking.createdat)) /
          (1000 * 60)
        ).toFixed(1)}min`
      );

      const lockExpiresAt = new Date(Date.now() + 4 * 60 * 1000); // 4 minutes from now

      const assignLockQuery = `
                UPDATE prebookings 
                SET status = 'locked', lockexpiresat = $1
                WHERE id = $2
            `;

      await con.query(assignLockQuery, [lockExpiresAt, nextBooking.id]);
    }
  } catch (error) {
    console.error("Error processing booking queue:", error);
  }
}

// Background job to check for expired locks (runs every minute)
setInterval(async () => {
  try {
    // Get all locations with expired locks
    const expiredQuery = `
            SELECT DISTINCT locationid 
            FROM prebookings 
            WHERE status = 'locked' AND lockexpiresat < NOW()
        `;

    const expiredResult = await con.query(expiredQuery);

    // Process queue for each location with expired locks
    for (const row of expiredResult.rows) {
      await processBookingQueue(row.locationid);
    }
  } catch (error) {
    console.error("Error in background lock processing:", error);
  }
}, 60000); // Run every minute

// Get user's pre-bookings
app.get("/api/my-prebookings", async (req, res) => {
  try {
    const query = `
            SELECT p.*, v.registrationnumber, v.make
            FROM prebookings p
            JOIN vehicles v ON p.vehicleid = v.vehicleid
            WHERE p.userid = $1
            ORDER BY p.createdat DESC
        `;

    const result = await con.query(query, [userid]);

    // Convert eta_minutes to number for each booking
    const bookings = result.rows.map((booking) => ({
      ...booking,
      eta_minutes: parseFloat(booking.eta_minutes) || 0,
    }));

    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user pre-bookings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get queue with priority scores for a location (for debugging/transparency)
app.get("/api/queue/:locationid", async (req, res) => {
  try {
    const { locationid } = req.params;

    const query = `
            SELECT p.*, v.registrationnumber, v.make
            FROM prebookings p
            JOIN vehicles v ON p.vehicleid = v.vehicleid
            WHERE p.locationid = $1 AND p.status = 'pending'
            ORDER BY p.createdat ASC
        `;

    const result = await con.query(query, [locationid]);

    // Calculate priority scores for each booking
    const queueWithScores = result.rows.map((booking) => ({
      ...booking,
      eta_minutes: parseFloat(booking.eta_minutes) || 0,
      priorityScore: calculatePriorityScore(booking),
      waitTimeMinutes: (
        (new Date() - new Date(booking.createdat)) /
        (1000 * 60)
      ).toFixed(1),
    }));

    // Sort by priority score (highest first)
    queueWithScores.sort((a, b) => b.priorityScore - a.priorityScore);

    const maxCapacity = 5;
    const currentCount = queueWithScores.length;

    res.json({
      locationid,
      queue: queueWithScores,
      totalInQueue: currentCount,
      queueStatus: {
        isFull: currentCount >= maxCapacity,
        currentCount: currentCount,
        maxCapacity: maxCapacity,
        remainingSlots: Math.max(0, maxCapacity - currentCount),
        utilizationPercentage: Math.round((currentCount / maxCapacity) * 100),
      },
    });
  } catch (error) {
    console.error("Error fetching queue:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get queue status for a location
app.get("/api/queue-status/:locationid", async (req, res) => {
  try {
    const { locationid } = req.params;

    // Get current queue count
    const queueCountQuery = `
            SELECT COUNT(*) as queue_count 
            FROM prebookings 
            WHERE locationid = $1 AND status IN ('pending', 'locked')
        `;

    const queueCountResult = await con.query(queueCountQuery, [locationid]);
    const currentCount = parseInt(queueCountResult.rows[0].queue_count);
    const maxCapacity = 5;

    // Get estimated wait time for new bookings
    const waitTimeQuery = `
            SELECT AVG(eta_minutes) as avg_eta, 
                   MAX(eta_minutes) as max_eta,
                   COUNT(*) as queue_size
            FROM prebookings 
            WHERE locationid = $1 AND status = 'pending'
        `;

    const waitTimeResult = await con.query(waitTimeQuery, [locationid]);
    const avgEta = waitTimeResult.rows[0].avg_eta || 0;
    const maxEta = waitTimeResult.rows[0].max_eta || 0;

    res.json({
      locationid,
      queueStatus: {
        isFull: currentCount >= maxCapacity,
        currentCount: currentCount,
        maxCapacity: maxCapacity,
        remainingSlots: Math.max(0, maxCapacity - currentCount),
        utilizationPercentage: Math.round((currentCount / maxCapacity) * 100),
        estimatedWaitTime: {
          average: Math.round(avgEta),
          maximum: Math.round(maxEta),
        },
        status:
          currentCount >= maxCapacity
            ? "FULL"
            : currentCount >= 4
            ? "HIGH"
            : currentCount >= 2
            ? "MEDIUM"
            : "LOW",
      },
    });
  } catch (error) {
    console.error("Error fetching queue status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoint for updating vehicle information
app.put("/api/update_vehicle/:vehicleid", async (req, res) => {
  try {
    const { vehicleid } = req.params;
    const {
      registrationnumber,
      make,
      latitude,
      longitude,
      fueltype,
      idealmileage,
    } = req.body;

    // Validate required fields
    if (
      !registrationnumber ||
      !make ||
      !fueltype ||
      !idealmileage ||
      !latitude ||
      !longitude
    ) {
      return res.status(400).json({
        error:
          "Required fields are missing: registrationnumber, make, fueltype, idealmileage, latitude, longitude",
      });
    }

    // Validate fueltype
    const validFuelTypes = ["Petrol", "Diesel", "Electric"];
    if (!validFuelTypes.includes(fueltype)) {
      return res.status(400).json({ error: "Invalid fuel type" });
    }

    // Update vehicle in the database
    const query = `
      UPDATE Vehicles 
      SET registrationnumber = $1, make = $2, fueltype = $3, idealmileage = $4, latitude = $5, longitude = $6
      WHERE vehicleid = $7 AND userid = $8
      RETURNING vehicleid;
    `;

    const values = [
      registrationnumber,
      make,
      fueltype,
      idealmileage,
      latitude,
      longitude,
      vehicleid,
      userid,
    ];

    const result = await con.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Vehicle not found or unauthorized" });
    }

    res.json({
      message: "Vehicle updated successfully",
      vehicleid: result.rows[0].vehicleid,
    });
  } catch (err) {
    console.error("Error updating vehicle:", err);

    // Handle unique constraint violation for registrationnumber
    if (err.code === "23505") {
      return res.status(409).json({
        error: "Registration number already exists",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoint for updating driver information
app.put("/api/update_driver/:driverid", async (req, res) => {
  try {
    const { driverid } = req.params;
    const { name, earningperkm, licensenumber, phonenumber } = req.body;

    // Validate required fields
    if (!name || !licensenumber || !phonenumber) {
      return res.status(400).json({
        error: "Required fields are missing: name, licensenumber, phonenumber",
      });
    }

    // Validate the format of the license number
    if (licensenumber.length > 50) {
      return res
        .status(400)
        .json({ error: "License number exceeds maximum length" });
    }

    // Validate that earning per km, if provided, is a positive number
    if (earningperkm !== undefined && earningperkm < 0) {
      return res
        .status(400)
        .json({ error: "Earning per km must be a positive value" });
    }

    // Update driver in the database
    const query = `
      UPDATE Drivers 
      SET name = $1, earningperkm = $2, LicenseNumber = $3, PhoneNumber = $4
      WHERE driverid = $5 AND userid = $6
      RETURNING driverid;
    `;

    const values = [
      name,
      earningperkm,
      licensenumber,
      phonenumber,
      driverid,
      userid,
    ];

    const result = await con.query(query, values);

    if (result.rows.length === 0) {
      return res
        .status(404)
        .json({ error: "Driver not found or unauthorized" });
    }

    res.json({
      message: "Driver updated successfully",
      driverid: result.rows[0].driverid,
    });
  } catch (err) {
    console.error("Error updating driver:", err);

    // Handle unique constraint violation for licensenumber
    if (err.code === "23505") {
      return res.status(409).json({
        error: "License number already exists",
      });
    }

    res.status(500).json({ error: "Internal server error" });
  }
});

// API endpoint for updating trip information
app.put("/api/update_trip/:tripid", async (req, res) => {
  try {
    const { tripid } = req.params;
    const {
      starttime,
      endtime,
      startlatitude1,
      startlongitude1,
      endlatitude1,
      endlongitude1,
      distancetravalled1,
      revenue,
    } = req.body;

    // Parse numeric and integer values
    const startlatitude = parseFloat(startlatitude1);
    const startlongitude = parseFloat(startlongitude1);
    const endlatitude = parseFloat(endlatitude1);
    const endlongitude = parseFloat(endlongitude1);
    const distancetravelled = parseFloat(distancetravalled1);
    const reveneue = parseInt(revenue);

    // Validate required fields
    if (
      !startlatitude ||
      !startlongitude ||
      !endlatitude ||
      !endlongitude ||
      !starttime ||
      !revenue
    ) {
      return res
        .status(400)
        .json({ error: "Please fill all required fields properly." });
    }

    // Update trip in the database
    const query = `
      UPDATE Trips 
      SET startlatitude = $1, startlongitude = $2, endlatitude = $3, endlongitude = $4,
          starttime = $5, endtime = $6, distancetravelled = $7, revenue = $8
      WHERE tripid = $9 AND userid = $10
      RETURNING tripid;
    `;

    const values = [
      startlatitude,
      startlongitude,
      endlatitude,
      endlongitude,
      starttime,
      endtime,
      distancetravelled,
      reveneue,
      tripid,
      userid,
    ];

    const result = await con.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trip not found or unauthorized" });
    }

    res.json({
      message: "Trip updated successfully",
      tripid: result.rows[0].tripid,
    });
  } catch (err) {
    console.error("Error updating trip:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

const server = app
  .listen(port, () => {
    console.log(`Server is listening on port ${port}`);
  })
  .on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `Port ${port} is already in use. Please try the following:`
      );
      console.error("1. Close any other applications using this port");
      console.error("2. Kill the process using this port with:");
      console.error(`   Windows: netstat -ano | findstr :${port}`);
      console.error(`   Then: taskkill /F /PID <PID>`);
      console.error("3. Or use a different port by changing the port variable");
      process.exit(1);
    } else {
      console.error("Error starting server:", err);
      process.exit(1);
    }
  });

// User profile endpoint
app.get("/api/user/profile", async (req, res) => {
  try {
    // For now, we'll use the global userid variable
    // In a real app, you'd get this from a session/token
    if (!userid) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const query =
      "SELECT userid, name, email, phonenumber FROM users WHERE userid = $1";
    const result = await con.query(query, [userid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      userid: user.userid,
      name: user.name,
      email: user.email,
      phonenumber: user.phonenumber,
      role: "Fleet Manager", // Default role since it's not in the database
      company: "DriveWise Fleet Solutions", // Default company
      location: "New York, NY", // Default location
      joinDate: "January 2024", // Default join date
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user profile endpoint
app.put("/api/user/profile", async (req, res) => {
  try {
    if (!userid) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const { name, email, phonenumber } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const emailCheckQuery =
        "SELECT userid FROM users WHERE email = $1 AND userid != $2";
      const emailCheck = await con.query(emailCheckQuery, [email, userid]);
      if (emailCheck.rows.length > 0) {
        return res.status(409).json({ error: "Email already in use" });
      }
    }

    const query =
      "UPDATE users SET name = $1, email = $2, phonenumber = $3 WHERE userid = $4 RETURNING userid, name, email, phonenumber";
    const result = await con.query(query, [name, email, phonenumber, userid]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      userid: user.userid,
      name: user.name,
      email: user.email,
      phonenumber: user.phonenumber,
      role: "Fleet Manager",
      company: "DriveWise Fleet Solutions",
      location: "New York, NY",
      joinDate: "January 2024",
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Set vehicle status to Inactive
app.put("/api/vehicle/:vehicleid/set_inactive", async (req, res) => {
  try {
    const { vehicleid } = req.params;
    const updateQuery = `UPDATE vehicles SET status = 'Inactive' WHERE vehicleid = $1 RETURNING *`;
    const result = await con.query(updateQuery, [vehicleid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json({
      message: "Vehicle status set to Inactive",
      vehicle: result.rows[0],
    });
  } catch (error) {
    console.error("Error setting vehicle to inactive:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Set vehicle status to Active
app.put("/api/vehicle/:vehicleid/set_active", async (req, res) => {
  try {
    const { vehicleid } = req.params;
    const updateQuery = `UPDATE vehicles SET status = 'Active' WHERE vehicleid = $1 RETURNING *`;
    const result = await con.query(updateQuery, [vehicleid]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Vehicle not found" });
    }
    res.json({
      message: "Vehicle status set to Active",
      vehicle: result.rows[0],
    });
  } catch (error) {
    console.error("Error setting vehicle to active:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Place this after all API routes, before server listen
const buildPath = path.join(__dirname, "build");
app.use(express.static(buildPath));

// Catch-all route: serve React's index.html for any non-API route
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

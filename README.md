# Fleetio - Fleet Management System

Fleetio is a comprehensive fleet management solution that helps businesses efficiently manage their vehicles, drivers, and maintenance operations. The system provides real-time monitoring, predictive maintenance, and automated driver assignments to optimize fleet operations.

## Features

- **Dashboard Analytics**: Real-time monitoring of fleet performance metrics
- **Driver Management**: Track and manage driver assignments, status, and performance
- **Vehicle Management**: Monitor vehicle status, maintenance schedules, and location
- **Predictive Maintenance**: AI-powered maintenance predictions to prevent breakdowns
- **Trip Management**: Plan and track trips with route optimization
- **Maintenance Records**: Keep detailed maintenance history for each vehicle

## Tech Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion (for animations)
- Leaflet (for maps)
- Axios (for API calls)

### Backend
- Node.js with Express
- PostgreSQL Database
- Python Flask (for ML predictions)
- Groq API Integration
- bcrypt (for password hashing)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- Python 3.8+
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone [repository-url]
```

2. Install frontend dependencies
```bash
cd src
npm install
```

3. Install backend dependencies
```bash
cd Backend
npm install
pip install -r requirements.txt
```

4. Set up environment variables
Create a `.env` file in the Backend directory with:
```
POSTGRES_PASS=your_password
POSTGRES_PORT=5000
POSTGRES_NAME=fleet
GROQ_API_KEY=your_groq_api_key
```

5. Initialize the database
```bash
cd Backend
node server.js
```
Visit `http://localhost:4000/initialise_table` to create database tables

### Running the Application

1. Start the Node.js backend
```bash
cd Backend
node server.js
```

2. Start the Python ML server
```bash
cd Backend
python predictivemaintenance.py
```

3. Start the React frontend
```bash
cd src
npm start
```

The application will be available at `http://localhost:3000`

## Key Features

### Vehicle Management
- Add and track vehicles
- Monitor vehicle status (Active/Inactive/Under Maintenance)
- Track vehicle location
- Manage maintenance schedules

### Driver Management
- Register and manage drivers
- Track driver availability
- Monitor driver performance
- Manage driver assignments

### Trip Management
- Plan and schedule trips
- Track trip status
- Calculate trip distances
- Monitor trip completion

### Predictive Maintenance
- AI-powered maintenance predictions
- Cost tracking
- Maintenance history
- Automated maintenance scheduling

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments

- Thanks to all contributors who have helped shape Fleetio
- Special thanks to the open-source community for the tools and libraries used in this project

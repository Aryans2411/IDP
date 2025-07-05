# Enhanced Geocoding Integration with processPrompt API

## Overview
The `/api/processPrompt` endpoint now automatically detects location queries, performs geocoding, and returns both the AI response and structured geocoded data to the frontend.

## How It Works

### 1. Automatic Location Detection
The API automatically detects location-related queries by checking for keywords:
- `location`
- `where`
- `address`
- `place`
- `coordinates`
- `latitude`
- `longitude`

### 2. Enhanced Response Structure
When a location query is detected, the response includes additional fields:

```json
{
  "response": "Your vehicle AD-1200 is located at 123 Main Street, Indiranagar, Bangalore",
  "query": "SELECT * FROM vehicles WHERE vehicleid = 1",
  "relevantTable": "vehicles",
  "rawResults": [...],
  "isLocationQuery": true,
  "geocodedData": [
    {
      "vehicleid": 1,
      "registrationnumber": "AD-1200",
      "address": "123 Main Street, Indiranagar, Bangalore, Karnataka, India",
      "coordinates": {
        "latitude": 12.975802,
        "longitude": 77.587152
      }
    }
  ]
}
```

## Frontend Usage

### Basic Usage
```javascript
// Send location query
const response = await fetch('/api/processPrompt', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "Where is my vehicle located?"
  })
});

const data = await response.json();

// Display AI response
console.log(data.response);

// Use geocoded data if available
if (data.isLocationQuery && data.geocodedData) {
  data.geocodedData.forEach(item => {
    if (item.address) {
      console.log(`${item.registrationnumber}: ${item.address}`);
    }
  });
}
```

### Advanced Frontend Integration
```javascript
class LocationQueryHandler {
  async processLocationQuery(prompt) {
    try {
      const response = await fetch('/api/processPrompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();

      if (data.isLocationQuery && data.geocodedData) {
        return {
          aiResponse: data.response,
          locations: this.formatGeocodedData(data.geocodedData),
          hasLocationData: true
        };
      }

      return {
        aiResponse: data.response,
        locations: null,
        hasLocationData: false
      };
    } catch (error) {
      console.error('Error processing location query:', error);
      throw error;
    }
  }

  formatGeocodedData(geocodedData) {
    return geocodedData.map(item => ({
      id: item.vehicleid || item.tripid,
      type: item.vehicleid ? 'vehicle' : 'trip',
      registrationNumber: item.registrationnumber,
      address: item.address,
      startAddress: item.startaddress,
      endAddress: item.endaddress,
      coordinates: item.coordinates,
      startCoordinates: item.startCoordinates,
      endCoordinates: item.endCoordinates
    }));
  }
}
```

## Response Types

### Vehicle Location Query
**Prompt**: "Where is my vehicle located?"

**Response**:
```json
{
  "response": "Your vehicle AD-1200 is currently located at 123 Main Street, Indiranagar, Bangalore, Karnataka, India.",
  "isLocationQuery": true,
  "geocodedData": [
    {
      "vehicleid": 1,
      "registrationnumber": "AD-1200",
      "address": "123 Main Street, Indiranagar, Bangalore, Karnataka, India",
      "coordinates": {
        "latitude": 12.975802,
        "longitude": 77.587152
      }
    }
  ]
}
```

### Trip Route Query
**Prompt**: "What was the route of my last trip?"

**Response**:
```json
{
  "response": "Your last trip started at Central Park, Bangalore and ended at Malleshwaram, Bangalore.",
  "isLocationQuery": true,
  "geocodedData": [
    {
      "tripid": 1,
      "startaddress": "Central Park, Bangalore, Karnataka, India",
      "endaddress": "Malleshwaram, Bangalore, Karnataka, India",
      "startCoordinates": {
        "latitude": 12.9716,
        "longitude": 77.5946
      },
      "endCoordinates": {
        "latitude": 13.0067,
        "longitude": 77.5611
      }
    }
  ]
}
```

### Multiple Vehicles Query
**Prompt**: "Where are all my vehicles located?"

**Response**:
```json
{
  "response": "You have 3 vehicles: AD-1200 is at Indiranagar, KA-01-AB-1234 is at Koramangala, and KA-02-CD-5678 is at Whitefield.",
  "isLocationQuery": true,
  "geocodedData": [
    {
      "vehicleid": 1,
      "registrationnumber": "AD-1200",
      "address": "123 Main Street, Indiranagar, Bangalore, Karnataka, India"
    },
    {
      "vehicleid": 2,
      "registrationnumber": "KA-01-AB-1234",
      "address": "456 8th Block, Koramangala, Bangalore, Karnataka, India"
    },
    {
      "vehicleid": 3,
      "registrationnumber": "KA-02-CD-5678",
      "address": "789 ITPL Road, Whitefield, Bangalore, Karnataka, India"
    }
  ]
}
```

## Frontend Display Examples

### Map Integration
```javascript
function displayLocationsOnMap(geocodedData) {
  geocodedData.forEach(item => {
    if (item.coordinates) {
      // Add marker to map
      addMarkerToMap(item.coordinates, item.address, item.registrationNumber);
    }
  });
}
```

### Location Cards
```javascript
function createLocationCards(geocodedData) {
  return geocodedData.map(item => `
    <div class="location-card">
      <h3>${item.registrationNumber || `Trip ${item.tripid}`}</h3>
      ${item.address ? `<p><strong>Location:</strong> ${item.address}</p>` : ''}
      ${item.startAddress ? `<p><strong>Start:</strong> ${item.startAddress}</p>` : ''}
      ${item.endAddress ? `<p><strong>End:</strong> ${item.endAddress}</p>` : ''}
    </div>
  `).join('');
}
```

### Navigation Links
```javascript
function createNavigationLinks(geocodedData) {
  return geocodedData.map(item => {
    if (item.coordinates) {
      const { latitude, longitude } = item.coordinates;
      return `
        <a href="https://maps.google.com/?q=${latitude},${longitude}" 
           target="_blank" class="nav-link">
          Navigate to ${item.registrationNumber || 'this location'}
        </a>
      `;
    }
  }).join('');
}
```

## Error Handling

### Geocoding Failures
If geocoding fails, the response will still include the AI response but without geocoded data:
```json
{
  "response": "Your vehicle AD-1200 is located at coordinates 12.975802, 77.587152.",
  "isLocationQuery": true,
  "geocodedData": []
}
```

### Rate Limiting
The system includes rate limiting (1 request/second) and caching (24 hours) to handle API limits gracefully.

## Benefits

1. **Seamless Integration**: No additional API calls needed from frontend
2. **Rich Data**: Both AI response and structured location data
3. **Flexible Usage**: Frontend can use data for maps, navigation, or display
4. **Error Resilient**: Graceful fallback when geocoding fails
5. **Performance Optimized**: Caching and rate limiting included

## Testing

### Test Endpoint
Use the test endpoint to verify geocoding:
```bash
POST /api/test-geocoding
{
  "prompt": "Where is my vehicle located?"
}
```

### Example Queries
- "Where is my vehicle located?"
- "What was the route of my last trip?"
- "Show me all vehicle locations"
- "Where did my trip start and end?"

This enhanced integration provides a complete solution for location queries with both human-readable responses and structured data for frontend applications. 
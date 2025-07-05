# Location Resolution Feature

## Overview
The location resolution feature automatically converts latitude/longitude coordinates to human-readable addresses when users ask location-related questions through the `/api/processPrompt` endpoint.

## How It Works

### 1. Automatic Detection
The system automatically detects when a user is asking about location by checking for keywords:
- `location`
- `where`
- `address`
- `place`

### 2. Reverse Geocoding
When location queries are detected, the system:
1. **Identifies coordinates** in the query results
2. **Calls Nominatim API** (OpenStreetMap) to convert coordinates to addresses
3. **Adds address fields** to the results before interpretation
4. **Uses human-readable addresses** in the AI response instead of coordinates

### 3. Caching & Rate Limiting
- **24-hour cache**: Addresses are cached to avoid repeated API calls
- **Rate limiting**: 1-second delay between requests (Nominatim requirement)
- **Error handling**: Graceful fallback if geocoding fails

## Supported Location Types

### Vehicle Locations
- **Field**: `latitude`, `longitude`
- **Added Field**: `address`
- **Example**: Vehicle location becomes "123 Main Street, Bangalore, Karnataka, India"

### Trip Start/End Locations
- **Fields**: `startlatitude`, `startlongitude`, `endlatitude`, `endlongitude`
- **Added Fields**: `startaddress`, `endaddress`
- **Example**: Trip route becomes "From: Central Park, Bangalore → To: Malleshwaram, Bangalore"

### Pre-booking Locations
- **Fields**: `latitude`, `longitude` (charging station locations)
- **Added Field**: `address`
- **Example**: Charging station becomes "EV Charging Station, Koramangala, Bangalore"

## API Endpoints

### 1. Process Prompt with Location Resolution
```
POST /api/processPrompt
Body: {
    "prompt": "Where is my vehicle located?"
}
```

**Response with Location Resolution:**
```json
{
    "response": "Your vehicle KA-01-AB-1234 is currently located at 123 Main Street, Indiranagar, Bangalore, Karnataka, India.",
    "query": "SELECT * FROM vehicles WHERE userid = 'user-123'",
    "relevantTable": "vehicles",
    "rawResults": [
        {
            "vehicleid": 1,
            "registrationnumber": "KA-01-AB-1234",
            "latitude": 12.9716,
            "longitude": 77.5946,
            "address": "123 Main Street, Indiranagar, Bangalore, Karnataka, India"
        }
    ]
}
```

### 2. Test Geocoding Endpoint
```
GET /api/geocode/:latitude/:longitude
```

**Example:**
```
GET /api/geocode/12.9716/77.5946
```

**Response:**
```json
{
    "latitude": 12.9716,
    "longitude": 77.5946,
    "address": "123 Main Street, Indiranagar, Bangalore, Karnataka, India",
    "cached": false
}
```

## Example Queries

### Vehicle Location Queries
- **"Where is my vehicle located?"**
- **"What is the address of my car?"**
- **"Show me the location of all my vehicles"**

### Trip Location Queries
- **"Where did my trip start and end?"**
- **"What was the route of my last trip?"**
- **"Show me the start and end addresses of all trips"**

### Charging Station Queries
- **"Where are the charging stations I booked?"**
- **"What is the address of the charging location?"**

## Technical Implementation

### Reverse Geocoding Function
```javascript
async function reverseGeocode(latitude, longitude) {
  // Check cache first
  const cacheKey = `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  const cached = geocodingCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < GEOCODING_CACHE_TTL) {
    return cached.address;
  }
  
  // Rate limiting
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Call Nominatim API
  const response = await axios.get(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
  );
  
  // Cache result
  geocodingCache.set(cacheKey, {
    address: response.data.display_name,
    timestamp: Date.now()
  });
  
  return response.data.display_name;
}
```

### Location Processing Function
```javascript
async function processLocationData(queryResults) {
  const processedResults = [];
  
  for (const row of queryResults) {
    const processedRow = { ...row };
    
    // Process vehicle locations
    if (row.latitude && row.longitude) {
      const address = await reverseGeocode(row.latitude, row.longitude);
      if (address) processedRow.address = address;
    }
    
    // Process trip locations
    if (row.startlatitude && row.startlongitude) {
      const startAddress = await reverseGeocode(row.startlatitude, row.startlongitude);
      if (startAddress) processedRow.startaddress = startAddress;
    }
    
    if (row.endlatitude && row.endlongitude) {
      const endAddress = await reverseGeocode(row.endlatitude, row.endlongitude);
      if (endAddress) processedRow.endaddress = endAddress;
    }
    
    processedResults.push(processedRow);
  }
  
  return processedResults;
}
```

## Benefits

1. **User-Friendly**: Human-readable addresses instead of coordinates
2. **Automatic**: No manual intervention required
3. **Efficient**: Caching reduces API calls
4. **Reliable**: Graceful error handling
5. **Comprehensive**: Covers all location types in the system

## Performance Considerations

### Caching Strategy
- **Cache Duration**: 24 hours
- **Cache Key**: Rounded coordinates (6 decimal places)
- **Memory Usage**: Minimal (address strings only)

### Rate Limiting
- **Nominatim Limit**: 1 request per second
- **Implementation**: 1-second delay between requests
- **Impact**: Slight delay for first-time address lookups

### Error Handling
- **API Failures**: Graceful fallback to coordinates
- **Invalid Coordinates**: Skip geocoding
- **Network Issues**: Continue without address resolution

## Testing

### Test Coordinates
- **Bangalore**: 12.9716, 77.5946
- **Mumbai**: 19.0760, 72.8777
- **Delhi**: 28.7041, 77.1025

### Test Queries
1. **"Where is my vehicle located?"**
2. **"What was the route of my last trip?"**
3. **"Show me all charging station addresses"**

## Future Enhancements

1. **Multiple Geocoding Services**: Fallback to Google Maps API
2. **Custom Address Formatting**: Shorter, more readable addresses
3. **Batch Processing**: Process multiple coordinates in one request
4. **Offline Support**: Local address database for common locations

This feature makes the fleet management system much more user-friendly by providing human-readable locations instead of technical coordinates. 
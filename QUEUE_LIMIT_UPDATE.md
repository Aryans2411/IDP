# Pre-Booking Queue Limit Update

## Overview
The pre-booking system has been updated to prevent overcrowding at charging stations by implementing a maximum queue limit of **5 vehicles per location**.

## Key Changes

### 1. Queue Capacity Limit
- **Maximum vehicles per location**: 5 vehicles
- **Statuses counted**: `pending` and `locked` bookings
- **Prevents**: Overcrowding and excessive wait times

### 2. Enhanced API Responses

#### `/api/prebook` - Create Booking
**New Error Response (429 - Too Many Requests):**
```json
{
  "error": "This charging location is currently at maximum capacity (5 vehicles in queue). Please try again later or choose a different location.",
  "queueCount": 5,
  "maxCapacity": 5
}
```

#### `/api/available-vehicles` - Get Available Vehicles
**Updated Response Structure:**
```json
{
  "availableVehicles": [...],
  "queueStatus": {
    "isFull": false,
    "currentCount": 3,
    "maxCapacity": 5,
    "remainingSlots": 2
  }
}
```

**When Queue is Full:**
```json
{
  "availableVehicles": [],
  "queueStatus": {
    "isFull": true,
    "currentCount": 5,
    "maxCapacity": 5,
    "message": "This charging location is at maximum capacity"
  }
}
```

#### `/api/queue/:locationid` - Get Queue Details
**Enhanced Response:**
```json
{
  "locationid": "loc_123",
  "queue": [...],
  "totalInQueue": 3,
  "queueStatus": {
    "isFull": false,
    "currentCount": 3,
    "maxCapacity": 5,
    "remainingSlots": 2,
    "utilizationPercentage": 60
  }
}
```

#### `/api/queue-status/:locationid` - Get Queue Status
**New Endpoint:**
```json
{
  "locationid": "loc_123",
  "queueStatus": {
    "isFull": false,
    "currentCount": 3,
    "maxCapacity": 5,
    "remainingSlots": 2,
    "utilizationPercentage": 60,
    "estimatedWaitTime": {
      "average": 8,
      "maximum": 12
    },
    "status": "MEDIUM"
  }
}
```

## Queue Status Levels

| Status | Vehicles in Queue | Description |
|--------|------------------|-------------|
| `LOW` | 0-1 | Plenty of capacity available |
| `MEDIUM` | 2-3 | Moderate queue, reasonable wait times |
| `HIGH` | 4 | High utilization, consider alternatives |
| `FULL` | 5 | Maximum capacity reached |

## Frontend Integration

### 1. Check Queue Status Before Booking
```javascript
// Get queue status before showing booking modal
const checkQueueStatus = async (locationId) => {
  try {
    const response = await fetch(`/api/queue-status/${locationId}`);
    const data = await response.json();
    
    if (data.queueStatus.isFull) {
      alert('This location is at maximum capacity. Please try another location.');
      return false;
    }
    
    return data.queueStatus;
  } catch (error) {
    console.error('Error checking queue status:', error);
    return null;
  }
};
```

### 2. Display Queue Information
```javascript
const QueueStatusDisplay = ({ queueStatus }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'LOW': return 'text-green-400';
      case 'MEDIUM': return 'text-yellow-400';
      case 'HIGH': return 'text-orange-400';
      case 'FULL': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="queue-status">
      <div className={`status ${getStatusColor(queueStatus.status)}`}>
        {queueStatus.currentCount}/{queueStatus.maxCapacity} vehicles
      </div>
      <div className="utilization">
        {queueStatus.utilizationPercentage}% capacity
      </div>
      {queueStatus.estimatedWaitTime && (
        <div className="wait-time">
          Avg wait: {queueStatus.estimatedWaitTime.average} min
        </div>
      )}
    </div>
  );
};
```

### 3. Handle Queue Full Error
```javascript
const handlePreBooking = async (bookingData) => {
  try {
    const response = await fetch('/api/prebook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bookingData)
    });

    const data = await response.json();

    if (response.status === 429) {
      // Queue is full
      alert(data.error);
      // Show alternative locations or retry later
      return;
    }

    if (response.ok) {
      alert('Booking created successfully!');
    }
  } catch (error) {
    console.error('Error creating booking:', error);
  }
};
```

## Benefits

### 1. **Prevents Overcrowding**
- Limits queue to manageable size
- Reduces wait times for all users
- Prevents traffic congestion around charging stations

### 2. **Better User Experience**
- Clear feedback when location is full
- Suggests alternative locations
- Shows queue status and wait times

### 3. **System Efficiency**
- Prevents system overload
- Maintains quality of service
- Encourages distribution across multiple locations

### 4. **Fair Access**
- Prevents any single location from being monopolized
- Ensures all users have reasonable access
- Maintains priority system for urgent cases

## Error Handling

### Queue Full Scenarios
1. **User tries to book at full location**
   - Returns 429 status with clear message
   - Suggests alternative locations
   - Shows estimated wait time for queue to clear

2. **Background queue processing**
   - Continues to process existing bookings
   - Maintains priority system
   - Automatically assigns locks when slots become available

3. **System recovery**
   - When vehicles arrive or locks expire
   - Queue automatically processes next vehicle
   - New bookings become available

## Monitoring and Analytics

### Queue Metrics
- **Utilization percentage** per location
- **Average wait times** for each queue
- **Queue turnover rate** (how quickly vehicles move through)
- **Peak usage times** for capacity planning

### Alerts and Notifications
- **High utilization warnings** (80%+ capacity)
- **Queue full notifications** for operators
- **System health monitoring** for queue processing

This update ensures a more efficient and user-friendly charging station booking system while preventing overcrowding issues. 
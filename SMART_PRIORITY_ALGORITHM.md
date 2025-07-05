# Smart Priority Algorithm for EV Charging Pre-Booking

## Overview
The smart priority algorithm ensures that the most needy vehicles get charging spots first by considering multiple factors and assigning weighted scores.

## Priority Scoring System

### Base Score: 100 points

### 1. ETA Factor (40% weight - 40 points max)
- **Purpose**: Prioritize vehicles that can reach the station quickly
- **Scoring**: `40 - (eta_minutes * 10)`
- **Examples**:
  - ETA 0-1 min: 30-40 points
  - ETA 2 min: 20 points
  - ETA 3 min: 10 points
  - ETA 4+ min: 0 points

### 2. Charge Level Factor (35% weight - 35 points max)
- **Purpose**: Prioritize vehicles with critical battery levels
- **Scoring**:
  - Charge ≤ 20%: 35 points (Critical - highest priority)
  - Charge 21-40%: 25 points (Low battery - high priority)
  - Charge 41-60%: 15 points (Medium battery - medium priority)
  - Charge 61-80%: 5 points (Good battery - low priority)
  - Charge > 80%: 0 points (Full battery - lowest priority)

### 3. Urgency Factor (15% weight - 15 points max)
- **Purpose**: Prevent vehicles from waiting too long
- **Scoring**: `min(15, wait_time_minutes * 1.5)`
- **Examples**:
  - Waiting 5 minutes: 7.5 points
  - Waiting 10 minutes: 15 points (max)
  - Waiting 15 minutes: 15 points (capped)

### 4. Emergency Factor (10% weight - 10 points max)
- **Purpose**: Handle critical situations
- **Scoring**:
  - ETA > 3 min AND charge < 15%: 10 points (Emergency)
  - Charge < 10%: 10 points (Always emergency)
  - ETA < 1 min AND charge < 30%: 8 points (High urgency)
  - Otherwise: 0 points

## Priority Examples

### Example 1: Critical Battery Vehicle
- **Vehicle A**: 15% charge, ETA 2 minutes, waiting 5 minutes
- **Score**: 100 + 20 + 35 + 7.5 + 10 = **172.5 points**

### Example 2: Nearby Vehicle with Good Battery
- **Vehicle B**: 70% charge, ETA 1 minute, waiting 2 minutes
- **Score**: 100 + 30 + 5 + 3 + 0 = **138 points**

### Example 3: Far Vehicle with Critical Battery
- **Vehicle C**: 8% charge, ETA 3.5 minutes, waiting 8 minutes
- **Score**: 100 + 0 + 35 + 12 + 10 = **157 points**

## Algorithm Logic

```javascript
function calculatePriorityScore(booking) {
    let score = 100; // Base score
    
    // ETA Factor (40% weight)
    const etaScore = Math.max(0, 40 - (eta_minutes * 10));
    score += etaScore;
    
    // Charge Level Factor (35% weight)
    let chargeScore = 0;
    if (currentcharge <= 20) chargeScore = 35;
    else if (currentcharge <= 40) chargeScore = 25;
    else if (currentcharge <= 60) chargeScore = 15;
    else if (currentcharge <= 80) chargeScore = 5;
    score += chargeScore;
    
    // Urgency Factor (15% weight)
    const waitTimeMinutes = (now - createdat) / (1000 * 60);
    const urgencyScore = Math.min(15, waitTimeMinutes * 1.5);
    score += urgencyScore;
    
    // Emergency Factor (10% weight)
    let emergencyScore = 0;
    if (eta_minutes > 3 && currentcharge < 15) emergencyScore = 10;
    else if (currentcharge < 10) emergencyScore = 10;
    else if (eta_minutes < 1 && currentcharge < 30) emergencyScore = 8;
    score += emergencyScore;
    
    return Math.round(score);
}
```

## Queue Processing

1. **Fetch all pending bookings** for a location
2. **Calculate priority scores** for each booking
3. **Sort by priority score** (highest first)
4. **Tie-breaker**: If scores are equal, sort by creation time (earliest first)
5. **Assign lock** to the highest priority booking
6. **Set 4-minute expiry** for the lock

## Real-time Updates

- **Background job** runs every minute
- **Checks for expired locks** and processes queue
- **Logs priority decisions** for transparency
- **Updates booking status** automatically

## Frontend Display

### Priority Levels
- **Critical**: ≤ 20% charge
- **High**: 21-40% charge
- **Medium**: 41-60% charge
- **Low**: 61-80% charge
- **Very Low**: > 80% charge

### Queue Information
- **Queue position** for pending bookings
- **Priority level** with color coding
- **Real-time countdown** for active locks
- **Status updates** every 30 seconds

## Benefits

1. **Fairness**: Most needy vehicles get priority
2. **Efficiency**: Reduces waiting time for critical cases
3. **Transparency**: Users can see their priority level and queue position
4. **Flexibility**: Algorithm can be easily adjusted by changing weights
5. **Emergency Handling**: Critical situations get immediate attention

## API Endpoints

### Get Queue with Priority Scores
```
GET /api/queue/:locationid
Response: {
    locationid: string,
    queue: Array<{
        id: number,
        priorityScore: number,
        eta_minutes: number,
        currentcharge: number,
        waitTimeMinutes: string,
        registrationnumber: string,
        make: string
    }>,
    totalInQueue: number
}
```

This algorithm ensures that vehicles with the most urgent need for charging get priority access while maintaining fairness and transparency in the system. 
# Attendance API Testing Guide

## 📋 Overview
This guide will help you test the attendance functionality and verify data is being stored in the database.

## 🔧 API Endpoints

### Base URL
```
https://construct.velandev.in/api/auth/
```

### Endpoints

1. **GET All Attendance**
   - URL: `https://construct.velandev.in/api/auth/attendance/`
   - Method: GET
   - Headers: `Authorization: Bearer <token>`

2. **POST Check-In**
   - URL: `https://construct.velandev.in/api/auth/attendance/`
   - Method: POST
   - Headers: `Authorization: Bearer <token>`
   - Body:
   ```json
   {
     "project": 1,
     "check_in_time": "08:00:00",
     "latitude": 40.7128,
     "longitude": -74.0060,
     "notes": "Starting foundation work"
   }
   ```

3. **PATCH Check-Out**
   - URL: `https://construct.velandev.in/api/auth/attendance/{id}/`
   - Method: PATCH
   - Headers: `Authorization: Bearer <token>`
   - Body:
   ```json
   {
     "check_out_time": "17:00:00",
     "hours_worked": 8.5,
     "overtime_hours": 0.5
   }
   ```

## 🧪 Testing Steps

### Option 1: Using the Test Screen (Recommended)

1. **Enable Test Mode**
   - Open `App.js`
   - Change `const TESTING_MODE = false;` to `const TESTING_MODE = 'attendance';`
   - Save the file

2. **Login First**
   - You need to be logged in to get the auth token
   - Login with: username: `john_doe`, password: `secure123`

3. **Run Tests**
   - The app will show the Attendance Test screen
   - Enter a valid Project ID (e.g., 1)
   - Click "GET All Attendance" to see existing records
   - Click "POST Check-In" to create a new attendance record
   - Note the ID from the response
   - Enter that ID in the "Attendance ID" field
   - Click "PATCH Check-Out" to complete the attendance

4. **Check Results**
   - All API responses will be shown in the black console area
   - Green text = success
   - Red text = error

### Option 2: Using Postman

1. **Login to Get Token**
   ```
   POST https://construct.velandev.in/api/auth/login/
   Body: {
     "username": "john_doe",
     "password": "secure123"
   }
   ```
   - Copy the `access` token from response

2. **Get All Attendance**
   ```
   GET https://construct.velandev.in/api/auth/attendance/
   Headers: Authorization: Bearer <your_token>
   ```

3. **Create Check-In**
   ```
   POST https://construct.velandev.in/api/auth/attendance/
   Headers: Authorization: Bearer <your_token>
   Body: {
     "project": 1,
     "check_in_time": "08:00:00",
     "latitude": 40.7128,
     "longitude": -74.0060,
     "notes": "Test check-in"
   }
   ```
   - Note the `id` from response

4. **Create Check-Out**
   ```
   PATCH https://construct.velandev.in/api/auth/attendance/{id}/
   Headers: Authorization: Bearer <your_token>
   Body: {
     "check_out_time": "17:00:00",
     "hours_worked": 8.5,
     "overtime_hours": 0.5
   }
   ```

### Option 3: Using the Attendance Screen

1. **Disable Test Mode**
   - Set `TESTING_MODE = false` in App.js

2. **Add Attendance to Navigation**
   - You'll need to add AttendanceTracking screen to your navigation
   - Or access it from a dashboard

3. **Use the App**
   - Click "Check In" button
   - Later, click "Check Out" button
   - View attendance history

## 🔍 Verifying Database Storage

### Method 1: Check via API
```bash
# Get all attendance records
curl -H "Authorization: Bearer <token>" \
  https://construct.velandev.in/api/auth/attendance/
```

### Method 2: Check Backend Admin Panel
1. Go to your Django admin panel
2. Navigate to Attendance model
3. You should see records with:
   - User
   - Project
   - Check-in time
   - Check-out time (if completed)
   - Latitude/Longitude
   - Hours worked
   - Overtime hours
   - Notes

### Method 3: Check Database Directly
```sql
-- If you have database access
SELECT * FROM attendance ORDER BY check_in_time DESC LIMIT 10;
```

## 📊 Expected Data Structure

### Attendance Record
```json
{
  "id": 1,
  "user": 1,
  "project": 1,
  "check_in_time": "2024-01-15T08:00:00Z",
  "check_out_time": "2024-01-15T17:00:00Z",
  "latitude": 40.7128,
  "longitude": -74.0060,
  "hours_worked": 8.5,
  "overtime_hours": 0.5,
  "notes": "Starting foundation work",
  "created_at": "2024-01-15T08:00:00Z",
  "updated_at": "2024-01-15T17:00:00Z"
}
```

## ❗ Common Issues

### Issue 1: 401 Unauthorized
- **Cause**: Token expired or missing
- **Solution**: Login again to get a fresh token

### Issue 2: 400 Bad Request
- **Cause**: Invalid data format
- **Solution**: Check that:
  - `project` is a valid project ID (integer)
  - `check_in_time` is in HH:MM:SS format
  - `latitude` and `longitude` are numbers
  - `hours_worked` and `overtime_hours` are numbers

### Issue 3: 404 Not Found
- **Cause**: Attendance ID doesn't exist
- **Solution**: Use GET to find valid IDs first

### Issue 4: No data showing
- **Cause**: No attendance records created yet
- **Solution**: Create a check-in first using POST

## 📝 Files Created

1. **AttendanceTracking.js** - Main attendance screen with check-in/check-out
2. **AttendanceTest.js** - Test screen for API debugging
3. **Updated api.js** - Fixed attendance API methods

## 🚀 Next Steps

1. Test the API using the test screen
2. Verify data is stored in database
3. Add AttendanceTracking to your navigation
4. Test location permissions (currently using mock location)
5. Add project selector for check-in
6. Add attendance reports/analytics

## 📞 Support

If you encounter issues:
1. Check the console logs in the test screen
2. Verify your backend is running
3. Check that the attendance endpoint exists in your Django backend
4. Verify the database table exists and has proper migrations

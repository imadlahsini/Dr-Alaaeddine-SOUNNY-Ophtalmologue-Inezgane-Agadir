
# Sounny Reservations Backend

This is the backend API for the Sounny reservations system.

## Setup Instructions

1. Upload all files to your Namecheap hosting via FTP
2. Create the database tables by running the SQL in `setup.sql`
3. Test the API endpoints to ensure they're working correctly

## API Documentation

### Create Reservation
- **URL**: `/api/reservations/create.php`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "phone": "0612345678",
    "date": "12/05/2023",
    "timeSlot": "8h00-11h00"
  }
  ```

### List Reservations
- **URL**: `/api/reservations/list.php`
- **Method**: `GET`
- **Auth Required**: Yes (Bearer Token)

### Update Reservation
- **URL**: `/api/reservations/update.php`
- **Method**: `POST` or `PUT`
- **Auth Required**: Yes (Bearer Token)
- **Request Body**:
  ```json
  {
    "id": 1,
    "status": "Confirmed"
  }
  ```

### Admin Login
- **URL**: `/api/auth/login.php`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "password"
  }
  ```

## Security Notes

- In production, change the default admin password
- Consider implementing rate limiting
- Use HTTPS for all API requests
- Consider implementing additional security measures

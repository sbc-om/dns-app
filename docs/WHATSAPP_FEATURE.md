# WhatsApp Messaging Feature

## Overview

The WhatsApp messaging feature allows administrators and coaches to send bulk WhatsApp messages to users with different access levels through the dashboard.

## Setup

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
WAHA_API_URL=http://localhost:3000
WAHA_API_KEY=your_api_key_here
NEXT_PUBLIC_DEFAULT_SESSION=Milad
```

- `WAHA_API_URL`: The URL of your WAHA API server
- `WAHA_API_KEY`: Your WAHA API authentication key
- `NEXT_PUBLIC_DEFAULT_SESSION`: Default WhatsApp session name

### 2. WAHA Setup

Make sure you have WAHA (WhatsApp HTTP API) running. Follow the WAHA documentation to set up your WhatsApp instance.

## Features

### Access Control

- **Admin**: Full access to send WhatsApp messages to all users
- **Coach**: Can send WhatsApp messages to users
- **Parent**: No access to WhatsApp messaging
- **Kid**: No access to WhatsApp messaging

### User Selection

- Filter users by role
- Search users by name, email, or phone number
- Select individual users or select all
- Only users with phone numbers are shown

### Message Sending

- Bulk message sending to multiple users
- Real-time sending progress
- Success/failure tracking for each recipient
- Automatic delay between messages to avoid rate limiting

## Usage

1. Navigate to the WhatsApp section in the dashboard sidebar
2. Select users you want to send messages to
3. Enter your message text
4. Verify the session name (default: Milad)
5. Click "Send" to send messages to all selected users
6. View sending results showing successful and failed deliveries

## API Routes

### POST `/api/whatsapp/send`

Send WhatsApp message(s) to user(s).

**Request Body:**

```json
{
  "phoneNumber": "96877722112",
  "message": "Hello from DNA!",
  "session": "Milad"
}
```

Or for bulk messages:

```json
{
  "phoneNumbers": [
    { "phoneNumber": "96877722112", "name": "User Name" },
    { "phoneNumber": "96877722113", "name": "Another User" }
  ],
  "message": "Hello everyone!",
  "session": "Milad"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Messages sent: 2 successful, 0 failed",
  "data": {
    "success": 2,
    "failed": 0,
    "results": [...]
  }
}
```

## Files Structure

```
src/
├── app/
│   ├── api/
│   │   └── whatsapp/
│   │       └── send/
│   │           └── route.ts          # API endpoint for sending messages
│   └── [locale]/
│       └── dashboard/
│           └── whatsapp/
│               └── page.tsx          # WhatsApp page
├── components/
│   └── WhatsAppMessagingClient.tsx   # Main WhatsApp component
└── lib/
    └── whatsapp/
        └── whatsapp.ts               # WhatsApp utility functions
```

## Security

- Only authenticated users with proper permissions can access the WhatsApp feature
- API key is stored securely in environment variables
- Phone number validation before sending
- Rate limiting with 1-second delay between messages

## Troubleshooting

### Messages Not Sending

1. Check WAHA API is running and accessible
2. Verify API key is correct in `.env.local`
3. Ensure WhatsApp session is active
4. Check phone numbers are in correct format (with country code)

### Permission Issues

1. Verify user role has `canSendWhatsApp` permission
2. Check role permissions in Settings > Role Permissions
3. Ensure user is logged in as Admin or Coach

## Support

For issues with WAHA setup, refer to the [WAHA Documentation](https://waha.devlike.pro/).

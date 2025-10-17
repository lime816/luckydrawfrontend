# Fix WhatsApp Phone Number ID Error

## Error
```
Object with ID '158282837372377' does not exist, cannot be loaded due to missing permissions
```

## Problem
The `REACT_APP_WHATSAPP_PHONE_NUMBER_ID` in your `.env` file is incorrect or you don't have access to it.

## Solution: Get the Correct Phone Number ID

### **Step 1: Go to Meta Developer Console**

1. Visit: https://developers.facebook.com/apps
2. Select your WhatsApp app
3. Click **WhatsApp** in the left sidebar
4. Click **API Setup**

### **Step 2: Find Your Phone Number ID**

On the API Setup page, you'll see:

```
Test number: +1 555-061-7327
Phone number ID: 123456789012345  ← Copy this!
```

**Important**: 
- The Phone Number ID is NOT the same as the phone number
- It's a long numeric ID (usually 15 digits)
- It's shown right below your test phone number

### **Step 3: Update .env File**

Replace the current value in your `.env`:

```env
# OLD (incorrect)
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=158282837372377

# NEW (use the ID from Meta console)
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=YOUR_ACTUAL_PHONE_NUMBER_ID
```

### **Step 4: Verify Other Settings**

While you're in the Meta console, also verify:

1. **Business Account ID**:
   - Go to **WhatsApp > API Setup**
   - Look for "WhatsApp Business Account ID"
   - Update in `.env`: `REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID`

2. **Access Token**:
   - Make sure it's not expired (temporary tokens expire in 24 hours)
   - Generate a new one if needed
   - Update in `.env`: `REACT_APP_WHATSAPP_ACCESS_TOKEN`

### **Step 5: Restart Dev Server**

```powershell
# Stop current server (Ctrl+C)
npm start
```

---

## How to Find Everything in Meta Console

### **Location of Each ID:**

```
Meta Developer Console > Your App > WhatsApp > API Setup

┌─────────────────────────────────────────────────┐
│ WhatsApp Business Account ID: 164297206767745   │ ← BUSINESS_ACCOUNT_ID
├─────────────────────────────────────────────────┤
│ Test number: +1 555-061-7327                    │
│ Phone number ID: 123456789012345                │ ← PHONE_NUMBER_ID
├─────────────────────────────────────────────────┤
│ Temporary access token:                         │
│ [Generate Access Token] button                  │ ← ACCESS_TOKEN
└─────────────────────────────────────────────────┘
```

---

## Complete .env Configuration

Your `.env` should look like this:

```env
# WhatsApp Business API Configuration
REACT_APP_BACKEND_URL=https://whatsappbackend-production-8946.up.railway.app
REACT_APP_WHATSAPP_ACCESS_TOKEN=EAFgCn2WnS8sBP...  # From "Temporary access token"
REACT_APP_WHATSAPP_API_VERSION=v22.0
REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=164297206767745  # From "WhatsApp Business Account ID"
REACT_APP_WHATSAPP_BUSINESS_NUMBER=15550617327  # The actual phone number (without +)
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=123456789012345  # From "Phone number ID" (NOT the phone number!)
```

---

## Common Mistakes

### ❌ **Wrong: Using the phone number as Phone Number ID**
```env
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=15550617327  # This is the phone number, not the ID!
```

### ✅ **Correct: Using the actual Phone Number ID**
```env
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=123456789012345  # This is the correct ID
```

---

## Verification Steps

After updating `.env`:

1. ✅ Phone Number ID is 15 digits (not 11 like phone number)
2. ✅ Access token is 200+ characters
3. ✅ Business Account ID matches Meta console
4. ✅ All values are on single lines (no line breaks)
5. ✅ Dev server restarted

---

## Test the Fix

1. Restart your dev server
2. Go to Flow Builder
3. Click "Create Flow"
4. Should work now! ✅

If you still get errors:
- Double-check all IDs match Meta console exactly
- Generate a fresh access token
- Make sure your app has WhatsApp permissions enabled

---

## Screenshot Guide

In Meta Developer Console, it looks like this:

```
┌──────────────────────────────────────────┐
│  Step 1: Add a phone number              │
│  ✓ +1 555-061-7327                       │
│                                           │
│  Phone number ID: 123456789012345        │ ← THIS IS WHAT YOU NEED!
│                                           │
│  Step 5: Send messages with the API      │
│  Temporary access token:                 │
│  [Generate Access Token]                 │
└──────────────────────────────────────────┘
```

Copy the **Phone number ID** (the long number), NOT the phone number itself!

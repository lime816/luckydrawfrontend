# Update WhatsApp Access Token

## Current Status
Your `.env` file needs the WhatsApp access token updated.

## Steps to Update:

### 1. Open the `.env` file in your editor

### 2. Find this line:
```
REACT_APP_WHATSAPP_ACCESS_TOKEN=your-token-here
```

### 3. Replace `your-token-here` with your new WhatsApp access token

### 4. Also update these if they changed:
```
REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id
REACT_APP_WHATSAPP_PHONE_NUMBER_ID=your-phone-id
```

### 5. Save the file

### 6. Restart the dev server:
```powershell
# Stop current server (Ctrl+C)
npm start
```

## Quick Update Script (Alternative)

If you prefer, run this command and paste your token when prompted:

```powershell
.\update-whatsapp-token.ps1
```

## Where to Get Your Tokens:

1. **Access Token**: Meta Developer Console > WhatsApp > API Setup > Temporary Access Token
2. **Business Account ID**: Meta Developer Console > WhatsApp > API Setup > Business Account ID
3. **Phone Number ID**: Meta Developer Console > WhatsApp > API Setup > Phone Number ID

---

**Note**: The `.env` file is gitignored for security. Never commit it to version control.

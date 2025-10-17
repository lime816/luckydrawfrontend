@echo off
echo Creating .env file from backup...

copy /Y .env.backup .env

echo.
echo Adding WhatsApp configuration...

echo. >> .env
echo # WhatsApp Business API Configuration >> .env
echo REACT_APP_BACKEND_URL=https://whatsappbackend-production-8946.up.railway.app >> .env
echo REACT_APP_WHATSAPP_ACCESS_TOKEN=your-token-here >> .env
echo REACT_APP_WHATSAPP_API_VERSION=v22.0 >> .env
echo REACT_APP_WHATSAPP_BUSINESS_ACCOUNT_ID=your-account-id >> .env
echo REACT_APP_WHATSAPP_BUSINESS_NUMBER=15550617327 >> .env
echo REACT_APP_WHATSAPP_PHONE_NUMBER_ID=your-phone-id >> .env

echo.
echo .env file created successfully!
echo Please edit .env and add your actual WhatsApp credentials.
echo.
pause

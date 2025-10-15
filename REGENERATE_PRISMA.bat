@echo off
echo Regenerating Prisma Client...
echo.

npx prisma generate

echo.
echo Done! Prisma client has been regenerated.
echo You can now create contests without the is_active field.
echo.
pause

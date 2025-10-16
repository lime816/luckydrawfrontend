# 🚀 Quick Reference Card

## 📋 Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@ecam.com | [Your Supabase Auth password] | SUPERADMIN |
| testadmin@example.com | password123 | ADMIN |
| mrudhula@gmail.com | password123 | MODERATOR |
| hrithik@gmail.com | password123 | MODERATOR |
| udith@gmail.com | password123 | MODERATOR |

---

## 🔧 Common SQL Commands

### Check All Admins
```sql
SELECT admin_id, email, password_hash, role, is_super_admin 
FROM admins 
ORDER BY admin_id;
```

### Reset Admin Password
```sql
UPDATE admins 
SET password_hash = 'newpassword123'
WHERE email = 'user@example.com';
```

### Create New Admin
```sql
INSERT INTO admins (name, email, password_hash, role, is_super_admin, two_factor)
VALUES ('New Admin', 'newadmin@example.com', 'password123', 'ADMIN', false, false);
```

### Check RLS Status
```sql
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'admins';
```

### Disable RLS (Development)
```sql
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
```

### Enable RLS (Production)
```sql
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
```

---

## 🐛 Quick Troubleshooting

### Login Not Working?
1. Check console logs (F12)
2. Verify password in database matches what you're typing
3. Check RLS is disabled: `SELECT rowsecurity FROM pg_tables WHERE tablename = 'admins';`
4. Hard refresh browser (Ctrl+Shift+R)

### 406 Error?
```sql
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;
```

### Admin Not Found?
```sql
-- Check if admin exists
SELECT * FROM admins WHERE email = 'problematic@example.com';

-- If not found, create it
INSERT INTO admins (name, email, password_hash, role, is_super_admin, two_factor)
VALUES ('Admin Name', 'email@example.com', 'password123', 'ADMIN', false, false);
```

### Password Mismatch?
```sql
-- Check stored password
SELECT email, password_hash FROM admins WHERE email = 'user@example.com';

-- Update if wrong
UPDATE admins SET password_hash = 'password123' WHERE email = 'user@example.com';
```

---

## 📁 Important Files

### For Production
- `enable-rls-for-production.sql` - Run when ready for production

### For Troubleshooting
- `diagnose-admin-login.sql` - Check admin status
- `fix-all-admin-passwords.sql` - Reset all passwords

### Documentation
- `COMPLETE_SETUP_SUMMARY.md` - Full summary
- `SUPER_ADMIN_GUIDE.md` - Complete guide
- `TESTING_GUIDE.md` - Testing instructions

---

## 🎯 Quick Commands

### Restart Dev Server
```bash
# Stop: Ctrl+C
npm start
```

### Hard Refresh Browser
```
Ctrl + Shift + R
```

### Open DevTools Console
```
F12 → Console tab
```

### Clear Browser Cache
```
Ctrl + Shift + Delete
```

---

## ✅ Status Check

### All Working?
- [ ] Super Admin login works
- [ ] All regular admin logins work
- [ ] No 406 errors in console
- [ ] No "Admin not found" errors
- [ ] Passwords match database

### Ready for Production?
- [ ] RLS enabled with proper policies
- [ ] Password hashing implemented
- [ ] Strong passwords set
- [ ] 2FA enabled for Super Admin
- [ ] All tests passing

---

## 🆘 Emergency Fixes

### Everything Broken?
```sql
-- Disable RLS
ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Reset all passwords
UPDATE admins SET password_hash = 'password123' 
WHERE is_super_admin = false OR is_super_admin IS NULL;

-- Verify
SELECT email, password_hash FROM admins;
```

### Can't Access Supabase?
1. Check `.env` file
2. Verify `REACT_APP_SUPABASE_URL`
3. Verify `REACT_APP_SUPABASE_ANON_KEY`
4. Restart dev server

---

## 📞 Support

### Check These First
1. Console logs (F12)
2. Database queries
3. RLS status
4. Password matches

### Documentation
- `COMPLETE_SETUP_SUMMARY.md` - Everything you need
- `TESTING_GUIDE.md` - Detailed troubleshooting
- `SUPER_ADMIN_GUIDE.md` - Complete documentation

---

**Keep this file handy for quick reference!** 📌

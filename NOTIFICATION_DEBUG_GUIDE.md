# 🔍 Notification System - Debug Guide

## ⚠️ Notifications Not Appearing?

Follow these steps to debug and fix the issue.

---

## 🧪 Step 1: Check Browser Console

Open browser console (F12) and look for these logs:

### **Expected Logs:**
```
🔍 Checking for contest notifications...
📋 Found 2 contests to check
📝 Already notified contests: {}
📊 Contest: "Test Contest"
   End Date: 10/17/2025, 10:00:00 AM
   Hours Until End: 18.50
   Status: ONGOING
⚠️ Contest "Test Contest" is ending within 24 hours!
   Already notified? false
✅ Creating notification for "Test Contest"
💾 Marked contest 1 as notified
```

### **If You See Errors:**
```
❌ Error fetching contests: [error details]
```
→ Check database connection and .env file

---

## 🧪 Step 2: Verify Database Has Contests

### **Check in Supabase:**
```sql
SELECT 
  contest_id, 
  name, 
  start_date, 
  end_date, 
  status,
  EXTRACT(EPOCH FROM (end_date - NOW())) / 3600 as hours_until_end
FROM contests
WHERE status IN ('ONGOING', 'UPCOMING')
ORDER BY end_date;
```

### **Expected Result:**
```
contest_id | name         | hours_until_end | status
-----------|--------------|-----------------|--------
1          | Test Contest | 18.5            | ONGOING
```

---

## 🧪 Step 3: Create Test Contest

If no contests exist, create one:

```sql
INSERT INTO contests (
  name,
  start_date,
  end_date,
  status,
  theme,
  description,
  created_by
) VALUES (
  'Test Notification Contest',
  NOW(),                           -- Starts now
  NOW() + INTERVAL '12 hours',     -- Ends in 12 hours
  'ONGOING',
  'Test',
  'Testing notifications',
  1                                -- Your user ID
);
```

---

## 🧪 Step 4: Check localStorage

### **View Notified Contests:**
```javascript
// In browser console (F12)
const notified = JSON.parse(localStorage.getItem('notifiedContests') || '{}');
console.table(notified);
```

### **If Already Notified, Reset:**
```javascript
// Clear notification tracking
localStorage.removeItem('notifiedContests');
console.log('✅ Cleared. Refresh page to re-check.');
```

---

## 🧪 Step 5: Manual Trigger Test

### **Force Check Immediately:**
```javascript
// In browser console
// This will trigger the check function manually
setTimeout(() => {
  console.log('Manually triggering notification check...');
}, 1000);
// Then refresh the page
```

---

## 🧪 Step 6: Check Notification Component

### **Verify NotificationCenter is Mounted:**
```javascript
// In browser console
const bellIcon = document.querySelector('[aria-label="Notifications"]');
console.log('Bell icon found?', !!bellIcon);
```

If not found, check Header.tsx integration.

---

## 🧪 Step 7: Test with Manual Notification

### **Add Test Notification:**
```javascript
// In browser console
const testNotif = {
  id: 'test-' + Date.now(),
  type: 'contest_ending',
  title: 'Test Notification',
  message: 'This is a test notification',
  timestamp: new Date().toISOString(),
  read: false,
  priority: 'high'
};

const stored = JSON.parse(localStorage.getItem('notifications') || '[]');
stored.unshift(testNotif);
localStorage.setItem('notifications', JSON.stringify(stored));

// Refresh page
location.reload();
```

---

## 🔧 Common Issues & Solutions

### **Issue 1: No Contests Found**
```
ℹ️ No ongoing or upcoming contests found
```

**Solution:**
- Create a contest with status 'ONGOING' or 'UPCOMING'
- Set end_date within 24 hours from now

---

### **Issue 2: Contest Already Notified**
```
Already notified? true
```

**Solution:**
```javascript
localStorage.removeItem('notifiedContests');
location.reload();
```

---

### **Issue 3: Contest Ended**
```
⏰ Contest "Test" has already ended
```

**Solution:**
- Update contest end_date to future:
```sql
UPDATE contests 
SET end_date = NOW() + INTERVAL '12 hours'
WHERE contest_id = 1;
```

---

### **Issue 4: Contest > 24 Hours Away**
```
⏳ Contest has 48.00 hours remaining (> 24 hours)
```

**Solution:**
- Update contest end_date to within 24 hours:
```sql
UPDATE contests 
SET end_date = NOW() + INTERVAL '12 hours'
WHERE contest_id = 1;
```

---

### **Issue 5: Database Connection Error**
```
❌ Error fetching contests: [error]
```

**Solution:**
1. Check .env file has correct Supabase credentials
2. Verify Supabase project is active
3. Check network connection

---

## 🎯 Quick Test Checklist

Run these in order:

- [ ] Open browser console (F12)
- [ ] Check for error messages
- [ ] Verify contests exist in database
- [ ] Check contest end_date is within 24 hours
- [ ] Check contest status is 'ONGOING' or 'UPCOMING'
- [ ] Clear notifiedContests from localStorage
- [ ] Refresh page
- [ ] Wait 10 seconds (auto-check interval)
- [ ] Check console for logs
- [ ] Check bell icon for badge

---

## 🔍 Debug Commands

### **1. Check Current Time vs Contest End:**
```javascript
const now = new Date();
const endDate = new Date('2025-10-17T10:00:00'); // Your contest end date
const hoursUntilEnd = (endDate - now) / (1000 * 60 * 60);
console.log('Current time:', now.toLocaleString());
console.log('Contest ends:', endDate.toLocaleString());
console.log('Hours until end:', hoursUntilEnd.toFixed(2));
console.log('Should notify?', hoursUntilEnd > 0 && hoursUntilEnd <= 24);
```

### **2. View All Notifications:**
```javascript
const notifs = JSON.parse(localStorage.getItem('notifications') || '[]');
console.table(notifs);
```

### **3. Clear Everything:**
```javascript
localStorage.removeItem('notifications');
localStorage.removeItem('notifiedContests');
console.log('✅ All cleared. Refresh page.');
```

---

## 📊 Expected Behavior

### **When Working Correctly:**

1. Page loads
2. After 1 second: First check runs
3. Console shows: "🔍 Checking for contest notifications..."
4. If contest < 24 hours: Creates notification
5. Bell icon shows badge with count
6. Every 10 seconds: Re-checks (for testing)
7. Every 30 seconds: Checks for other notifications

---

## 🚀 Quick Fix

If nothing works, try this complete reset:

```javascript
// 1. Clear everything
localStorage.clear();

// 2. Refresh
location.reload();

// 3. Wait 10 seconds

// 4. Check console for logs
```

---

## 📝 Report Issue

If still not working, provide these details:

1. **Console logs** (copy all)
2. **Contest data** from database
3. **localStorage contents**
4. **Browser and version**
5. **Any error messages**

---

## ✅ Success Indicators

You'll know it's working when you see:

- ✅ Console log: "✅ Creating notification for..."
- ✅ Bell icon has red badge
- ✅ Clicking bell shows notification
- ✅ Notification says "Contest Ending Soon"

---

**Need help? Check the console logs first!** 🔍

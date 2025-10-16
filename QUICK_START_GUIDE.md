# 🚀 Quick Start Guide - Database Connected Pages

## ✅ What's Ready

Your **Participants** and **Winners** pages are now fully connected to the Supabase database!

---

## 🎯 Quick Test

### **1. Start the Development Server**
```bash
npm start
```

### **2. Navigate to Pages**
- **Participants:** http://localhost:3000/participants
- **Winners:** http://localhost:3000/winners

### **3. Verify Data Loads**
- Check if participants/winners display
- Verify statistics show correct counts
- Test search functionality
- Test filters

---

## 📊 Available Features

### **Participants Page**
✅ View all participants from database
✅ Search by name or contact
✅ Filter by validation status
✅ Filter by contest
✅ Export to CSV/Excel
✅ View statistics (total, valid, invalid)

### **Winners Page**
✅ View all winners from database
✅ Search by name, contact, or prize
✅ Filter by prize status
✅ Send notifications
✅ Update prize status
✅ Export reports
✅ View statistics (total, pending, claimed, shipped)

---

## 🔧 Service Methods

### **ParticipantService**
```typescript
import { ParticipantService } from './services/participantService';

// Get all participants
const participants = await ParticipantService.getAllParticipants();

// Get by contest
const contestParticipants = await ParticipantService.getParticipantsByContest(1);

// Validate participant
await ParticipantService.validateParticipant(participantId, true);

// Get stats
const stats = await ParticipantService.getParticipantStats();
```

### **WinnerService**
```typescript
import { WinnerService } from './services/winnerService';

// Get all winners
const winners = await WinnerService.getAllWinners();

// Get by contest
const contestWinners = await WinnerService.getWinnersByContest(1);

// Update status
await WinnerService.updatePrizeStatus(winnerId, 'CLAIMED');

// Send notification
await WinnerService.markAsNotified(winnerId);

// Get stats
const stats = await WinnerService.getWinnerStats();
```

---

## 🐛 Troubleshooting

### **No Data Showing?**
1. Check database has data:
   - Go to Supabase Dashboard
   - Check `participants` and `winners` tables
   - Verify data exists

2. Check console for errors:
   - Open browser DevTools (F12)
   - Look for error messages
   - Check Network tab for failed requests

3. Verify environment variables:
   - Check `.env` file
   - Ensure `REACT_APP_SUPABASE_URL` is set
   - Ensure `REACT_APP_SUPABASE_ANON_KEY` is set

### **Loading Forever?**
- Check Supabase connection
- Verify RLS policies allow SELECT
- Check browser console for errors

### **Can't Update Data?**
- Verify RLS policies allow UPDATE
- Check user permissions
- Ensure you're authenticated

---

## 📝 Add Test Data

### **Add Test Participants (Supabase SQL Editor):**
```sql
INSERT INTO participants (contest_id, name, contact, validated)
VALUES 
  (1, 'Test User 1', '+91 9876543210', true),
  (1, 'Test User 2', '+91 9876543211', true),
  (1, 'Test User 3', '+91 9876543212', false);
```

### **Add Test Winners (Supabase SQL Editor):**
```sql
-- First, ensure you have a draw
INSERT INTO draws (contest_id, draw_mode, executed_by, total_winners)
VALUES (1, 'RANDOM', 1, 1);

-- Then add winner
INSERT INTO winners (draw_id, participant_id, prize_id, prize_status, notified)
VALUES (1, 1, 1, 'PENDING', false);
```

---

## 🎨 Customization

### **Change Table Columns:**
Edit the `columns` array in the respective page:
```typescript
// In Participants.tsx or Winners.tsx
const columns = [
  {
    key: 'name',
    header: 'Name',
    render: (item) => <span>{item.name}</span>
  },
  // Add more columns...
];
```

### **Add New Filters:**
```typescript
const [customFilter, setCustomFilter] = useState('');

const filteredData = data.filter(item => {
  // Your custom filter logic
  return item.someField === customFilter;
});
```

### **Add New Actions:**
```typescript
const handleCustomAction = async (id: number) => {
  try {
    // Your custom logic
    await YourService.customMethod(id);
    toast.success('Action completed!');
    loadData();
  } catch (error) {
    toast.error('Action failed');
  }
};
```

---

## 📚 Documentation

- **Full Documentation:** `DATABASE_INTEGRATION_COMPLETE.md`
- **Environment Setup:** `ENV_ALIGNMENT_COMPLETE.md`
- **Prisma Schema:** `MULTI_SCHEMA_SETUP_COMPLETE.md`

---

## 🎉 You're All Set!

Your pages are connected to the database and ready to use. Start the dev server and test the functionality!

```bash
npm start
```

Then navigate to:
- http://localhost:3000/participants
- http://localhost:3000/winners

**Happy coding!** 🚀

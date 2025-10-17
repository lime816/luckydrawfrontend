# How to Trigger Flow via WhatsApp

## 🎯 **Current Situation**

Your backend is running ✅ at: `https://whatsappbackend-production-8946.up.railway.app`

But the **webhook automation is not yet configured** in Meta Developer Console.

---

## 📱 **Option 1: Send Flow Directly (Works Now!)**

### **Steps:**

1. Open Flow Builder
2. Click **"Manage Flows"** button
3. Click **"Set Active"** on your flow (e.g., "udith")
4. Click **"Flow QR"** button
5. Scroll to **"Send Flow Directly"** section
6. Enter phone number: `918281348343`
7. Click **"Send Flow Now"**
8. ✅ Flow will arrive in WhatsApp immediately!

**This works right now without any webhook setup!**

---

## 📱 **Option 2: QR Code with Webhook (Requires Setup)**

### **What You Need to Do:**

#### **Step 1: Configure Webhook in Meta Developer Console**

1. Go to: https://developers.facebook.com/apps
2. Select your WhatsApp app
3. Click **WhatsApp** → **Configuration**
4. Find **"Webhook"** section
5. Click **"Edit"**

**Enter these details:**

```
Callback URL: https://whatsappbackend-production-8946.up.railway.app/webhook
Verify Token: your_verify_token_here
```

6. Click **"Verify and Save"**

#### **Step 2: Subscribe to Webhook Fields**

Check these boxes:
- ✅ **messages**
- ✅ **message_status**

#### **Step 3: Test the Webhook**

1. Scan QR code from Flow Builder
2. WhatsApp opens with message: **"Please complete this form to continue with your lucky draw registration."**
3. Send that message
4. Backend receives webhook
5. Backend sends flow to you
6. Flow appears in WhatsApp!

---

## 🔧 **What Message to Send?**

The trigger message is stored when you create the flow. The default is:

```
Please complete this form to continue with your lucky draw registration.
```

**But you can customize it!** When creating a flow, there's an "Activation Message" field where you can set any message you want.

---

## 🎨 **How to Customize the Trigger Message**

### **When Creating a New Flow:**

1. Design your flow
2. Before clicking "Create Flow"
3. Look for **"Activation Message"** field
4. Enter your custom message, for example:
   - `Hi`
   - `Register`
   - `Lucky Draw`
   - `Start`
   - Or any message you want!

5. Click "Create Flow"
6. That message will trigger this specific flow

### **Current Flows and Their Messages:**

To see what message triggers each flow:

1. Click **"Flow QR"**
2. Select a flow from dropdown
3. The activation message is shown in the QR panel

---

## 🐛 **Troubleshooting**

### **"I sent the message but no flow came"**

**Check:**

1. ✅ Is your backend running?
   ```
   Visit: https://whatsappbackend-production-8946.up.railway.app/health
   Should show: {"status":"healthy"}
   ```

2. ✅ Is webhook configured in Meta console?
   - Callback URL set?
   - Webhook verified?
   - Messages subscribed?

3. ✅ Did you send the EXACT message?
   - Message must match exactly
   - Case-sensitive
   - No extra spaces

4. ✅ Is the flow published?
   - Check in "Manage Flows"
   - Status should be "PUBLISHED"

### **"How do I know what message to send?"**

**Method 1: Check QR Panel**
1. Click "Flow QR"
2. Select your flow
3. Message is shown in blue box

**Method 2: Check localStorage**
1. Open browser console (F12)
2. Type: `localStorage.getItem('flowActivationMessages')`
3. Shows all flow messages

**Method 3: Use Default**
If unsure, send:
```
Please complete this form to continue with your lucky draw registration.
```

---

## ✅ **Quick Test (No Webhook Needed)**

**Want to test immediately without webhook setup?**

1. Click **"Flow QR"** button
2. Find **"Send Flow Directly"** section (green box)
3. Enter your number: `918281348343`
4. Click **"Send Flow Now"**
5. Done! Flow arrives instantly! 🎉

---

## 📊 **Backend Webhook Logic**

Your backend should have this logic:

```javascript
// When webhook receives message
app.post('/webhook', (req, res) => {
  const { from, message } = req.body
  
  // Check if message matches any trigger
  const trigger = triggers.find(t => 
    t.message === message && t.isActive
  )
  
  if (trigger) {
    // Send flow to user
    sendFlowMessage(from, trigger.flowId)
  }
})
```

---

## 🎯 **Recommended Approach**

### **For Testing:**
Use **"Send Flow Now"** button - works immediately!

### **For Production:**
Set up webhook properly so QR codes work automatically.

---

## 📞 **Need Help?**

1. **Backend not responding?**
   - Check Railway logs
   - Verify deployment status

2. **Webhook not working?**
   - Check Meta console webhook status
   - Verify callback URL
   - Check backend logs for incoming requests

3. **Flow not appearing?**
   - Verify flow is published
   - Check flow ID is correct
   - Test with "Send Flow Now" first

---

**TL;DR:** Use the **"Send Flow Now"** button in the QR panel for immediate testing! 🚀

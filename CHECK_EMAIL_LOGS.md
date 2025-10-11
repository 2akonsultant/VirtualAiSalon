# 📧 HOW TO CHECK IF EMAIL IS WORKING

## ✅ Test Message Sent Successfully!

The API is working and the message was saved. Now we need to check if the email was actually sent.

---

## 🔍 **STEP 1: Check Server Logs**

### **Look at the PowerShell window running the server**

You should see one of these messages:

### **✅ If Email is Working:**
```
📧 Processing contact message from: Test Customer
✅ Email sent successfully to 2akonsultant@gmail.com
✅ Excel file updated: C:\Users\asus\Downloads\SalonBooker\data\contact-messages.xlsx
✅ Contact message processed: Email=true, Excel=true
```

### **❌ If Email is NOT Working:**
```
📧 Processing contact message from: Test Customer
❌ Error sending email: [Some error message]
✅ Excel file updated: C:\Users\asus\Downloads\SalonBooker\data\contact-messages.xlsx
✅ Contact message processed: Email=false, Excel=true
```

---

## 🔍 **STEP 2: Check Your Gmail**

1. **Open Gmail:** https://mail.google.com
2. **Sign in to:** 2akonsultant@gmail.com
3. **Look for email with subject:** "New Customer Inquiry from Test Customer - Goodness Glamour Salon"

### **Check These Folders:**
- ✅ **Inbox** (primary tab)
- ✅ **Spam/Junk** folder
- ✅ **Social** tab
- ✅ **Promotions** tab

### **Wait Time:**
- Emails usually arrive in **30 seconds to 2 minutes**
- If not there after 2 minutes, there's likely an error

---

## 🔍 **STEP 3: Check Excel File**

The Excel file should be updated regardless of email status.

```powershell
# Open the Excel file
start data\contact-messages.xlsx
```

You should see your test message entry with all details.

---

## ❌ **IF EMAIL IS NOT WORKING:**

### **Common Issues:**

### **1. Server Not Restarted After Changes**
**Solution:**
```powershell
# Stop all node processes
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force

# Start server again
npm run dev
```

### **2. .env File Not Loaded**
**Solution:**
```powershell
# Check .env file
notepad .env

# Make sure these lines exist:
EMAIL_USER=2akonsultant@gmail.com
EMAIL_PASSWORD=ikgipsvgcfthwpoq
```

### **3. Gmail App Password Issue**
**Symptoms:** Error message like "Invalid credentials" or "Missing credentials"

**Solution:**
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to: 2akonsultant@gmail.com
3. Generate a new App Password
4. Update `.env` file with new password
5. Restart server

### **4. Gmail Security Block**
**Symptoms:** Error message like "Authentication failed" or "Access denied"

**Solution:**
1. Check Gmail security settings
2. Make sure "Less secure app access" is NOT needed (App Passwords should work)
3. Check if Gmail has sent you a security alert email
4. Verify the account at: https://myaccount.google.com/security

---

## 🧪 **MANUAL EMAIL TEST**

If you want to test email independently:

```powershell
# Run this test
node test-email.js
```

This will:
- Test email configuration directly
- Show if Gmail credentials are working
- Send a test email

**Expected Output:**
```
Testing email configuration...
✅ Email sent successfully!
Message ID: <some-id@gmail.com>
```

---

## 📊 **WHAT TO TELL ME:**

Please check the server logs and tell me:

1. **What do you see in the server terminal?**
   - Do you see "✅ Email sent successfully"?
   - Or do you see "❌ Error sending email"?
   - If error, what's the error message?

2. **Did you check Gmail?**
   - Checked inbox?
   - Checked spam folder?
   - Checked all tabs?

3. **Is the Excel file updated?**
   - Does it have the test entry?

---

## 🚀 **QUICK DEBUG COMMANDS:**

```powershell
# 1. Check if server is running
Get-Process | Where-Object { $_.ProcessName -like "*node*" }

# 2. Check .env file
Get-Content .env | Select-String "EMAIL"

# 3. Test API
.\test-contact-form.ps1

# 4. Check Excel file
start data\contact-messages.xlsx

# 5. Restart everything
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force
npm run dev
```

---

## 📧 **EXPECTED EMAIL CONTENT:**

When the email works, you should receive:

**Subject:** "New Customer Inquiry from Test Customer - Goodness Glamour Salon"

**Content:**
- 🎀 Goodness Glamour Salon header
- 👤 Customer Information card with:
  - Name: Test Customer
  - Phone: 1234567890 (clickable)
  - Service Interest: Women Hair Services
  - Address: 123 Test Street
  - Received time
- 💬 Customer Message card
- 🚀 Quick Action Required section

---

## ✅ **NEXT STEPS:**

1. **Check the server terminal** (the PowerShell window running npm run dev)
2. **Look for email logs** (✅ or ❌ messages)
3. **Tell me what you see** so I can help fix any issues!

---

**The API is working! Now we just need to verify the email is being sent.** 📧

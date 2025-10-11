# 🔧 EMAIL NOT WORKING - TROUBLESHOOTING GUIDE

## 📋 Current Status:

✅ **API is working** - Messages are being saved  
❓ **Email status** - Need to check server logs  
✅ **Excel file** - Should be updating  

---

## 🎯 **IMMEDIATE ACTIONS:**

### **1. Check Server Terminal Logs**

**Go to the PowerShell window running `npm run dev`**

Look for these messages after submitting the contact form:

#### **✅ If Working:**
```
2:21:18 PM [express] POST /api/contact 201 in 15ms
📧 Processing contact message from: Test Customer
✅ Email sent successfully to 2akonsultant@gmail.com
✅ Excel file updated
✅ Contact message processed: Email=true, Excel=true
```

#### **❌ If NOT Working:**
```
2:21:18 PM [express] POST /api/contact 201 in 15ms
📧 Processing contact message from: Test Customer
❌ Error sending email: Error: Missing credentials for "PLAIN"
✅ Excel file updated
✅ Contact message processed: Email=false, Excel=true
```

---

## 🔍 **WHAT TO DO BASED ON LOGS:**

### **Scenario A: No Email Logs at All**

**Problem:** Server wasn't restarted after email code changes

**Solution:**
```powershell
# Stop server
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force

# Wait 2 seconds
Start-Sleep -Seconds 2

# Start server
npm run dev

# Wait for "serving on port 5000" message

# Test again
.\test-contact-form.ps1
```

---

### **Scenario B: "Error sending email: Missing credentials"**

**Problem:** .env file not loaded or password wrong

**Solution:**
```powershell
# 1. Check .env file
notepad .env

# 2. Make sure it has:
EMAIL_USER=2akonsultant@gmail.com
EMAIL_PASSWORD=ikgipsvgcfthwpoq

# 3. Save and close

# 4. Restart server
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force
npm run dev

# 5. Test again
.\test-contact-form.ps1
```

---

### **Scenario C: "Error sending email: Invalid login"**

**Problem:** Gmail App Password is wrong or expired

**Solution:**
1. Go to: https://myaccount.google.com/apppasswords
2. Sign in to: 2akonsultant@gmail.com
3. Delete old app password
4. Create new app password
5. Copy the 16-character password
6. Update .env file:
   ```
   EMAIL_PASSWORD=your_new_16_char_password
   ```
7. Restart server

---

### **Scenario D: "✅ Email sent successfully" but no email in Gmail**

**Problem:** Email might be in spam or delayed

**Solution:**
1. **Check Gmail Spam folder**
2. **Wait 2-3 minutes** (sometimes delayed)
3. **Check all Gmail tabs:**
   - Primary
   - Social
   - Promotions
   - Spam
4. **Search Gmail** for "Goodness Glamour"
5. **Check if Gmail blocked it** - look for security alerts

---

## 🧪 **STEP-BY-STEP TESTING:**

### **Step 1: Verify Server is Running**
```powershell
Get-Process | Where-Object { $_.ProcessName -like "*node*" }
```
Should show node processes running.

### **Step 2: Verify .env Configuration**
```powershell
Get-Content .env | Select-String "EMAIL"
```
Should show:
```
EMAIL_USER=2akonsultant@gmail.com
EMAIL_PASSWORD=ikgipsvgcfthwpoq
```

### **Step 3: Test Email Directly**
```powershell
node test-email.js
```
Should show:
```
Testing email configuration...
✅ Email sent successfully!
Message ID: <some-id@gmail.com>
```

### **Step 4: Test Contact Form**
```powershell
.\test-contact-form.ps1
```
Should show:
```
SUCCESS! Message sent!
```

### **Step 5: Check Server Logs**
Look at the server terminal for email status.

### **Step 6: Check Gmail**
- Open: https://mail.google.com
- Sign in to: 2akonsultant@gmail.com
- Look for: "New Customer Inquiry from Test Customer"

---

## 🔧 **COMPLETE RESET (If Nothing Works):**

```powershell
# 1. Stop all servers
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force

# 2. Verify .env file
notepad .env
# Make sure EMAIL_USER and EMAIL_PASSWORD are correct

# 3. Clean and restart
npm install

# 4. Start server
npm run dev

# 5. Wait for "serving on port 5000"

# 6. Test email directly
node test-email.js

# 7. If that works, test contact form
.\test-contact-form.ps1

# 8. Check server logs and Gmail
```

---

## 📧 **WHAT I NEED FROM YOU:**

Please do these 3 things and tell me the results:

### **1. Check Server Logs:**
- Go to the PowerShell window running `npm run dev`
- Submit a test message from the website
- Copy and paste what you see in the terminal

### **2. Check Gmail:**
- Go to https://mail.google.com
- Sign in to 2akonsultant@gmail.com
- Check Inbox AND Spam folder
- Tell me: Do you see any emails?

### **3. Test Direct Email:**
```powershell
node test-email.js
```
- Tell me what output you get

---

## 🎯 **MOST LIKELY ISSUES:**

Based on our earlier testing, the most likely issues are:

1. **Server not restarted** after email template changes (80% likely)
2. **.env file not loaded** properly (15% likely)
3. **Gmail blocking** or spam filter (5% likely)

---

## ✅ **QUICK FIX (Try This First):**

```powershell
# Complete restart
Write-Host "Stopping server..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*node*" } | Stop-Process -Force

Write-Host "Waiting..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "Starting server..." -ForegroundColor Green
npm run dev
```

Then wait for "serving on port 5000" and test again!

---

**Let me know what you see in the server logs and I'll help you fix it!** 🚀

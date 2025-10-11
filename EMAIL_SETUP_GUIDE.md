# 📧 Email Configuration Guide for Contact Form

Your contact form is now fully functional! When users submit a message:
1. ✅ **Email sent to:** 2akonsultant@gmail.com
2. ✅ **Excel file updated:** `data/contact-messages.xlsx`
3. ✅ **Message saved:** In-memory database

---

## 🚀 Quick Setup

### Step 1: Enable Gmail App Password

You need to create a Gmail App Password (NOT your regular Gmail password) for security.

#### For Gmail Account: **2akonsultant@gmail.com**

1. **Go to Google Account Settings:**
   ```
   https://myaccount.google.com/security
   ```

2. **Enable 2-Step Verification** (if not already enabled):
   - Click on "2-Step Verification"
   - Follow the prompts to enable it
   - You'll need your phone for verification

3. **Generate App Password:**
   - After 2-Step Verification is enabled
   - Go to: https://myaccount.google.com/apppasswords
   - OR Google Account > Security > 2-Step Verification > App passwords
   - Select "Mail" and "Windows Computer"
   - Click "Generate"
   - **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

4. **Update .env File:**
   ```powershell
   notepad .env
   ```
   
   Update these lines:
   ```env
   EMAIL_USER=2akonsultant@gmail.com
   EMAIL_PASSWORD=abcdefghijklmnop   # Paste your 16-character app password (no spaces)
   ```

5. **Save and Restart Server:**
   ```powershell
   # Stop server (Ctrl + C)
   # Start again
   npm run dev
   ```

---

## 📊 Excel File Location

All contact messages are automatically saved to:
```
C:\Users\asus\Downloads\SalonBooker\data\contact-messages.xlsx
```

### Excel File Features:
- ✅ **Columns:** Submission Date, Name, Phone, Service Interest, Address, Message
- ✅ **Auto-formatted** with proper column widths
- ✅ **Timestamped** entries
- ✅ **Sortable** data
- ✅ **Opens in Excel/Google Sheets**

---

## 📧 Email Features

When a user submits the contact form, you'll receive a beautiful HTML email with:

### Email Details:
- **To:** 2akonsultant@gmail.com
- **Subject:** "New Contact Message from [Customer Name] - Goodness Glamour Salon"
- **Content:**
  - Customer name
  - Phone number
  - Service interest
  - Complete address
  - Full message
  - Timestamp
  - Action reminder

### Email Format:
- 🎨 **Professional HTML design**
- 📱 **Mobile-responsive**
- 🎀 **Salon-themed colors**
- ✅ **Clear call-to-action**

---

## 🧪 Test the Contact Form

### Step 1: Fill the Form
1. Go to: http://localhost:5000
2. Scroll down to "Get in Touch" section
3. Fill in the form:
   - Name: Test Customer
   - Phone: 1234567890
   - Service Interest: Women's Hair Services
   - Address: 123 Test Street, Test City
   - Message: I want to book a hair cut service

### Step 2: Submit
- Click "Send Message"
- You should see: "Message Sent! ✅"

### Step 3: Check Results
1. **Email:** Check 2akonsultant@gmail.com inbox
2. **Excel:** Open `data/contact-messages.xlsx`
3. **Console:** Check terminal logs for success messages

---

## 🔍 Verify Everything Works

### Check Email:
```
✅ Email received in inbox?
✅ All customer details visible?
✅ Message formatted nicely?
```

### Check Excel File:
```powershell
# Open the Excel file
start data/contact-messages.xlsx
```
```
✅ File created in data folder?
✅ New row added with submission?
✅ All columns filled correctly?
✅ Timestamp showing?
```

### Check Console Logs:
Look for these messages in terminal:
```
✅ Email sent successfully to 2akonsultant@gmail.com
✅ Excel file updated: C:\Users\asus\Downloads\SalonBooker\data\contact-messages.xlsx
📊 Total contact messages: 1
✅ Contact message processed: Email=true, Excel=true
```

---

## ⚠️ Troubleshooting

### Problem: Email not sending

**Error:** "Invalid login: 535-5.7.8 Username and Password not accepted"

**Solution:**
1. Make sure 2-Step Verification is enabled on Gmail
2. Generate a new App Password (not regular password)
3. Copy EXACTLY without spaces
4. Update EMAIL_PASSWORD in .env
5. Restart server

### Problem: Excel file not created

**Check:**
1. Does `data` folder exist? If not:
   ```powershell
   mkdir data
   ```
2. Do you have write permissions?
3. Check console for error messages

### Problem: Form submission fails

**Check:**
1. All fields filled?
2. Server running? (npm run dev)
3. Check browser console (F12) for errors
4. Check terminal for backend errors

---

## 📁 File Structure

```
SalonBooker/
├── data/
│   └── contact-messages.xlsx    ← All contact messages stored here
├── server/
│   ├── email-service.ts          ← Email & Excel logic
│   ├── routes.ts                 ← Contact form API endpoint
│   └── storage.ts                ← In-memory storage
├── client/src/pages/
│   └── home.tsx                  ← Contact form UI
└── .env                          ← Email configuration
```

---

## 🎯 What Happens When Form is Submitted?

```
1. User fills contact form
   ↓
2. Frontend validates all fields
   ↓
3. POST request to /api/contact
   ↓
4. Backend saves to in-memory database
   ↓
5. PARALLEL PROCESSING:
   ├─→ Send email to 2akonsultant@gmail.com
   └─→ Update Excel file in data/
   ↓
6. Return success message to user
   ↓
7. Form resets, ready for next submission
```

---

## 📱 Access Excel File

### From File Explorer:
```
C:\Users\asus\Downloads\SalonBooker\data\contact-messages.xlsx
```

### From Terminal:
```powershell
# Open in Excel
start data/contact-messages.xlsx

# View in terminal
Get-Content data/contact-messages.xlsx
```

### From Code:
```powershell
# View all contact messages via API
Invoke-WebRequest -Uri http://localhost:5000/api/contact -UseBasicParsing
```

---

## 🔐 Security Notes

### Gmail App Password:
- ✅ **More secure** than using regular password
- ✅ **Revocable** - can be deleted anytime
- ✅ **App-specific** - only works for this app
- ✅ **No 2FA prompts** when sending emails

### Best Practices:
- ❌ Never commit `.env` to git (already in .gitignore)
- ❌ Never share your App Password
- ✅ Use different App Password for each application
- ✅ Revoke unused App Passwords regularly

---

## 📞 Contact Form Fields

The form collects:
1. **Name** - Customer's full name
2. **Phone** - Contact number
3. **Service Interest** - Which service they want
4. **Address** - Full address for doorstep service
5. **Message** - Detailed requirements

All fields are **required** and validated before submission.

---

## 🎉 Success!

Once configured:
- ✅ Every form submission sends email instantly
- ✅ Excel file updates automatically
- ✅ No manual data entry needed
- ✅ All messages centralized
- ✅ Easy to track and respond

---

## 📊 View All Messages

### Via Excel:
Open: `data/contact-messages.xlsx`

### Via API:
```powershell
# Get all messages (JSON)
Invoke-WebRequest -Uri http://localhost:5000/api/contact -UseBasicParsing | Select-Object -ExpandProperty Content
```

### Via Browser:
```
http://localhost:5000/api/contact
```
(Shows JSON array of all messages)

---

## 💡 Tips

1. **Check email regularly** - New inquiries come to 2akonsultant@gmail.com
2. **Open Excel file** - Track all submissions in one place
3. **Respond quickly** - Customer phone numbers are in both email and Excel
4. **Monitor logs** - Terminal shows real-time submission status
5. **Backup Excel file** - Copy `data/contact-messages.xlsx` regularly

---

## 🚀 Next Steps

1. **Configure email** (follow steps above)
2. **Test the form** (submit a test message)
3. **Check inbox** (verify email received)
4. **Open Excel** (confirm data saved)
5. **Start receiving inquiries!**

---

**Questions?** Check terminal logs or browser console (F12) for detailed error messages.

**Need Help?** All email sending logic is in `server/email-service.ts`


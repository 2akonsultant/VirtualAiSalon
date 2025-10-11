# 📊 EXCEL FILES LOCATION GUIDE

## **📁 WHERE TO FIND YOUR EXCEL FILES**

All customer data Excel files are stored in the `data` folder within your SalonBooker project.

---

## **🗂️ FILE LOCATIONS:**

### **📍 Main Project Path:**
```
C:\Users\asus\Downloads\SalonBooker\data\
```

### **📋 Available Excel Files:**

#### **1. Bookings Excel File:**
- **File Name:** `bookings.xlsx`
- **Full Path:** `C:\Users\asus\Downloads\SalonBooker\data\bookings.xlsx`
- **Contains:** All booking details from customers
- **Updated:** Automatically when new bookings are made

#### **2. Contact Messages Excel File:**
- **File Name:** `contact-messages.xlsx`
- **Full Path:** `C:\Users\asus\Downloads\SalonBooker\data\contact-messages.xlsx`
- **Contains:** All contact form submissions
- **Updated:** Automatically when customers send messages

---

## **📊 BOOKINGS EXCEL FILE STRUCTURE:**

### **Column Headers:**
1. **Booking ID** - Unique identifier for each booking
2. **Name** - Customer's full name
3. **Email** - Customer's email address
4. **Phone** - Customer's phone number
5. **Date** - Appointment date
6. **Time** - Appointment time
7. **Services** - Services requested (comma-separated)
8. **Location** - Customer's address
9. **Total Amount** - Total booking amount in ₹
10. **Notes** - Any special notes or requirements
11. **Timestamp** - When the booking was created

### **Sample Data:**
```
Booking ID | Name           | Email                | Phone      | Date       | Time  | Services           | Location         | Total | Notes | Timestamp
B001      | Priya Sharma   | priya@email.com     | 9876543210 | 15/01/2024 | 14:30 | Hair Cut & Styling | Delhi, India     | 800   | None  | 15/01/2024 10:15:30
B002      | Rahul Kumar    | rahul@email.com     | 9876543211 | 16/01/2024 | 11:00 | Hair Coloring      | Mumbai, India    | 2500  | None  | 15/01/2024 14:20:15
```

---

## **📧 CONTACT MESSAGES EXCEL FILE STRUCTURE:**

### **Column Headers:**
1. **Message ID** - Unique identifier for each message
2. **Name** - Customer's name
3. **Phone** - Customer's phone number
4. **Email** - Customer's email (optional)
5. **Service Interest** - Service they're interested in
6. **Address** - Customer's address
7. **Message** - Customer's message content
8. **Status** - Message status (new, contacted, converted, archived)
9. **Timestamp** - When the message was received

---

## **🔍 HOW TO ACCESS THE FILES:**

### **Method 1: File Explorer (Easiest)**
1. **Open File Explorer**
2. **Navigate to:** `C:\Users\asus\Downloads\SalonBooker\data\`
3. **Double-click** on `bookings.xlsx` or `contact-messages.xlsx`
4. **Files will open** in Microsoft Excel

### **Method 2: From Project Folder**
1. **Open your project folder:** `C:\Users\asus\Downloads\SalonBooker\`
2. **Double-click** the `data` folder
3. **Double-click** the Excel file you want to view

### **Method 3: Command Line**
```powershell
# Navigate to data folder
cd C:\Users\asus\Downloads\SalonBooker\data\

# List all files
dir *.xlsx

# Open bookings file
start bookings.xlsx

# Open contact messages file
start contact-messages.xlsx
```

---

## **📈 WHEN FILES ARE UPDATED:**

### **Bookings Excel (`bookings.xlsx`):**
- ✅ **Updated when:** Customer completes booking form
- ✅ **Trigger:** "Book Now" form submission
- ✅ **Automatic:** No manual intervention needed
- ✅ **Real-time:** Updated immediately after booking

### **Contact Messages Excel (`contact-messages.xlsx`):**
- ✅ **Updated when:** Customer submits contact form
- ✅ **Trigger:** "Send us a Message" form submission
- ✅ **Automatic:** No manual intervention needed
- ✅ **Real-time:** Updated immediately after message sent

---

## **📧 EMAIL NOTIFICATIONS:**

### **Booking Confirmations:**
- **Sent to:** `2akonsultant@gmail.com`
- **Subject:** "💐 New Booking Confirmation | [Customer Name] | Goodness Glamour Salon"
- **Content:** All booking details in professional email format
- **When:** Immediately after booking is created

### **Contact Messages:**
- **Sent to:** `2akonsultant@gmail.com`
- **Subject:** "💌 New Customer Message | [Customer Name] | Goodness Glamour Salon"
- **Content:** Customer details and message in elegant format
- **When:** Immediately after message is sent

---

## **🔧 TROUBLESHOOTING:**

### **If Excel Files Don't Exist:**
1. **Check folder:** Ensure `data` folder exists
2. **Create folder:** If missing, create `C:\Users\asus\Downloads\SalonBooker\data\`
3. **Restart server:** Files are created automatically on first booking/message

### **If Files Are Empty:**
1. **Test booking:** Make a test booking to populate data
2. **Check server logs:** Look for any errors in terminal
3. **Verify permissions:** Ensure write permissions to `data` folder

### **If Files Won't Open:**
1. **Check if file is locked:** Close any open Excel instances
2. **Try different Excel viewer:** Use Google Sheets or LibreOffice
3. **Check file format:** Ensure it's a valid `.xlsx` file

---

## **📱 MOBILE ACCESS:**

### **If You Need Mobile Access:**
1. **Upload to Google Drive:** Upload files to Google Drive
2. **Use Google Sheets:** Convert to Google Sheets format
3. **Email yourself:** Send files to your email
4. **Cloud storage:** Use OneDrive, Dropbox, etc.

---

## **💡 PRO TIPS:**

### **For Better Management:**
- ✅ **Regular Backups:** Copy files to backup location weekly
- ✅ **Sort Data:** Sort by date to see recent bookings first
- ✅ **Filter Views:** Use Excel filters to find specific data
- ✅ **Export Options:** Export to PDF for sharing with team
- ✅ **Data Analysis:** Use Excel charts to track booking trends

### **For Team Sharing:**
- ✅ **Shared Drive:** Put files in shared network drive
- ✅ **Cloud Sync:** Use OneDrive/Google Drive for team access
- ✅ **Regular Updates:** Send weekly summaries via email
- ✅ **Access Control:** Set permissions for team members

---

## **📋 QUICK REFERENCE:**

### **File Locations:**
```
📁 SalonBooker Project
├── 📁 data/
│   ├── 📊 bookings.xlsx          ← All customer bookings
│   ├── 📧 contact-messages.xlsx  ← All contact form messages
│   └── 📄 README.md             ← Documentation
├── 📁 client/                   ← Website frontend
├── 📁 server/                   ← Website backend
└── 📄 package.json             ← Project configuration
```

### **Full Paths:**
- **Bookings:** `C:\Users\asus\Downloads\SalonBooker\data\bookings.xlsx`
- **Messages:** `C:\Users\asus\Downloads\SalonBooker\data\contact-messages.xlsx`

---

## **🚀 GETTING STARTED:**

### **Step 1: Access Files**
1. Open File Explorer
2. Go to `C:\Users\asus\Downloads\SalonBooker\data\`
3. Double-click `bookings.xlsx`

### **Step 2: Make Test Booking**
1. Go to http://localhost:5000
2. Click "Book Now" button
3. Fill out booking form
4. Submit booking
5. Check Excel file - new row should appear!

### **Step 3: Check Email**
1. Check `2akonsultant@gmail.com`
2. Look for booking confirmation email
3. Verify all details are correct

---

**🎉 Your Excel files are ready to track all customer bookings and messages!**

**Location:** `C:\Users\asus\Downloads\SalonBooker\data\`

**Files:** `bookings.xlsx` and `contact-messages.xlsx`

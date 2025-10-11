# 📧 TESTING CONTACT MESSAGES IN DASHBOARD

## **Issue: Dashboard showing 0 messages**

### **Possible Causes:**

1. ✅ **Excel file exists** - `data/contact-messages.xlsx` is present
2. ⚠️ **File might be empty** - No messages submitted yet
3. ⚠️ **File might be open** - Temporary file `~$contact-messages.xlsx` detected
4. ⚠️ **Column names mismatch** - Excel columns don't match expected format

---

## **Solution Steps:**

### **Step 1: Close Excel File**
If you have `contact-messages.xlsx` open in Excel:
1. **Close Excel completely**
2. **Refresh the dashboard**

### **Step 2: Submit a Test Message**
1. Go to: `http://localhost:5000`
2. Scroll to **"Send us a Message"** form
3. Fill out:
   - Name: Test User
   - Phone: 9876543210
   - Service Interest: Hair Cut
   - Address: Test Address, Mumbai
   - Message: Testing dashboard
4. Click **"Send Message"**
5. Wait for success message
6. Check terminal logs for:
   ```
   ✅ Excel file updated: C:\Users\asus\Downloads\SalonBooker\data\contact-messages.xlsx
   ```

### **Step 3: Refresh Dashboard**
1. Go to dashboard: `http://localhost:5000/dashboard`
2. Change time range to **"All Time"**
3. You should see:
   - Messages count updated
   - Recent message in the list

---

## **Expected Excel Format:**

The `contact-messages.xlsx` file should have these columns:

| Message ID | Name | Phone | Email | Service Interest | Address | Message | Status | Timestamp |
|------------|------|-------|-------|-----------------|---------|---------|--------|-----------|
| MSG001 | Test User | 9876543210 | test@email.com | Hair Cut | Mumbai | Testing | new | 2024-01-15 14:30 |

---

## **Debugging Steps:**

### **Check Server Logs:**
When you refresh the dashboard, look for:
```
✅ Reading contact messages from: C:\...\data\contact-messages.xlsx
📄 Sheet name: Sheet1
📊 Contact messages found: 0 (or number found)
📋 Sample data: { Name: '...', Phone: '...' }
```

### **If Still Showing 0:**

1. **File might be corrupted** - Create new test message
2. **Wrong sheet name** - Check if sheet is named something other than "Sheet1"
3. **No data rows** - Only headers, no actual data

---

## **Quick Test Command:**

Try this:
1. Close any Excel files
2. Submit a contact form message
3. Wait 2 seconds
4. Refresh dashboard
5. Check if message count increased

---

## **Current Status:**

According to terminal logs:
```
2:57:15 PM [express] GET /api/dashboard/messages 200 in 3ms :: []
```

This means:
- ✅ API is working (200 status)
- ❌ No messages found (empty array `[]`)
- 📝 File is either empty or has no data rows

---

## **Next Step:**

**Submit a test message through the contact form to populate the Excel file with data!**

Then the dashboard will show the statistics.


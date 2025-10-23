# 📱 MSG91 Flow API Setup Guide

## 🎯 **Your System IP Address**

**Your IP:** `27.4.222.246`

## 🔧 **Step 1: Whitelist Your IP in MSG91**

### **Login to MSG91 Dashboard:**
1. Go to: https://control.msg91.com/
2. Login with your MSG91 account
3. Go to **"Settings"** → **"IP Whitelisting"**
4. Add your IP: `27.4.222.246`
5. Save the configuration

### **Alternative Method:**
1. Go to: https://control.msg91.com/settings/ip-whitelisting
2. Click **"Add IP"**
3. Enter: `27.4.222.246`
4. Description: "Salon Booking System"
5. Click **"Save"**

---

## 🚀 **Step 2: Create SMS Template**

### **Create Template:**
1. Go to: https://control.msg91.com/template
2. Click **"Create Template"**
3. Use this template content:

```
💐 Goodness Glamour Salon

Hi {{VAR1}}!

✅ Your booking is confirmed!
📅 {{VAR2}} at {{VAR3}}
💇‍♀️ {{VAR4}}
💰 ₹{{VAR5}}
📍 {{VAR6}}

🆔 Booking ID: {{VAR7}}

📞 Need help? Call: 9036626642

Thank you for choosing us! 🌸
```

4. **Template Name:** "Salon Booking Confirmation"
5. **Template ID:** Note down the ID (e.g., "EnterSMStemplateID")
6. **Submit for approval** (usually takes 5-10 minutes)

---

## 📝 **Step 3: Update Your Configuration**

### **Add Template ID to .env:**
```env
# Add this line to your .env file
MSG91_TEMPLATE_ID=your_template_id_here
```

### **Example .env with Flow API:**
```env
PORT=5000
NODE_ENV=development
EMAIL_USER=2akonsultant@gmail.com
EMAIL_PASSWORD=ikgipsvgcfthwpoq
MSG91_API_KEY=473975AdtcKy8T9z68f15945P1
MSG91_SENDER_ID=GLAMOR
MSG91_TEMPLATE_ID=your_template_id_here
```

---

## 🧪 **Step 4: Test Flow API**

### **Test Command:**
```bash
curl --location 'https://control.msg91.com/api/v5/flow' \
--header 'accept: application/json' \
--header 'authkey: 473975AdtcKy8T9z68f15945P1' \
--header 'content-type: application/json' \
--data '{
  "template_id": "your_template_id_here", 
  "short_url": "1",
  "realTimeResponse": "1",
  "recipients": [
    {
      "mobiles": "",
      "VAR1": "Priya",
      "VAR2": "15 Jan 2024",
      "VAR3": "2:00 PM",
      "VAR4": "Hair Cut, Hair Color",
      "VAR5": "1500",
      "VAR6": "123 Main Street, Mumbai",
      "VAR7": "BK-2024-001"
    }
  ]
}'
```

---

## 🔄 **Step 5: Update SMS Service**

The enhanced SMS service will automatically use Flow API when template ID is configured, and fallback to basic API if not.

---

## 📊 **Benefits of Flow API:**

✅ **Template-based messaging** - Professional templates  
✅ **Variable substitution** - Dynamic content  
✅ **Better delivery rates** - Higher success rate  
✅ **Approved templates** - No spam issues  
✅ **Real-time responses** - Instant delivery status  

---

## 🎯 **Quick Setup Checklist:**

- [ ] Whitelist IP: `27.4.222.246`
- [ ] Create SMS template in MSG91
- [ ] Get template ID
- [ ] Add template ID to .env file
- [ ] Test Flow API
- [ ] Update booking system

---

## 🆘 **Troubleshooting:**

### **IP Whitelisting Issues:**
- Make sure IP is exactly: `27.4.222.246`
- Wait 5-10 minutes after adding IP
- Check if you're behind a VPN (disable if needed)

### **Template Issues:**
- Ensure template is approved
- Use exact template ID
- Check variable names match

### **API Issues:**
- Verify authkey is correct
- Check template ID is valid
- Ensure IP is whitelisted

---

## 📞 **Need Help?**

- **MSG91 Support:** https://msg91.com/contact
- **Dashboard:** https://control.msg91.com/
- **Documentation:** https://docs.msg91.com/

**Your IP is ready to be whitelisted: 27.4.222.246**

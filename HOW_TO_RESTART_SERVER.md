# 🔄 HOW TO RESTART SERVER

## **QUICK RESTART METHODS:**

---

## **METHOD 1: Using Terminal (Recommended)**

### **Step 1: Stop the Server**
In your terminal/PowerShell where the server is running:
- Press `Ctrl + C` (hold Ctrl and press C)
- This will stop the server gracefully

### **Step 2: Start the Server**
```powershell
npm run dev
```

---

## **METHOD 2: Force Kill and Restart (If server is stuck)**

### **In PowerShell:**
```powershell
# Kill all node processes
Get-Process -Name "node","tsx" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait a moment
Start-Sleep -Seconds 2

# Start server
npm run dev
```

### **One-Line Command:**
```powershell
Get-Process -Name "node","tsx" -ErrorAction SilentlyContinue | Stop-Process -Force; Start-Sleep -Seconds 2; npm run dev
```

---

## **METHOD 3: Using Task Manager (Windows)**

### **Step 1: Open Task Manager**
- Press `Ctrl + Shift + Esc`
- Or right-click taskbar and select "Task Manager"

### **Step 2: Find and End Node Processes**
- Click "Details" tab
- Find all processes named `node.exe` or `tsx.exe`
- Right-click each → "End Task"

### **Step 3: Start Server**
- Open PowerShell in project folder
- Run: `npm run dev`

---

## **WHEN TO RESTART:**

### **You MUST restart when:**
- ✅ Changed `.env` file
- ✅ Modified server code (files in `server/` folder)
- ✅ Updated dependencies (`package.json`)
- ✅ Server crashed or showing errors
- ✅ Changed configuration files

### **You DON'T need to restart for:**
- ❌ Client-side changes (files in `client/src/`)
- ❌ CSS/styling changes
- ❌ React component updates
- ❌ Frontend code changes (Vite handles hot reload)

---

## **VERIFY SERVER IS RUNNING:**

### **Check in Terminal:**
You should see:
```
[express] serving on port 5000
```

### **Check in Browser:**
Visit: http://localhost:5000
- If page loads → Server is running ✅
- If "Can't reach" → Server is not running ❌

### **Check with PowerShell:**
```powershell
Get-Process -Name "node","tsx" -ErrorAction SilentlyContinue
```
- Shows processes → Server is running ✅
- Shows nothing → Server is not running ❌

---

## **COMMON ISSUES:**

### **Issue 1: Port Already in Use**
**Error:** `EADDRINUSE: address already in use :::5000`

**Solution:**
```powershell
# Kill all node processes
Get-Process -Name "node","tsx" -ErrorAction SilentlyContinue | Stop-Process -Force

# Wait and restart
Start-Sleep -Seconds 2
npm run dev
```

### **Issue 2: Server Won't Start**
**Check:**
1. Are you in the correct directory? (`cd C:\Users\asus\Downloads\SalonBooker`)
2. Are dependencies installed? (`npm install`)
3. Is `.env` file present?
4. Check for syntax errors in server code

### **Issue 3: Changes Not Reflecting**
**Solution:**
1. Stop server (Ctrl + C)
2. Clear cache: `npm run dev -- --force`
3. Or hard refresh browser: `Ctrl + Shift + R`

---

## **QUICK REFERENCE:**

### **Start Server:**
```powershell
npm run dev
```

### **Stop Server:**
```
Ctrl + C
```

### **Force Restart:**
```powershell
Get-Process -Name "node","tsx" -ErrorAction SilentlyContinue | Stop-Process -Force; npm run dev
```

### **Check if Running:**
```powershell
Get-Process -Name "node","tsx" -ErrorAction SilentlyContinue
```

---

## **DEVELOPMENT WORKFLOW:**

### **Normal Development:**
1. Make changes to client code
2. Save file
3. Browser auto-refreshes (no restart needed)

### **Server Changes:**
1. Make changes to server code
2. Stop server (Ctrl + C)
3. Start server (`npm run dev`)
4. Refresh browser

### **Environment Changes:**
1. Update `.env` file
2. Force kill processes
3. Restart server
4. Verify changes

---

**🎯 Most Common Command:**
```powershell
npm run dev
```

**🔥 Emergency Restart:**
```powershell
Get-Process -Name "node","tsx" -ErrorAction SilentlyContinue | Stop-Process -Force; npm run dev
```

---

**💡 TIP:** Keep the terminal window visible while developing so you can see server logs and errors in real-time!

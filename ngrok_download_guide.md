# ngrok Download Guide - Microsoft Defender Solutions

## 🛡️ Solution 1: Allow the download (Recommended)

### Step 1: Temporarily disable Microsoft Defender
1. Open **Windows Security**
2. Go to **Virus & threat protection**
3. Click **Manage settings** under "Virus & threat protection settings"
4. Turn OFF **Real-time protection** (temporarily)
5. Download ngrok zip file
6. Turn ON **Real-time protection** again

### Step 2: Add exclusion for ngrok
1. In **Windows Security** → **Virus & threat protection**
2. Click **Manage settings** under "Virus & threat protection settings"
3. Scroll down to **Exclusions**
4. Click **Add or remove exclusions**
5. Click **Add an exclusion** → **Folder**
6. Select the folder where you'll extract ngrok (e.g., C:\ngrok\)

---

## 🔄 Solution 2: Alternative download methods

### Method A: Use PowerShell to download
```powershell
# Open PowerShell as Administrator
# Download ngrok directly
Invoke-WebRequest -Uri "https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip" -OutFile "ngrok.zip"

# Extract
Expand-Archive -Path "ngrok.zip" -DestinationPath "C:\ngrok\"
```

### Method B: Use curl
```bash
# Download with curl
curl -L -o ngrok.zip https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip

# Extract with PowerShell
Expand-Archive -Path "ngrok.zip" -DestinationPath "C:\ngrok\"
```

### Method C: Use alternative mirrors
```bash
# Alternative download URL
https://github.com/inconshreveable/ngrok/releases/latest/download/ngrok-windows-amd64.zip
```

---

## 🚀 Solution 3: Use portable version

### Download portable ngrok
1. Go to: https://ngrok.com/download
2. Choose **"Windows (Portable)"**
3. Download the standalone .exe file
4. Place it in your SalonBooker directory
5. Use it directly without installation

---

## 🛠️ Solution 4: Manual installation

### Step 1: Create ngrok directory
```bash
mkdir C:\ngrok
cd C:\ngrok
```

### Step 2: Download using browser
1. Open browser
2. Go to: https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-windows-amd64.zip
3. When Defender blocks it, click **"More info"**
4. Click **"Run anyway"** or **"Keep"**

### Step 3: Extract manually
1. Right-click the downloaded zip
2. Select **"Extract All"**
3. Choose destination: C:\ngrok\

---

## 🔧 Solution 5: Use alternative tools

### Option A: LocalTunnel (npm based)
```bash
# Install Node.js first
npm install -g localtunnel
lt --port 7001
```

### Option B: Serveo (SSH based)
```bash
# No installation needed
ssh -R 80:localhost:7001 serveo.net
```

### Option C: Cloudflare Tunnel
```bash
# Download cloudflared
# Run: cloudflared tunnel --url http://localhost:7001
```

---

## ✅ Verification Steps

### After downloading ngrok:
1. Open Command Prompt
2. Navigate to ngrok directory: `cd C:\ngrok`
3. Test: `ngrok version`
4. Should show: `ngrok version 3.x.x`

### If still blocked:
1. Right-click ngrok.exe
2. Select **"Properties"**
3. Check **"Unblock"** at bottom
4. Click **"OK"**

---

## 🎯 Quick Setup After Download

### Once ngrok is downloaded:
```bash
# 1. Get auth token from https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_TOKEN

# 2. Start tunnel
ngrok http 7001

# 3. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
# 4. Update .env file: WEBHOOK_BASE_URL=https://abc123.ngrok.io
```

---

## 🚨 Troubleshooting

### Issue: "ngrok not recognized"
**Solution:** Add ngrok to PATH or use full path
```bash
C:\ngrok\ngrok.exe http 7001
```

### Issue: Still blocked after extraction
**Solution:** Run as Administrator or add folder exclusion

### Issue: Connection refused
**Solution:** Make sure your voice assistant is running on port 7001 first

# Hybrid Deployment - Quick Start Guide

## ✅ Phase 1 & 2: COMPLETED
Your backend code has been modified and the startup script has been created.

## 🚀 Next Steps

### Phase 3: Install ngrok (5 minutes)

#### Mac (you're on Mac):
```bash
brew install ngrok
```

#### After installation, configure with your authtoken:
1. Sign up at: https://dashboard.ngrok.com/signup (FREE)
2. Get your authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
3. Configure:
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

---

### Phase 4: Test Locally (10 minutes)

#### Step 4.1: Test local mode first
```bash
cd backend
export SCRAPER_MODE=local
python3 app.py
```

In another terminal:
```bash
curl -X POST http://localhost:3000/api/cma \
  -H "Content-Type: application/json" \
  -d '{"psgc_province_code":"1376","property_type":"condo","count":10}'
```

Expected: Scraping logs and property data returned.

Press Ctrl+C to stop.

#### Step 4.2: Start with ngrok tunnel
```bash
cd backend
./start-scraper.sh
```

**Expected output:**
```
🚀 Kairos Local Scraper Service
✅ Backend is ready
📡 NGROK URL: https://abc-123-def.ngrok-free.app
```

**IMPORTANT:** 
- Copy the ngrok URL shown
- Keep this terminal window open!

---

### Phase 5: Configure Render (10 minutes)

#### Step 5.1: Commit and push changes
```bash
git add backend/app.py backend/start-scraper.sh
git commit -m "Add remote scraper mode for hybrid deployment"
git push origin main
```

#### Step 5.2: Configure Render environment variables
1. Go to: https://dashboard.render.com
2. Find your `kairos-backend` service
3. Click **Environment** tab
4. Add these variables:

**Variable 1:**
- Key: `SCRAPER_MODE`
- Value: `remote`

**Variable 2:**
- Key: `SCRAPER_URL`
- Value: `[YOUR-NGROK-URL-FROM-STEP-4.2]`

5. Click **Save Changes**

Render will auto-deploy (~2-3 minutes).

---

### Phase 6: Test End-to-End

1. **Verify local scraper is running** (terminal should show ngrok URL)
2. **Open your Kairos frontend**
3. **Search for**: "BGC, Taguig"
4. **Generate Report**

#### Watch for success:
- ✅ Local terminal shows scraping activity
- ✅ Render logs show "Remote mode: Forwarding..."
- ✅ Frontend displays 50+ properties
- ✅ No 403 errors

---

## Daily Operation

### To START Kairos:
```bash
cd backend
./start-scraper.sh
```
Keep terminal open all day.

### To STOP Kairos:
Press `Ctrl+C` in the terminal.

### If ngrok URL changes:
1. Check terminal for new URL
2. Update `SCRAPER_URL` in Render dashboard
3. Wait for redeploy (~2 min)

---

## Troubleshooting

### "Remote scraper unavailable" (503)
- Is `start-scraper.sh` running?
- Did laptop go to sleep?
- Restart: `./start-scraper.sh`

### "Scraper timeout" (504)
- Wait and retry
- Or increase `SCRAPER_TIMEOUT_SEC` in Render

### ngrok URL changed
- Get new URL from terminal
- Update `SCRAPER_URL` in Render
- Save and wait for redeploy

---

## Important Reminders

For Kairos to work, you MUST:
- ✅ Keep laptop on and connected to internet
- ✅ Keep terminal running `start-scraper.sh` open
- ✅ Not let laptop sleep
- ✅ Update Render if ngrok URL changes

### Prevent Mac from sleeping:
```bash
# Prevent sleep while plugged in
sudo pmset -c sleep 0
sudo pmset -c displaysleep 10
```

---

## Quick Commands Reference

**Start scraper:**
```bash
cd backend && ./start-scraper.sh
```

**Check if running:**
```bash
curl http://localhost:3000/health
```

**Get ngrok URL:**
```bash
curl -s http://localhost:4040/api/tunnels | grep public_url
```

**View logs:**
```bash
tail -f /tmp/kairos-backend.log
tail -f /tmp/kairos-ngrok.log
```

---

## What Was Changed

### backend/app.py
- Added `import requests`
- Added `SCRAPER_MODE` and `SCRAPER_URL` config
- Added remote mode forwarding logic before local scraper execution

### backend/start-scraper.sh (NEW)
- Startup script that runs Flask + ngrok
- Provides ngrok URL automatically
- Handles cleanup on exit

---

## ngrok Backup Codes

**IMPORTANT:** Store these backup codes securely. Use them to recover access to your ngrok account if you lose access to your authentication method.

```
6JFZDCYK7B
SQJ8GUH3ZU
HQWHB6ZMUT
GJY53TC8CJ
YDAPEDNSEC
JEPMC3WEEG
KJ7A65GZEQ
P8WK6ER34P
5ZDGAET4D9
KB5ZZH2M2H
```

⚠️ **Each code can only be used once. Keep this file secure and private.**

---

## Next: Phase 3 - Install ngrok

Run this command to install ngrok on your Mac:
```bash
brew install ngrok
```

Then follow the ngrok signup and configuration steps above.


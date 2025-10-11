# ✅ Testing Checklist - Salon Booking Application

## 🎯 Quick Functionality Test Guide

### ⚠️ Before Testing
Make sure:
1. Server is running: `npm run dev` in `/Users/varunpatil/Downloads/SalonBooker`
2. Open browser at: http://localhost:5000
3. For AI chatbot: Configure `OPENAI_API_KEY` in `.env` file

---

## 1. ✅ Backend API Testing

### Test Services API:
```bash
# Get all services (should return 11 services)
curl http://localhost:5000/api/services | jq

# Get women's services (should return 7 services)
curl http://localhost:5000/api/services/category/women | jq

# Get kids services (should return 4 services)
curl http://localhost:5000/api/services/category/kids | jq
```

**Expected Result:**
- All endpoints return JSON data
- Services have id, name, description, category, prices, duration, imageUrl

---

## 2. 🎨 Frontend Pages Testing

### Home Page (http://localhost:5000)
- [ ] Hero section displays with salon image
- [ ] "Virtual Salon at Your Doorstep" heading visible
- [ ] QR code scanner section is present
- [ ] "Book Appointment" button works
- [ ] "Call: 9036626642" button is clickable
- [ ] Featured services display (6 services)
- [ ] "How It Works" section shows 4 steps
- [ ] AI assistant showcase section visible
- [ ] Testimonials section shows 3 reviews
- [ ] Contact form is present
- [ ] Footer displays with links
- [ ] Floating AI chat button (bottom right) is visible

### Services Page (http://localhost:5000/services)
- [ ] All 11 services display correctly
- [ ] Filter by category works (Women's / Kids)
- [ ] Service cards show:
  - Service image
  - Name and description
  - Price range
  - Duration
  - "Ask AI" button
  - "Book Now" button
- [ ] Clicking service cards opens details/AI chat

### Booking Page (http://localhost:5000/booking)
- [ ] Booking form displays
- [ ] Form fields present:
  - Name
  - Phone
  - Email (optional)
  - Address
  - Service selection
  - Date/time picker
  - Notes
- [ ] Form validation works
- [ ] Submit button is functional

---

## 3. 🤖 AI Chatbot Testing

### Without OpenAI API Key:
**What to test:**
1. Click any "Book Appointment" button
2. AI chat modal opens
3. Initial greeting appears
4. Type a message and send
5. Receive fallback error message

**Expected Behavior:**
- Chat opens successfully
- Shows: "I apologize, but I'm having trouble responding right now. Please call us at 9036626642 for immediate assistance."

### With OpenAI API Key Configured:
**What to test:**
1. Open AI chat
2. Ask: "What services do you offer?"
3. Ask: "I want a haircut for my daughter"
4. Ask: "What are your prices?"
5. Ask: "Book an appointment for Saturday"

**Expected Behavior:**
- Real-time AI responses
- Contextual conversation
- Service recommendations
- Booking assistance

**Test Command:**
```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tell me about your hair coloring services",
    "sessionId": "test-123"
  }' | jq
```

---

## 4. 📷 QR Scanner Testing

### What to test:
1. Click "Open Camera Scanner" button on homepage
2. Allow camera permissions (browser will prompt)
3. Camera view should display
4. Click "Start Scanning" button
5. Wait for mock scan to complete (2 seconds)
6. AI chat opens automatically

**Note:** The scanner uses a mock implementation. For production, integrate real QR detection library.

**Expected Behavior:**
- Camera permission request
- Live camera feed displays
- Scanning overlay visible
- After scan: AI chat opens with greeting
- Toast notification: "QR Code Scanned!"

---

## 5. 📱 Responsive Design Testing

### Test on different screen sizes:

**Desktop (1920x1080):**
- [ ] All sections display properly
- [ ] Navigation menu is horizontal
- [ ] Services in 3-column grid
- [ ] Images load correctly

**Tablet (768x1024):**
- [ ] Layout adjusts gracefully
- [ ] Services in 2-column grid
- [ ] Navigation remains functional
- [ ] No horizontal scrolling

**Mobile (375x667):**
- [ ] Navigation becomes hamburger menu
- [ ] Services stack vertically
- [ ] All buttons are tap-friendly
- [ ] Text is readable
- [ ] Images are properly sized

**Browser DevTools:**
```
1. Open browser DevTools (F12)
2. Click "Toggle device toolbar" (Ctrl+Shift+M)
3. Test different device presets:
   - iPhone 12 Pro
   - iPad
   - Desktop HD
```

---

## 6. 💾 Data Management Testing

### Customer Creation:
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "phone": "9876543210",
    "email": "test@example.com",
    "address": "123 Test Street, Bangalore"
  }' | jq
```

**Expected Result:**
- Returns customer object with generated ID
- Status 201 Created

### Booking Creation:
```bash
# First, get a service ID
SERVICE_ID=$(curl -s http://localhost:5000/api/services | jq -r '.[0].id')

# Then create a booking (replace CUSTOMER_ID with ID from above)
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d "{
    \"customerId\": \"CUSTOMER_ID\",
    \"serviceIds\": [\"$SERVICE_ID\"],
    \"appointmentDate\": \"2025-10-15T10:00:00Z\",
    \"notes\": \"Test booking\"
  }" | jq
```

**Expected Result:**
- Returns booking object with ID
- Status 201 Created
- Total amount calculated based on service price

---

## 7. 🔍 Browser Console Testing

### Check for errors:
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate through all pages
4. Look for:
   - ❌ No red error messages
   - ⚠️ Minimal warnings (deprecation warnings are okay)
   - ✅ Clean console = good!

### Network Tab:
1. Open DevTools → Network tab
2. Reload the page
3. Check:
   - All API calls return 200 status
   - `/api/services` loads successfully
   - Images load (200 status, not 404)
   - No failed requests

---

## 8. 🧪 Feature-by-Feature Test

### Navigation:
- [ ] Logo/home link works
- [ ] Services link navigates correctly
- [ ] All menu items functional
- [ ] Mobile menu toggle works

### Service Cards:
- [ ] Images load from Unsplash
- [ ] "Ask AI" button opens chat
- [ ] "Book Now" button opens chat/booking
- [ ] Price range displays correctly
- [ ] Duration shows in minutes

### Forms:
- [ ] Input validation works
- [ ] Required fields marked
- [ ] Phone number format validation
- [ ] Email format validation
- [ ] Date picker works
- [ ] Submit shows success/error toast

### AI Chat:
- [ ] Opens on click
- [ ] Closes with X button
- [ ] Messages send on Enter key
- [ ] Scrolls to latest message
- [ ] Shows typing indicator
- [ ] Displays timestamps
- [ ] Handles errors gracefully

### QR Scanner:
- [ ] Camera permission request
- [ ] Displays camera feed
- [ ] Scanning UI overlay
- [ ] Success notification
- [ ] Error handling for denied permissions

---

## 9. 🚨 Error Handling Testing

### Test error scenarios:

**1. Network Failure:**
- Stop the server
- Try clicking "Book Appointment"
- Should show error message

**2. Invalid Data:**
```bash
# Try creating booking with invalid customer ID
curl -X POST http://localhost:5000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "invalid-id",
    "serviceIds": ["test"],
    "appointmentDate": "2025-10-15T10:00:00Z"
  }'
```

**Expected:** Error message about customer not found

**3. Missing Required Fields:**
```bash
# Try creating customer without required fields
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name": "Test"}' | jq
```

**Expected:** Validation error about missing fields

---

## 10. ⚡ Performance Testing

### Page Load Time:
1. Open DevTools → Network tab
2. Reload page
3. Check "Load" time at bottom
4. Should be < 3 seconds

### API Response Time:
```bash
# Measure service API response time
time curl http://localhost:5000/api/services > /dev/null
```

**Expected:** < 500ms

### Image Loading:
- All images should load within 2-3 seconds
- No broken image placeholders
- Lazy loading for off-screen images

---

## 11. 🎨 UI/UX Testing

### Visual Check:
- [ ] Colors are consistent (primary, accent, secondary)
- [ ] Fonts load correctly (Playfair Display, Inter)
- [ ] Buttons have hover effects
- [ ] Cards have shadow effects
- [ ] Animations are smooth
- [ ] No layout shifts
- [ ] No text overflow
- [ ] Icons render properly

### Accessibility:
- [ ] Tab navigation works
- [ ] Focus indicators visible
- [ ] Buttons have aria labels
- [ ] Alt text on images
- [ ] Proper heading hierarchy (h1, h2, h3)
- [ ] Color contrast meets WCAG standards

---

## 12. 🗄️ Storage Testing

### Current Setup (In-Memory):
**Data Persistence Test:**
1. Create a customer via API
2. Verify customer exists (GET request)
3. Restart the server
4. Try to fetch the customer again
5. **Expected:** Customer not found (data cleared on restart)

**Services Persistence:**
1. Check services: `curl http://localhost:5000/api/services`
2. Restart server
3. Check again
4. **Expected:** Services still exist (re-initialized on startup)

---

## 13. 🔐 Security Testing

### API Endpoints:
- [ ] No sensitive data in error messages
- [ ] No SQL injection vulnerabilities (using ORM)
- [ ] Input validation on all endpoints
- [ ] CORS configured properly

### Environment Variables:
- [ ] `.env` file exists
- [ ] API keys not exposed in frontend
- [ ] No secrets in console logs

---

## 🎉 Success Criteria

Your application is working correctly if:

✅ **Backend:**
- All 11 services load via API
- Customer and booking creation works
- AI chat endpoint responds (with or without OpenAI key)

✅ **Frontend:**
- All pages load without errors
- Navigation works smoothly
- Services display correctly
- Forms are functional
- UI is responsive on all devices

✅ **Features:**
- AI chatbot opens and displays UI
- QR scanner requests camera permission
- Booking flow is intuitive
- Error messages are user-friendly

✅ **No Critical Issues:**
- No console errors (warnings are okay)
- No broken images
- No layout issues
- No infinite loading states

---

## 🐛 Known Limitations

### Current Setup:

1. **In-Memory Storage:**
   - Data resets on server restart
   - Not suitable for production
   - Upgrade to PostgreSQL for persistence

2. **AI Chatbot:**
   - Requires OpenAI API key
   - Costs money per API call
   - Without key: shows fallback message

3. **QR Scanner:**
   - Mock implementation for demo
   - Doesn't actually scan real QR codes
   - Integrate jsQR library for production

4. **No Authentication:**
   - No user login system
   - No admin dashboard
   - Anyone can create bookings

5. **No Payment Integration:**
   - Bookings don't collect payment
   - No online payment gateway
   - Add Stripe/Razorpay for production

---

## 🔧 Common Issues & Solutions

### Issue: Server won't start
**Solution:**
```bash
# Kill existing process on port 5000
lsof -ti:5000 | xargs kill -9
# Start again
npm run dev
```

### Issue: AI chatbot not responding
**Solution:**
1. Check if OpenAI API key is set in `.env`
2. Verify API key is valid at https://platform.openai.com
3. Check server logs for errors: `tail -f /tmp/server.log`

### Issue: Images not loading
**Solution:**
- Check internet connection (images from Unsplash)
- View browser console for 404 errors
- Ensure firewall allows image requests

### Issue: Camera not working in QR scanner
**Solution:**
1. Check browser permissions
2. Use HTTPS in production (HTTP only works on localhost)
3. Try different browser (Chrome/Firefox)

---

## 📊 Test Summary Template

After testing, fill this out:

```
Date: ___________
Tester: ___________

✅ Passed Tests: ___ / 13
❌ Failed Tests: ___

Critical Issues:
1. 
2. 

Minor Issues:
1.
2.

Notes:


Overall Status: [ ] READY  [ ] NEEDS WORK
```

---

## 🚀 Next Steps After Testing

Once all tests pass:

1. **For Development:**
   - Continue building features
   - Add more services
   - Customize UI/branding
   - Integrate real payment system

2. **For Production:**
   - Set up PostgreSQL database
   - Configure production environment
   - Add authentication system
   - Implement real QR scanning
   - Set up monitoring and logging
   - Deploy to hosting platform

3. **For Deployment Guide:**
   - See `LOCAL_SETUP_GUIDE.md` for deployment notes
   - Consider platforms: Vercel, Heroku, Railway, AWS
   - Set up domain and SSL certificate

---

**Happy Testing! 🎉**

If you encounter any issues during testing, refer to the troubleshooting section in `LOCAL_SETUP_GUIDE.md`.


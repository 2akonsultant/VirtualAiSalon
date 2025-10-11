# Goodness Glamour Salon - AI-Powered Beauty Services

A modern, AI-powered salon booking system with doorstep services for women and kids.

## 🌟 Features

### Core Functionality
- **AI Chatbot** - 24/7 customer support and service recommendations
- **Online Booking** - Easy appointment scheduling with date/time selection
- **Doorstep Services** - Professional beauty services at your location
- **QR Code Integration** - Quick access via QR codes on flyers and products
- **Email Notifications** - Automatic booking confirmations for customers and admin

### Admin Dashboard
- **Real-time Analytics** - Booking statistics, revenue tracking, popular services
- **Customer Management** - View all bookings and contact messages
- **Data Export** - Excel files for bookings and contact messages
- **Time-based Filtering** - View data for today, week, month, or all time

### Services Offered
- **Women's Hair Services** - Cut, styling, coloring, spa treatments
- **Kids Hair Services** - Fun styles, party looks, creative braiding
- **Bridal & Party Styling** - Special occasion hair and makeup
- **Hair Treatments** - Spa, coloring, and therapeutic treatments

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Wouter** for routing
- **Shadcn/ui** for beautiful components
- **Tailwind CSS** for styling
- **TanStack Query** for state management
- **Recharts** for data visualization

### Backend
- **Express.js** with TypeScript
- **OpenAI GPT-4o-mini** for AI chatbot
- **Nodemailer** for email notifications
- **XLSX** for Excel file operations
- **Drizzle ORM** for data management

## 📦 Installation

1. **Clone the repository**
```bash
git clone https://github.com/2akonsultant/VirtualAiSalon.git
cd VirtualAiSalon
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key
EMAIL_USER=2akonsultant@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
NODE_ENV=development
```

4. **Run the development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## 🔧 Configuration

### Email Setup
1. Enable 2-Factor Authentication on Gmail
2. Generate an App Password for the salon booking system
3. Add the App Password to your `.env` file

### AI Chatbot
- Configure your OpenAI API key in the `.env` file
- The chatbot is trained to answer questions about salon services, prices, and timings

## 📱 Usage

### For Customers
1. **Scan QR Code** from flyers or salon materials
2. **Chat with AI** to get service recommendations
3. **Book Appointment** by selecting services, date, and time
4. **Receive Confirmation** via email with all booking details

### For Admin
1. **Access Dashboard** at `/dashboard` (password: admin123)
2. **View Analytics** - bookings, revenue, popular services
3. **Manage Data** - export Excel files, view customer messages
4. **Monitor Activity** - real-time updates with time filtering

## 🎨 Design Features

- **Floral Theme** - Elegant pink and pastel color palette
- **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- **Modern UI** - Clean, professional interface with smooth animations
- **Accessibility** - WCAG compliant with proper contrast and navigation

## 📊 Data Management

- **Excel Integration** - All bookings and messages saved to Excel files
- **Real-time Updates** - Dashboard refreshes every 5 seconds
- **Data Export** - Easy access to customer data in `data/` folder
- **Backup System** - Automatic data saving with timestamps

## 🌐 Deployment

The application is ready for deployment on Vercel:

1. **Push to GitHub** (already done)
2. **Connect to Vercel** and import the repository
3. **Set Environment Variables** in Vercel dashboard
4. **Deploy** - automatic deployments on every push

## 📞 Contact

- **Phone:** 9036626642
- **Email:** 2akonsultant@gmail.com
- **Service Hours:** Mon - Sun: 9:00 AM - 8:00 PM
- **Service Area:** City-wide doorstep services

## 📄 License

This project is licensed under the MIT License.

---

**Goodness Glamour Salon** - Bringing premium beauty services to your doorstep! 💄✨

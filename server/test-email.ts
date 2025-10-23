import 'dotenv/config';
import { sendOTPEmail, testEmailConfiguration, sendContactEmail, sendCustomerBookingConfirmation } from './email-service';
import { generateOTP } from './otp-service';

interface ContactMessage {
  name: string;
  phone: string;
  serviceInterest: string;
  address: string;
  message?: string;
  timestamp: string;
}

interface BookingData {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  appointmentDate: string;
  appointmentTime: string;
  services: string[];
  totalAmount: number;
  notes: string;
  timestamp: string;
}

async function testEmailService() {
  console.log('🧪 Testing Email Service Configuration...\n');

  // Check environment variables
  console.log('📋 Environment Variables:');
  console.log(`  EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
  console.log(`  EMAIL_PORT: ${process.env.EMAIL_PORT || 'NOT SET'}`);
  console.log(`  EMAIL_USER: ${process.env.EMAIL_USER || 'NOT SET'}`);
  console.log(`  EMAIL_PASSWORD: ${process.env.EMAIL_PASSWORD ? 'SET (masked)' : 'NOT SET'}`);
  console.log(`  EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
  console.log(`  EMAIL_ENABLED: ${process.env.EMAIL_ENABLED || 'NOT SET'}\n`);

  // Test 1: Basic email configuration
  console.log('🔧 Test 1: Basic Email Configuration');
  try {
    const configTest = await testEmailConfiguration();
    if (configTest) {
      console.log('✅ Email configuration test passed\n');
    } else {
      console.log('❌ Email configuration test failed\n');
      return;
    }
  } catch (error) {
    console.error('❌ Email configuration test error:', error);
    return;
  }

  // Test 2: OTP Email
  console.log('🔧 Test 2: OTP Email');
  try {
    const testEmail = process.env.EMAIL_USER || '2akonsultant@gmail.com';
    const testName = 'Test User';
    const testOTP = generateOTP();
    
    console.log(`📧 Sending OTP email to: ${testEmail}`);
    console.log(`🔐 OTP Code: ${testOTP}`);
    
    const otpResult = await sendOTPEmail(testEmail, testName, testOTP);
    if (otpResult) {
      console.log('✅ OTP email sent successfully\n');
    } else {
      console.log('❌ OTP email failed\n');
    }
  } catch (error) {
    console.error('❌ OTP email error:', error);
  }

  // Test 3: Contact Form Email
  console.log('🔧 Test 3: Contact Form Email');
  try {
    const testContact: ContactMessage = {
      name: 'Test Customer',
      phone: '+91 9876543210',
      serviceInterest: 'Hair Cut & Styling',
      address: '123 Test Street, Test City',
      message: 'This is a test contact message',
      timestamp: new Date().toISOString()
    };

    console.log(`📧 Sending contact email for: ${testContact.name}`);
    const contactResult = await sendContactEmail(testContact);
    if (contactResult) {
      console.log('✅ Contact email sent successfully\n');
    } else {
      console.log('❌ Contact email failed\n');
    }
  } catch (error) {
    console.error('❌ Contact email error:', error);
  }

  // Test 4: Booking Confirmation Email
  console.log('🔧 Test 4: Booking Confirmation Email');
  try {
    const testBooking: BookingData = {
      id: 'TEST-BOOKING-001',
      customerName: 'Test Customer',
      customerEmail: process.env.EMAIL_USER || '2akonsultant@gmail.com',
      customerPhone: '+91 9876543210',
      customerAddress: '123 Test Street, Test City',
      appointmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      appointmentTime: '10:00 AM',
      services: ['Hair Cut & Styling', 'Facial & Cleanup'],
      totalAmount: 1500,
      notes: 'Test booking for email verification',
      timestamp: new Date().toISOString()
    };

    console.log(`📧 Sending booking confirmation to: ${testBooking.customerEmail}`);
    const bookingResult = await sendCustomerBookingConfirmation(testBooking);
    if (bookingResult) {
      console.log('✅ Booking confirmation email sent successfully\n');
    } else {
      console.log('❌ Booking confirmation email failed\n');
    }
  } catch (error) {
    console.error('❌ Booking confirmation email error:', error);
  }

  console.log('🎉 Email service testing completed!');
  console.log('\n📝 Next Steps:');
  console.log('1. Check your email inbox for test emails');
  console.log('2. If emails are not received, check:');
  console.log('   - Gmail App Password is correct');
  console.log('   - 2-Factor Authentication is enabled on Gmail');
  console.log('   - "Less secure app access" is enabled (if not using App Password)');
  console.log('3. Check spam/junk folder');
  console.log('4. Verify EMAIL_PASSWORD in .env file is the Gmail App Password');
}

// Run the test if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testEmailService()
    .then(() => {
      console.log('✅ Email test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Email test failed:', error);
      process.exit(1);
    });
}

export { testEmailService };

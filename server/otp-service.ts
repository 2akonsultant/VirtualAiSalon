import crypto from 'crypto';
import { sendOTPEmail } from './email-service';

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Get OTP expiry time (2 minutes from now)
 */
export function getOTPExpiry(): Date {
  const expiry = new Date();
  expiry.setMinutes(expiry.getMinutes() + 2); // 2 minutes
  return expiry;
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(otpExpiry: Date | null): boolean {
  if (!otpExpiry) return true;
  return new Date() > otpExpiry;
}

/**
 * Validate OTP format (6 digits)
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}

/**
 * Check if too many OTP attempts (prevent brute force)
 */
export function isTooManyAttempts(attempts: number): boolean {
  return attempts >= 5; // Max 5 attempts
}

/**
 * Send OTP via email with fallback to console logging
 */
export async function sendOTPWithEmail(
  email: string,
  name: string,
  otp: string
): Promise<{ success: boolean; method: 'email' | 'console' }> {
  try {
    console.log(`📧 Attempting to send OTP email to: ${email}`);
    
    const emailSent = await sendOTPEmail(email, name, otp);
    
    if (emailSent) {
      console.log(`✅ OTP email sent successfully to ${email}`);
      return { success: true, method: 'email' };
    } else {
      // Fallback to console logging for development
      console.log(`⚠️ Email failed, logging OTP to console for development`);
      console.log(`🔐 OTP for ${name} (${email}): ${otp}`);
      console.log(`⏰ OTP expires in 2 minutes`);
      return { success: true, method: 'console' };
    }
  } catch (error) {
    console.error('❌ Error sending OTP:', error);
    // Fallback to console logging
    console.log(`🔐 OTP for ${name} (${email}): ${otp}`);
    console.log(`⏰ OTP expires in 2 minutes`);
    return { success: true, method: 'console' };
  }
}


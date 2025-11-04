import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { PrismaClient, UserRole } from '@prisma/client';
import { CreateUserRequest, LoginRequest, JWTPayload } from '../types';
import { logDatabase } from '../utils/logger';
import { NotificationIntegrationService } from './notificationIntegrationService';
import { emailService } from './emailService';

const prisma = new PrismaClient();

export class AuthService {
  static async register(userData: CreateUserRequest) {
    const { email, password, name, phone, role = UserRole.USER } = userData;

    logDatabase('insert', 'users', { email, name, role });

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new Error('User already exists with this email');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        emailVerifyToken,
        emailVerifyExpiry,
        isEmailVerified: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        avatar: true,
        isEmailVerified: true,
        createdAt: true
      }
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.name, emailVerifyToken);
      console.log(`✅ Verification email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // Log for debugging but don't fail registration
      console.log(`Verification URL (fallback): ${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${emailVerifyToken}`);
    }

    // Generate JWT token (but user must verify email before logging in)
    const token = this.generateToken(user.id, user.email, user.role);

    // Send welcome notification
    try {
      await NotificationIntegrationService.sendWelcomeNotification(user.id, user.name);
    } catch (error) {
      console.error('Failed to send welcome notification:', error);
      // Don't fail the registration if welcome notification fails
    }

    return { user, token, requiresEmailVerification: true };
  }

  static async login(loginData: LoginRequest) {
    const { email, password } = loginData;

    logDatabase('select', 'users', { email, operation: 'login' });

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new Error('Please verify your email before logging in. Check your inbox for the verification link.');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // Generate JWT token
    const token = this.generateToken(user.id, user.email, user.role);

    const { password: _, emailVerifyToken: __, emailVerifyExpiry: ___, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static generateToken(userId: string, email: string, role: UserRole): string {
    const payload: JWTPayload = {
      userId,
      email,
      role
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

    return jwt.sign(payload, secret as jwt.Secret, {
      expiresIn
    } as jwt.SignOptions);
  }

  static async changePassword(userId: string, oldPassword: string, newPassword: string) {
    logDatabase('update', 'users', { userId, operation: 'change_password' });

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new Error('Old password is incorrect');
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    return { message: 'Password changed successfully' };
  }

  static async verifyEmail(token: string) {
    logDatabase('update', 'users', { operation: 'verify_email' });

    // Find user with the verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerifyToken: token,
        emailVerifyExpiry: {
          gte: new Date() // Token not expired
        }
      }
    });

    if (!user) {
      throw new Error('Invalid or expired verification token');
    }

    // Update user - mark as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerifyToken: null,
        emailVerifyExpiry: null
      }
    });

    // Send welcome email after successful verification
    try {
      await emailService.sendWelcomeEmail(user.email, user.name);
      console.log(`✅ Welcome email sent to ${user.email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't fail verification if welcome email fails
    }

    return { message: 'Email verified successfully. You can now log in.' };
  }

  static async resendVerificationEmail(email: string) {
    logDatabase('select', 'users', { email, operation: 'resend_verification' });

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email is already verified');
    }

    // Generate new verification token
    const emailVerifyToken = crypto.randomBytes(32).toString('hex');
    const emailVerifyExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifyToken,
        emailVerifyExpiry
      }
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user.email, user.name, emailVerifyToken);
      console.log(`✅ Verification email resent to ${user.email}`);
    } catch (error) {
      console.error('Failed to resend verification email:', error);
      // Log for debugging but don't fail the resend operation
      console.log(`Verification URL (fallback): ${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${emailVerifyToken}`);
    }

    return { message: 'Verification email sent successfully' };
  }
} 
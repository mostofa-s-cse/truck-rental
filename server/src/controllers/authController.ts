import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { CreateUserRequest, LoginRequest, ApiResponse } from '../types';
import { logAuth, logError } from '../utils/logger';

export class AuthController {
  static async register(req: Request, res: Response) {
    try {
      const userData: CreateUserRequest = req.body;
      
      logAuth('register_attempt', 'anonymous', { email: userData.email, role: userData.role });
      
      const result = await AuthService.register(userData);

      logAuth('register_success', result.user.id, { email: userData.email, role: userData.role });

      const response: ApiResponse = {
        success: true,
        message: 'User registered successfully',
        data: result
      };

      res.status(201).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'register', 
        email: req.body.email,
        ip: req.ip 
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Registration failed',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const loginData: LoginRequest = req.body;
      
      logAuth('login_attempt', 'anonymous', { email: loginData.email, ip: req.ip });
      
      const result = await AuthService.login(loginData);

      logAuth('login_success', result.user.id, { email: loginData.email, ip: req.ip });

      const response: ApiResponse = {
        success: true,
        message: 'Login successful',
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'login', 
        email: req.body.email,
        ip: req.ip 
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Login failed',
        error: error.message
      };

      res.status(401).json(response);
    }
  }

  static async changePassword(req: Request, res: Response) {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = (req as any).user.userId;

      logAuth('password_change_attempt', userId, { ip: req.ip });
      
      const result = await AuthService.changePassword(userId, oldPassword, newPassword);

      logAuth('password_change_success', userId, { ip: req.ip });

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      const userId = (req as any).user?.userId || 'unknown';
      
      logError(error, { 
        operation: 'change_password', 
        userId,
        ip: req.ip 
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Password change failed',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.body;

      if (!token) {
        throw new Error('Verification token is required');
      }

      const result = await AuthService.verifyEmail(token);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'verify_email',
        ip: req.ip 
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Email verification failed',
        error: error.message
      };

      res.status(400).json(response);
    }
  }

  static async resendVerification(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        throw new Error('Email is required');
      }

      const result = await AuthService.resendVerificationEmail(email);

      const response: ApiResponse = {
        success: true,
        message: result.message,
        data: result
      };

      res.status(200).json(response);
    } catch (error: any) {
      logError(error, { 
        operation: 'resend_verification',
        email: req.body.email,
        ip: req.ip 
      });

      const response: ApiResponse = {
        success: false,
        message: error.message || 'Failed to resend verification email',
        error: error.message
      };

      res.status(400).json(response);
    }
  }
} 
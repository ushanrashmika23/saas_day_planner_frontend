/* eslint-disable @typescript-eslint/no-explicit-any */
import api from './config';

// === register ===

export interface RegisterPayload {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    username: string;
}

interface RegisterResponse {
    statusCode: number;
    message: string;
}

export const registerUser = async (data: RegisterPayload): Promise<RegisterResponse> => {
    try {
        const response = await api.post<RegisterResponse>('/auth/register', data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Registration failed' };
    }
};

// === send verification email ===

export interface SendVerificationEmailResponse {
    statusCode: number;
    message: string;
}
export interface SendVerificationEmailPayload {
    email: string;
}

export const sendVerificationEmail = async (payload: SendVerificationEmailPayload): Promise<SendVerificationEmailResponse> => {
    try {
        const response = await api.post<SendVerificationEmailResponse>('/auth/send-otp', payload);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Failed to send verification email' };
    }
};

// === verify email ===

export interface VerifyEmailResponse {
    statusCode: number;
    message: string;
    token?: string;
}
export interface VerifyEmailPayload {
    code: string;
}

export const verifyEmail = async (payload: VerifyEmailPayload): Promise<VerifyEmailResponse> => {
    try {
        const response = await api.post<VerifyEmailResponse>(`/auth/verify` + `?code=${payload.code}`);
        console.log("Verification response:", response.data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data;
    }
};

// === login ===

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    statusCode: number;
    message: string;
    data: any;
}

export const loginUser = async (data: LoginPayload): Promise<LoginResponse> => {
    try {
        const response = await api.post<LoginResponse>('/auth/login', data);
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Login failed' };
    }
};

// === validate token ===

export interface ValidateTokenResponse {
    statusCode: number;
    message: string;
    user?: any;
    isValid: boolean;
}

export const validateToken = async (token: string): Promise<ValidateTokenResponse> => {
    try {
        const response = await api.get<ValidateTokenResponse>('/auth/validate', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error: any) {
        throw error.response?.data || { statusCode: 500, message: 'Token validation failed' };
    }
};
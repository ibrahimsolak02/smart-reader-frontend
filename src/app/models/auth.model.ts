export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface AuthenticationRequest {
  email: string;
  password: string;
}

export interface AuthenticationResponse {
  token: string;
}

export interface VerifyRequest {
  email: string;
  code: string;
}

export interface ResendCodeRequest {
  email: string;
}

export interface ErrorResponse {
  status: number;
  message: string;
  timestamp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}



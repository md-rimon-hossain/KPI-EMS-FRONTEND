import { apiSlice } from "./apiSlice";
import { User } from "./authSlice";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: string;
  department?: string;
  phone?: string;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
      invalidatesTags: ["Auth"],
    }),

    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (data) => ({
        url: "/auth/register",
        method: "POST",
        body: data,
      }),
    }),

    getMe: builder.query<{ success: boolean; data: { user: User } }, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),

    logout: builder.mutation<{ success: boolean }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    forgotPassword: builder.mutation<
      { success: boolean; message: string },
      { email: string }
    >({
      query: (data) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body: data,
      }),
    }),

    resetPassword: builder.mutation<
      { success: boolean; message: string },
      { token: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/auth/reset-password",
        method: "POST",
        body: data,
      }),
    }),

    changePassword: builder.mutation<
      { success: boolean },
      { currentPassword: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/auth/change-password",
        method: "POST",
        body: data,
      }),
    }),

    verifyEmail: builder.mutation<
      { success: boolean; message: string },
      { token: string }
    >({
      query: (data) => ({
        url: "/auth/verify-email",
        method: "POST",
        body: data,
      }),
    }),

    resendVerification: builder.mutation<
      { success: boolean; message: string },
      void
    >({
      query: () => ({
        url: "/auth/resend-verification",
        method: "POST",
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetMeQuery,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useChangePasswordMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
} = authApi;

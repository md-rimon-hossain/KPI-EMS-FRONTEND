import { apiSlice } from "./apiSlice";
import { User } from "./authSlice";

export const userApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query<
      { success: boolean; count: number; data: { users: User[] } },
      { role?: string; department?: string; isActive?: boolean } | void
    >({
      query: (params) => ({
        url: "/users",
        params: params || undefined,
      }),
      providesTags: ["User"],
    }),

    getUserById: builder.query<
      { success: boolean; data: { user: User } },
      string
    >({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<
      { success: boolean; data: { user: User } },
      Partial<User> & { password: string }
    >({
      query: (data) => ({
        url: "/users",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["User"],
    }),

    updateUser: builder.mutation<
      { success: boolean; data: { user: User } },
      { id: string; data: Partial<User> }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/users/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["User"],
    }),

    updateVacationBalance: builder.mutation<
      { success: boolean; data: { user: User } },
      { id: string; amount: number }
    >({
      query: ({ id, amount }) => ({
        url: `/users/${id}/vacation-balance`,
        method: "PUT",
        body: { amount },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        "User",
      ],
    }),

    sendGmailVerificationCode: builder.mutation<
      { success: boolean; message: string; data: { expiresIn: number } },
      { email: string }
    >({
      query: (data) => ({
        url: "/users/verify-gmail/send-code",
        method: "POST",
        body: data,
      }),
    }),

    verifyGmailCode: builder.mutation<
      { success: boolean; message: string; data: { verified: boolean } },
      { email: string; code: string }
    >({
      query: (data) => ({
        url: "/users/verify-gmail/verify-code",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useUpdateVacationBalanceMutation,
  useSendGmailVerificationCodeMutation,
  useVerifyGmailCodeMutation,
} = userApi;

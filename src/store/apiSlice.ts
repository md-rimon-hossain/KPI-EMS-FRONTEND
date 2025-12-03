import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type { RootState } from "./store";
import { setCredentials, logout } from "./authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  // If we get a 401 error, try to refresh the token
  if (result.error && result.error.status === 401) {
    const refreshToken = (api.getState() as RootState).auth.refreshToken;

    if (refreshToken) {
      // Try to get a new token
      const refreshResult = await baseQuery(
        {
          url: "/auth/refresh",
          method: "POST",
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        // Store the new tokens
        const data = refreshResult.data as {
          accessToken: string;
          refreshToken: string;
        };
        const currentUser = (api.getState() as RootState).auth.user;
        if (currentUser) {
          api.dispatch(
            setCredentials({
              user: currentUser,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            })
          );

          // Retry the original query with new token
          result = await baseQuery(args, api, extraOptions);
        } else {
          // User is null - logout
          api.dispatch(logout());
        }
      } else {
        // Refresh failed - logout user
        api.dispatch(logout());
      }
    } else {
      // No refresh token - logout user
      api.dispatch(logout());
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Department",
    "Vacation",
    "Auth",
    "Inventory",
    "Lab",
    "Loan",
  ],
  endpoints: () => ({}),
});

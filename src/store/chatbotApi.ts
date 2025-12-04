import { apiSlice } from "./apiSlice";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface ChatContext {
  user?: {
    name: string;
    email: string;
    role: string;
    department?: string;
  };
  vacationBalance?: {
    annual: number;
    sick: number;
    casual: number;
  };
  vacationStats?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  loanStats?: {
    total: number;
    active: number;
    pending: number;
    overdue: number;
  };
  departmentStats?: {
    totalUsers?: number;
    pendingVacations?: number;
    totalInventory?: number;
    activeLoans?: number;
  };
}

export const chatbotApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Send message to chatbot
    sendChatMessage: builder.mutation<
      { response: string; timestamp: string },
      { message: string; chatHistory: ChatMessage[] }
    >({
      query: (data) => ({
        url: "/chatbot/message",
        method: "POST",
        body: data,
      }),
      transformResponse: (response: any) => response.data,
    }),

    // Get quick suggestions
    getChatSuggestions: builder.query<{ suggestions: string[] }, void>({
      query: () => "/chatbot/suggestions",
      transformResponse: (response: any) => response.data,
    }),

    // Get user context for chatbot
    getUserChatContext: builder.query<ChatContext, void>({
      query: () => "/chatbot/context",
      transformResponse: (response: any) => response.data,
      providesTags: ["User"],
    }),
  }),
});

export const {
  useSendChatMessageMutation,
  useGetChatSuggestionsQuery,
  useGetUserChatContextQuery,
} = chatbotApi;

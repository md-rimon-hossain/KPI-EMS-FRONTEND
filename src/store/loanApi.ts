import { apiSlice } from "./apiSlice";
import { InventoryItem } from "./inventoryApi";
import { Lab } from "./labApi";

export interface Loan {
  _id: string;
  loanCode: string;
  inventoryItem: InventoryItem;
  sourceLab: Lab; // Lab lending the item
  destinationLab: Lab; // Lab borrowing the item
  requestedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  approvedBy?: {
    _id: string;
    name: string;
    email: string;
    role: string;
  };
  quantity: number;
  purpose: string;
  loanDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  status:
    | "pending"
    | "approved"
    | "active"
    | "returned"
    | "overdue"
    | "rejected";
  notes?: string;
  returnNotes?: string;
  returnCondition?: "excellent" | "good" | "fair" | "poor" | "damaged";
  createdAt: string;
  updatedAt: string;
}

export interface LoanStatistics {
  totalLoans: number;
  pendingLoans: number;
  activeLoans: number;
  overdueLoans: number;
  returnedLoans: number;
  rejectedLoans: number;
}

export const loanApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all loans with optional filters
    getLoans: builder.query<
      { loans: Loan[]; total: number },
      {
        page?: number;
        limit?: number;
        sourceLab?: string;
        destinationLab?: string;
        status?: string;
        search?: string;
      }
    >({
      query: (params) => ({
        url: "/loans",
        params,
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result?.loans
          ? [
              ...result.loans.map(({ _id }) => ({
                type: "Loan" as const,
                id: _id,
              })),
              { type: "Loan", id: "LIST" },
            ]
          : [{ type: "Loan", id: "LIST" }],
    }),

    // Get single loan
    getLoan: builder.query<Loan, string>({
      query: (id) => `/loans/${id}`,
      transformResponse: (response: any) => response.data.loan,
      providesTags: (_result, _error, id) => [{ type: "Loan", id }],
    }),

    // Get loans by lab
    getLoansByLab: builder.query<{ loans: Loan[]; total: number }, string>({
      query: (labId) => `/loans/lab/${labId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.loans.map(({ _id }) => ({
                type: "Loan" as const,
                id: _id,
              })),
              { type: "Loan", id: "LAB" },
            ]
          : [{ type: "Loan", id: "LAB" }],
    }),

    // Get my active loans
    getMyActiveLoans: builder.query<{ loans: Loan[]; total: number }, void>({
      query: () => "/loans/my-active",
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.loans.map(({ _id }) => ({
                type: "Loan" as const,
                id: _id,
              })),
              { type: "Loan", id: "MY_ACTIVE" },
            ]
          : [{ type: "Loan", id: "MY_ACTIVE" }],
    }),

    // Get my loan history (all loans including returned/rejected)
    getMyLoanHistory: builder.query<{ loans: Loan[]; total: number }, void>({
      query: () => "/loans/my-history",
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.loans.map(({ _id }) => ({
                type: "Loan" as const,
                id: _id,
              })),
              { type: "Loan", id: "MY_HISTORY" },
            ]
          : [{ type: "Loan", id: "MY_HISTORY" }],
    }),

    // Get loan statistics
    getLoanStatistics: builder.query<
      LoanStatistics,
      { department?: string; lab?: string }
    >({
      query: (params) => ({
        url: "/loans/statistics",
        params,
      }),
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: "Loan", id: "STATISTICS" }],
    }),

    // Create new loan request
    createLoan: builder.mutation<
      Loan,
      {
        inventoryItem: string;
        sourceLab: string; // Lab lending the item
        destinationLab: string; // Lab borrowing the item
        quantity: number;
        purpose: string;
        expectedReturnDate: string;
        notes?: string;
      }
    >({
      query: (data) => ({
        url: "/loans",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        { type: "Loan", id: "LIST" },
        { type: "Loan", id: "STATISTICS" },
        { type: "Inventory", id: "LIST" },
      ],
    }),

    // Approve loan
    approveLoan: builder.mutation<Loan, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/loans/${id}/approve`,
        method: "POST",
        body: { notes },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Loan", id },
        { type: "Loan", id: "LIST" },
        { type: "Loan", id: "STATISTICS" },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "STATISTICS" },
      ],
    }),

    // Reject loan
    rejectLoan: builder.mutation<Loan, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/loans/${id}/reject`,
        method: "POST",
        body: { notes },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Loan", id },
        { type: "Loan", id: "LIST" },
        { type: "Loan", id: "STATISTICS" },
      ],
    }),

    // Return loan
    returnLoan: builder.mutation<
      Loan,
      {
        id: string;
        returnCondition: "excellent" | "good" | "fair" | "poor" | "damaged";
        returnNotes?: string;
      }
    >({
      query: ({ id, returnCondition, returnNotes }) => ({
        url: `/loans/${id}/return`,
        method: "POST",
        body: { returnCondition, returnNotes },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Loan", id },
        { type: "Loan", id: "LIST" },
        { type: "Loan", id: "MY_ACTIVE" },
        { type: "Loan", id: "STATISTICS" },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "STATISTICS" },
      ],
    }),
  }),
});

export const {
  useGetLoansQuery,
  useGetLoanQuery,
  useGetLoansByLabQuery,
  useGetMyActiveLoansQuery,
  useGetMyLoanHistoryQuery,
  useGetLoanStatisticsQuery,
  useCreateLoanMutation,
  useApproveLoanMutation,
  useRejectLoanMutation,
  useReturnLoanMutation,
} = loanApi;

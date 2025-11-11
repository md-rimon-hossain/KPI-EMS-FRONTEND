import { apiSlice } from "./apiSlice";
import { User } from "./authSlice";
import { Department } from "./departmentApi";

export enum VacationStatus {
  PENDING = "pending",
  APPROVED_BY_CHIEF = "approved_by_chief",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum VacationType {
  CASUAL = "casual",
  SICK = "sick",
  ANNUAL = "annual",
  MATERNITY = "maternity",
  PATERNITY = "paternity",
  OTHER = "other",
}

export interface Vacation {
  _id: string;
  employee: User;
  department: Department;
  vacationType: VacationType;
  startDate: string;
  endDate: string;
  totalDays: number;
  workingDays: number;
  isRewardVacation: boolean;
  reason: string;
  status: VacationStatus;
  reviewedByChief?: User;
  chiefRemarks?: string;
  chiefReviewDate?: string;
  reviewedByPrincipal?: User;
  principalRemarks?: string;
  principalReviewDate?: string;
  isExtension: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VacationSummary {
  userId: string;
  annualVacationBalance: number;
  rewardVacationBalance: number;
  totalAvailableBalance: number;
  lastAnnualVacationReset: string;
  nextAnnualVacationReset: string;
  lastRewardCheck: string;
  nextRewardCheck: string;
  thisMonthUsage: {
    annual: number;
    reward: number;
    total: number;
  };
  thisYearUsage: {
    annual: number;
    reward: number;
    total: number;
  };
  totalApproved: number;
  totalPending: number;
  totalRejected: number;
}

export interface RewardCheckResult {
  awarded: boolean;
  message: string;
  rewardBalance?: number;
}

export interface VacationStatistics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  rewardVacations: number;
  totalWorkingDaysUsed: number;
}

export const vacationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    applyVacation: builder.mutation<
      { success: boolean; data: { vacation: Vacation } },
      {
        departmentId: string;
        vacationType: VacationType;
        startDate: string;
        endDate: string;
        reason: string;
        isExtension?: boolean;
        isRewardVacation?: boolean;
      }
    >({
      query: (data) => ({
        url: "/vacations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Vacation"],
    }),

    getMyVacations: builder.query<
      { success: boolean; count: number; data: { vacations: Vacation[] } },
      void
    >({
      query: () => "/vacations/my-vacations",
      providesTags: ["Vacation"],
    }),

    getPendingForChief: builder.query<
      { success: boolean; count: number; data: { vacations: Vacation[] } },
      void
    >({
      query: () => "/vacations/pending/chief",
      providesTags: ["Vacation"],
    }),

    getPendingForPrincipal: builder.query<
      { success: boolean; count: number; data: { vacations: Vacation[] } },
      void
    >({
      query: () => "/vacations/pending/principal",
      providesTags: ["Vacation"],
    }),

    getAllVacations: builder.query<
      { success: boolean; count: number; data: { vacations: Vacation[] } },
      { status?: VacationStatus; department?: string; employee?: string } | void
    >({
      query: (params) => ({
        url: "/vacations",
        params: params || undefined,
      }),
      providesTags: ["Vacation"],
    }),

    getVacationsByDepartment: builder.query<
      { success: boolean; count: number; data: { vacations: Vacation[] } },
      string
    >({
      query: (departmentId) => `/vacations/department/${departmentId}`,
      providesTags: ["Vacation"],
    }),

    reviewByChief: builder.mutation<
      { success: boolean; data: { vacation: Vacation } },
      { id: string; status: VacationStatus; remarks?: string }
    >({
      query: ({ id, status, remarks }) => ({
        url: `/vacations/${id}/review/chief`,
        method: "PUT",
        body: { status, remarks },
      }),
      invalidatesTags: ["Vacation"],
    }),

    reviewByPrincipal: builder.mutation<
      { success: boolean; data: { vacation: Vacation } },
      { id: string; status: VacationStatus; remarks?: string }
    >({
      query: ({ id, status, remarks }) => ({
        url: `/vacations/${id}/review/principal`,
        method: "PUT",
        body: { status, remarks },
      }),
      invalidatesTags: ["Vacation"],
    }),

    getVacationById: builder.query<
      { success: boolean; data: { vacation: Vacation } },
      string
    >({
      query: (id) => `/vacations/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Vacation", id }],
    }),

    getVacationSummary: builder.query<
      { success: boolean; data: { summary: VacationSummary } },
      string | void
    >({
      query: (userId) =>
        userId ? `/vacations/summary/${userId}` : "/vacations/summary/me",
      providesTags: ["Vacation"],
    }),

    checkRewardEligibility: builder.mutation<
      { success: boolean; data: RewardCheckResult },
      string | void
    >({
      query: (userId) => ({
        url: userId
          ? `/vacations/rewards/check/${userId}`
          : "/vacations/rewards/check",
        method: "POST",
      }),
      invalidatesTags: ["Vacation"],
    }),

    getVacationStatistics: builder.query<
      { success: boolean; data: { statistics: VacationStatistics } },
      void
    >({
      query: () => "/vacations/stats/overview",
      providesTags: ["Vacation"],
    }),
  }),
});

export const {
  useApplyVacationMutation,
  useGetMyVacationsQuery,
  useGetPendingForChiefQuery,
  useGetPendingForPrincipalQuery,
  useGetAllVacationsQuery,
  useGetVacationsByDepartmentQuery,
  useReviewByChiefMutation,
  useReviewByPrincipalMutation,
  useGetVacationByIdQuery,
  useGetVacationSummaryQuery,
  useCheckRewardEligibilityMutation,
  useGetVacationStatisticsQuery,
} = vacationApi;

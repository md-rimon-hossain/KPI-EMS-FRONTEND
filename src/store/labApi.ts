import { apiSlice } from "./apiSlice";

export interface Lab {
  _id: string;
  name: string;
  labCode: string;
  department: {
    _id: string;
    name: string;
    code: string;
  };
  labIncharge?: {
    _id: string;
    name: string;
    email: string;
  };
  location?: string;
  capacity?: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const labApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all labs with optional filters
    getLabs: builder.query<
      { labs: Lab[]; total: number },
      {
        page?: number;
        limit?: number;
        department?: string;
        search?: string;
      }
    >({
      query: (params) => ({
        url: "/labs",
        params,
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result?.labs
          ? [
              ...result.labs.map(({ _id }) => ({
                type: "Lab" as const,
                id: _id,
              })),
              { type: "Lab", id: "LIST" },
            ]
          : [{ type: "Lab", id: "LIST" }],
    }),

    // Get single lab
    getLab: builder.query<Lab, string>({
      query: (id) => `/labs/${id}`,
      transformResponse: (response: any) => response.data.lab,
      providesTags: (_result, _error, id) => [{ type: "Lab", id }],
    }),

    // Get labs by department
    getLabsByDepartment: builder.query<{ labs: Lab[]; total: number }, string>({
      query: (departmentId) => `/labs/department/${departmentId}`,
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.labs.map(({ _id }) => ({
                type: "Lab" as const,
                id: _id,
              })),
              { type: "Lab", id: "DEPARTMENT" },
            ]
          : [{ type: "Lab", id: "DEPARTMENT" }],
    }),

    // Create new lab
    createLab: builder.mutation<Lab, Partial<Lab>>({
      query: (data) => ({
        url: "/labs",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Lab", id: "LIST" }],
    }),

    // Update lab
    updateLab: builder.mutation<Lab, { id: string; data: Partial<Lab> }>({
      query: ({ id, data }) => ({
        url: `/labs/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Lab", id },
        { type: "Lab", id: "LIST" },
      ],
    }),

    // Delete lab
    deleteLab: builder.mutation<void, string>({
      query: (id) => ({
        url: `/labs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Lab", id: "LIST" }],
    }),
  }),
});

export const {
  useGetLabsQuery,
  useGetLabQuery,
  useGetLabsByDepartmentQuery,
  useCreateLabMutation,
  useUpdateLabMutation,
  useDeleteLabMutation,
} = labApi;

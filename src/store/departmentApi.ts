import { apiSlice } from "./apiSlice";

export interface Department {
  _id: string;
  name: string;
  code: string;
  chiefInstructor?: {
    _id: string;
    name: string;
    email: string;
  };
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const departmentApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllDepartments: builder.query<
      { success: boolean; count: number; data: { departments: Department[] } },
      void
    >({
      query: () => "/departments",
      providesTags: ["Department"],
    }),

    getDepartmentById: builder.query<
      { success: boolean; data: { department: Department } },
      string
    >({
      query: (id) => `/departments/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Department", id }],
    }),

    createDepartment: builder.mutation<
      { success: boolean; data: { department: Department } },
      Partial<Department>
    >({
      query: (data) => ({
        url: "/departments",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Department"],
    }),

    updateDepartment: builder.mutation<
      { success: boolean; data: { department: Department } },
      { id: string; data: Partial<Department> }
    >({
      query: ({ id, data }) => ({
        url: `/departments/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Department", id },
        "Department",
      ],
    }),

    deleteDepartment: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Department"],
    }),
  }),
});

export const {
  useGetAllDepartmentsQuery,
  useGetDepartmentByIdQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
} = departmentApi;

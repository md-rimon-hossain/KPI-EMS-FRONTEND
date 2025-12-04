import { apiSlice } from "./apiSlice";

export interface InventoryItem {
  _id: string;
  itemName: string; // User-provided meaningful name
  name: string; // Auto-generated
  serialNumber: string; // Auto-generated
  quantity: number;
  availableQuantity: number;
  condition: "excellent" | "good" | "fair" | "poor" | "damaged";
  status: "available" | "loaned" | "maintenance" | "retired";
  department: {
    _id: string;
    name: string;
    code: string;
  };
  lab: {
    _id: string;
    name: string;
    labCode: string;
  };
  description?: string;
  image?: string; // Cloudinary URL
  imagePublicId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStatistics {
  totalItems: number;
  totalQuantity: number;
  availableQuantity: number;
  loanedQuantity: number;
  maintenanceQuantity: number;
  retiredQuantity: number;
  byCondition: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
    damaged: number;
  };
  byCategory: Record<string, number>;
}

export const inventoryApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get all inventory items with optional filters
    getInventoryItems: builder.query<
      { items: InventoryItem[]; total: number },
      {
        page?: number;
        limit?: number;
        department?: string;
        lab?: string;
        condition?: string;
        status?: string;
        search?: string;
      }
    >({
      query: (params) => ({
        url: "/inventory",
        params,
      }),
      transformResponse: (response: any) => response.data,
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map(({ _id }) => ({
                type: "Inventory" as const,
                id: _id,
              })),
              { type: "Inventory", id: "LIST" },
            ]
          : [{ type: "Inventory", id: "LIST" }],
    }),

    // Get single inventory item
    getInventoryItem: builder.query<InventoryItem, string>({
      query: (id) => `/inventory/${id}`,
      transformResponse: (response: any) => response.data.item,
      providesTags: (_result, _error, id) => [{ type: "Inventory", id }],
    }),

    // Get inventory items by department
    getInventoryByDepartment: builder.query<
      { items: InventoryItem[]; total: number },
      string
    >({
      query: (departmentId) => `/inventory/department/${departmentId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ _id }) => ({
                type: "Inventory" as const,
                id: _id,
              })),
              { type: "Inventory", id: "DEPARTMENT" },
            ]
          : [{ type: "Inventory", id: "DEPARTMENT" }],
    }),

    // Get low stock items
    getLowStockItems: builder.query<
      { items: InventoryItem[]; total: number },
      { threshold?: number }
    >({
      query: (params) => ({
        url: "/inventory/low-stock",
        params,
      }),
      providesTags: [{ type: "Inventory", id: "LOW_STOCK" }],
    }),

    // Get inventory statistics
    getInventoryStatistics: builder.query<
      InventoryStatistics,
      { department?: string }
    >({
      query: (params) => ({
        url: "/inventory/statistics",
        params,
      }),
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: "Inventory", id: "STATISTICS" }],
    }),

    // Create new inventory item
    createInventoryItem: builder.mutation<InventoryItem, FormData>({
      query: (formData) => ({
        url: "/inventory",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: [
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "STATISTICS" },
      ],
    }),

    // Update inventory item
    updateInventoryItem: builder.mutation<
      InventoryItem,
      { id: string; formData: FormData }
    >({
      query: ({ id, formData }) => ({
        url: `/inventory/${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Inventory", id },
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "STATISTICS" },
      ],
    }),

    // Delete inventory item
    deleteInventoryItem: builder.mutation<void, string>({
      query: (id) => ({
        url: `/inventory/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Inventory", id: "LIST" },
        { type: "Inventory", id: "STATISTICS" },
      ],
    }),

    // Get dashboard statistics
    getDashboardStats: builder.query<
      {
        overview: {
          totalItems: number;
          totalQuantity: number;
          availableQuantity: number;
          loanedQuantity: number;
          lowStockCount: number;
          outOfStockCount: number;
        };
        byStatus: Record<string, number>;
        byCondition: Record<string, number>;
        recentItems: InventoryItem[];
        departmentStats: Array<{
          _id: string;
          departmentName: string;
          departmentCode: string;
          count: number;
          totalQuantity: number;
        }>;
      },
      { department?: string }
    >({
      query: (params) => ({
        url: "/inventory/dashboard/stats",
        params,
      }),
      transformResponse: (response: any) => response.data,
      providesTags: [{ type: "Inventory", id: "DASHBOARD" }],
    }),
  }),
});

export const {
  useGetInventoryItemsQuery,
  useGetInventoryItemQuery,
  useGetInventoryByDepartmentQuery,
  useGetLowStockItemsQuery,
  useGetInventoryStatisticsQuery,
  useCreateInventoryItemMutation,
  useUpdateInventoryItemMutation,
  useDeleteInventoryItemMutation,
  useGetDashboardStatsQuery,
} = inventoryApi;

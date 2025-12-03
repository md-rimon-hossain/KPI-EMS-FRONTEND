import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export enum UserRole {
  SUPER_ADMIN = "super_admin",
  REGISTRAR_HEAD = "registrar_head",
  PRINCIPAL = "principal",
  VICE_PRINCIPAL = "vice_principal",
  GENERAL_HEAD = "general_head",
  GENERAL_SHAKHA = "general_shakha",
  CHIEF_INSTRUCTOR = "chief_instructor",
  INSTRUCTOR = "instructor",
  CRAFT_INSTRUCTOR = "craft_instructor",
  ASSISTANT_INSTRUCTOR = "assistant_instructor",
  OFFICE_STAFF = "office_staff",
  LAB_ASSISTANT = "lab_assistant",
  LIBRARY_STAFF = "library_staff",
  OTHER_EMPLOYEE = "other_employee",
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: {
    _id: string;
    name: string;
    code: string;
  };
  phone?: string;
  profileImage?: string;
  vacationBalance: number;
  rewardVacationBalance?: number;
  lastAnnualVacationReset?: string;
  lastRewardCheck?: string;
  joiningDate: string;
  isActive: boolean;
  isEmailVerified: boolean;

  // Employment & Job Details
  jobTitle?: string;
  position?: string;
  departmentWorkArea?: string;
  employmentStatus?: string;
  startDate?: string;
  contractDocument?: string;
  jobDescription?: string;

  // Personal Information
  presentAddress?: string;
  permanentAddress?: string;
  nidNumber?: string;
  dateOfBirth?: string;
  bloodGroup?: string;

  // Emergency Contact
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
  };

  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// Load initial state from localStorage
const loadAuthState = (): AuthState => {
  if (typeof window === "undefined") {
    return {
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
    };
  }

  try {
    const user = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");
    const refreshToken = localStorage.getItem("refreshToken");

    if (user && accessToken) {
      return {
        user: JSON.parse(user),
        accessToken,
        refreshToken,
        isAuthenticated: true,
      };
    }
  } catch (error) {
    console.error("Failed to load auth state:", error);
  }

  return {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  };
};

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;

      // Persist to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload.user));
        localStorage.setItem("accessToken", action.payload.accessToken);
        localStorage.setItem("refreshToken", action.payload.refreshToken);
      }
    },
    updateUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;

      // Update localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;

      // Clear localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      }
    },
  },
});

export const { setCredentials, updateUser, logout } = authSlice.actions;
export default authSlice.reducer;

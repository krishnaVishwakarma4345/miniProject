import { create } from "zustand"
import {
  AnalyticsOverview,
  AnalyticsRange,
} from "@/features/analytics/types/analytics.types"
import {
  AdminUserFilters,
  AdminUserSummary,
} from "@/features/users/types/user.types"
import {
  GeneratedReport,
  ReportBuilderConfig,
  ReportTemplate,
} from "@/features/reports/types/report.types"
import { UserRole, UserStatus } from "@/types/user.types"

interface AdminAnalyticsState {
  data: AnalyticsOverview | null
  range: AnalyticsRange
  isLoading: boolean
  error: string | null
}

interface AdminUsersState {
  items: AdminUserSummary[]
  isLoading: boolean
  error: string | null
  filters: AdminUserFilters
  selectedUser: AdminUserSummary | null
  isEditModalOpen: boolean
  selectedIds: string[]
}

interface AdminReportsState {
  config: ReportBuilderConfig
  templates: ReportTemplate[]
  isLoadingTemplates: boolean
  isGenerating: boolean
  latestReport: GeneratedReport | null
  error: string | null
}

interface AdminStoreState {
  analytics: AdminAnalyticsState
  users: AdminUsersState
  reports: AdminReportsState
  setAnalyticsRange: (range: AnalyticsRange) => void
  setAnalyticsLoading: (value: boolean) => void
  setAnalyticsData: (data: AnalyticsOverview | null) => void
  setAnalyticsError: (error: string | null) => void
  setUsersLoading: (value: boolean) => void
  setUsersError: (error: string | null) => void
  setUsers: (items: AdminUserSummary[]) => void
  setUserFilters: (filters: Partial<AdminUserFilters>) => void
  setSelectedUser: (user: AdminUserSummary | null) => void
  setEditModalOpen: (value: boolean) => void
  toggleUserSelection: (userId: string) => void
  clearUserSelection: () => void
  updateUserInStore: (user: AdminUserSummary) => void
  setReportConfig: (config: Partial<ReportBuilderConfig>) => void
  setReportTemplates: (templates: ReportTemplate[]) => void
  setReportLoading: (value: boolean) => void
  setReportGenerating: (value: boolean) => void
  setGeneratedReport: (report: GeneratedReport | null) => void
  setReportError: (error: string | null) => void
}

const defaultUserFilters: AdminUserFilters = {
  role: "all",
  status: UserStatus.ACTIVE,
  department: "all",
  search: "",
}

const defaultReportConfig: ReportBuilderConfig = {
  range: "quarter",
  format: "pdf",
  includeCharts: true,
  sectionConfig: {
    activities: true,
    departments: true,
    students: true,
    summary: true,
  },
}

export const useAdminStore = create<AdminStoreState>((set) => ({
  analytics: {
    data: null,
    range: "30d",
    isLoading: false,
    error: null,
  },
  users: {
    items: [],
    isLoading: false,
    error: null,
    filters: defaultUserFilters,
    selectedUser: null,
    isEditModalOpen: false,
    selectedIds: [],
  },
  reports: {
    config: defaultReportConfig,
    templates: [],
    isLoadingTemplates: false,
    isGenerating: false,
    latestReport: null,
    error: null,
  },
  setAnalyticsRange: (range) =>
    set((state) => ({ analytics: { ...state.analytics, range } })),
  setAnalyticsLoading: (value) =>
    set((state) => ({ analytics: { ...state.analytics, isLoading: value } })),
  setAnalyticsData: (data) =>
    set((state) => ({ analytics: { ...state.analytics, data } })),
  setAnalyticsError: (error) =>
    set((state) => ({ analytics: { ...state.analytics, error } })),
  setUsersLoading: (value) =>
    set((state) => ({ users: { ...state.users, isLoading: value } })),
  setUsersError: (error) =>
    set((state) => ({ users: { ...state.users, error } })),
  setUsers: (items) =>
    set((state) => ({ users: { ...state.users, items } })),
  setUserFilters: (filters) =>
    set((state) => ({ users: { ...state.users, filters: { ...state.users.filters, ...filters } } })),
  setSelectedUser: (selectedUser) =>
    set((state) => ({ users: { ...state.users, selectedUser } })),
  setEditModalOpen: (value) =>
    set((state) => ({ users: { ...state.users, isEditModalOpen: value } })),
  toggleUserSelection: (userId) =>
    set((state) => {
      const selected = state.users.selectedIds.includes(userId)
        ? state.users.selectedIds.filter((id) => id !== userId)
        : [...state.users.selectedIds, userId]
      return { users: { ...state.users, selectedIds: selected } }
    }),
  clearUserSelection: () =>
    set((state) => ({ users: { ...state.users, selectedIds: [] } })),
  updateUserInStore: (user) =>
    set((state) => ({
      users: {
        ...state.users,
        items: state.users.items.map((item) => (item.id === user.id ? user : item)),
        selectedUser:
          state.users.selectedUser && state.users.selectedUser.id === user.id
            ? user
            : state.users.selectedUser,
      },
    })),
  setReportConfig: (config) =>
    set((state) => ({ reports: { ...state.reports, config: { ...state.reports.config, ...config } } })),
  setReportTemplates: (templates) =>
    set((state) => ({ reports: { ...state.reports, templates } })),
  setReportLoading: (value) =>
    set((state) => ({ reports: { ...state.reports, isLoadingTemplates: value } })),
  setReportGenerating: (value) =>
    set((state) => ({ reports: { ...state.reports, isGenerating: value } })),
  setGeneratedReport: (latestReport) =>
    set((state) => ({ reports: { ...state.reports, latestReport } })),
  setReportError: (error) =>
    set((state) => ({ reports: { ...state.reports, error } })),
}))

export default useAdminStore

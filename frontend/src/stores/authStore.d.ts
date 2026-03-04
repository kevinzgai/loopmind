import { Ref, ComputedRef } from 'vue'

export interface User {
  _id: string
  username: string
  email: string
  role?: string
  roles?: Array<string | { code: string }>
  permissions?: string[]
  isSuperAdmin?: boolean
  bio?: string
  avatar?: string
  profile?: {
    bio?: string
    avatar?: string
  }
  createdAt?: string
  updatedAt?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface RegisterResponse {
  user: User
}

export interface PermissionResponse {
  permissions: string[]
}

export interface ProfileUpdateResponse {
  user: User
}

export interface TokenRefreshResponse {
  token: string
  expiryTime: string
}

// 状态
export const user: Ref<User | null>
export const token: Ref<string | null>
export const isLoading: Ref<boolean>
export const error: Ref<string | null>
export const permissions: Ref<string[]>

// 计算属性
export const isAuthenticated: ComputedRef<boolean>
export const currentUser: ComputedRef<User | null>
export const isAdmin: ComputedRef<boolean>
export const isSuperAdmin: ComputedRef<boolean>

// 方法
export function register(
  username: string,
  email: string,
  password: string,
  confirmPassword: string
): Promise<RegisterResponse['user']>

export function login(
  username: string,
  password: string
): Promise<LoginResponse>

export function logout(): Promise<void>

export function getCurrentUser(): Promise<User | null>

export function refreshToken(): Promise<string | null>

export function updateProfile(
  profileData: Partial<User>
): Promise<ProfileUpdateResponse['user']>

export function changePassword(
  oldPassword: string,
  newPassword: string,
  confirmPassword: string
): Promise<void>

export function initializeAuth(): Promise<void>

export function loadUserPermissions(): Promise<string[]>

export function hasPermission(permission: string): boolean

export function hasPermissions(
  permissionList: string[],
  requireAll?: boolean
): boolean

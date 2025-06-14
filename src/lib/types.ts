export type User = {
  id: number
  email: string
  username: string
  phone: string | null
  emailVerified: boolean
  lastLogin: Date | null
  createdAt: Date
  updatedAt: Date
  firstName: string | null
  lastName: string | null
  profilePictureUrl: string | null
  bio: string | null
  location: string | null
  birthday: Date | null
  homeAirport: string | null
  organizationId: string | null
  organizationRole: string | null
  organizationJoinedAt: Date | null
  orgMemberVerifiedAt: boolean
  theme: string | null
  language: string | null
  publicProfile: boolean
  disabled: boolean
  admin: boolean
} | null
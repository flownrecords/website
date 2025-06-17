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
  logbookEntries: LogbookEntry[]
} | null

export type LogbookEntry = {
  id: number
  unique: string
  pilotId: number | null
  userId: number
  crewId: number[]
  createdAt: Date
  updatedAt: Date
  date: Date | null
  depAd: string | null
  arrAd: string | null
  offBlock: Date | null
  onBlock: Date | null
  aircraftType: string | null
  aircraftRegistration: string | null
  picName: string | null
  total: Number | string | null
  dayTime: Number | string | null
  nightTime: Number | string | null
  sepVfr: Number | string | null
  sepIfr: Number | string | null
  meVfr: Number | string | null
  meIfr: Number | string | null
  picTime: Number | string | null
  copilotTime: Number | string | null
  multiPilotTime: Number | string | null
  instructorTime: Number | string | null
  dualTime: Number | string | null
  simTime: Number | string | null
  simInstructorTime: Number | string | null
  landDay: number | null
  landNight: number | null
  includeInFt: boolean
  rmks: string | null
  flightTrack: any[]
}
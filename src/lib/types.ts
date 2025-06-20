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
  total: number | string | null
  dayTime: number | string | null
  nightTime: number | string | null
  sepVfr: number | string | null
  sepIfr: number | string | null
  meVfr: number | string | null
  meIfr: number | string | null
  picTime: number | string | null
  copilotTime: number | string | null
  multiPilotTime: number | string | null
  instructorTime: number | string | null
  dualTime: number | string | null
  simTime: number | string | null
  simInstructorTime: number | string | null
  landDay: number | null
  landNight: number | null
  includeInFt: boolean
  rmks: string | null
  flightTrack: any[]
}

export type Waypoint = {
    name: string;
    id: string;
    coords: Coordinates;
    aliases?: string[];
}

export type Aerodrome = {
    icao: string;
    coords: Coordinates;
}

export type Coordinates = {
    lat: number;
    long: number;
}
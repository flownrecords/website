export type User = {
  id: number
  email: string
  username: string
  phone: string | null

  lastLogin: Date | null
  createdAt: Date
  updatedAt: Date
  birthday: Date | null

  firstName: string | null
  lastName: string | null
  profilePictureUrl: string | null
  bio: string | null
  location: string | null
  homeAirport: string | null

  permissions: UserPermissions[] | null

  organizationId: string | null
  organizationRole: UserOrganizationRole | null
  organizationJoinedAt: Date | null
  
  language: string | null
  publicProfile: boolean
  disabled: boolean
  
  logbookEntries: LogbookEntry[]
  crewFor: LogbookEntry[] | null
  organization: Organization | null
} | null

export type LogbookEntry = {
  id: number
  unique: string
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
  remarks: string | null

  userId: number | string | null
  user: User | null
  crew: User[]

  recording: FlightRecording[]
  plan: FlightPlan | null
}

export type FlightPlan = {
  id: number
  depAd: string
  arrAd: string
  route: string | null
  alternate: string | null
  cruiseLevel: string | null
  cruiseSpeed: string | null
  fuelPlan: Number | null
  etd: Date | null
  eta: Date | null
  remarks: string | null
  weather: any | null
  createdAt: Date
  updatedAt: Date

  logbookEntryId: number
  logbookEntry: LogbookEntry | null
}

export type FlightRecording = {
  id: number
  createdAt: Date
  updatedAt: Date

  fileName: string
  data: any | null

  logbookEntryId: number | null
  logbookEntry: LogbookEntry | null
}

export type Organization = {
  id: string
  name: string
  handle: string
  type: OrganizationType
  createdAt: Date
  updatedAt: Date
  description: string | null
  logoUrl: string | null
  websiteUrl: string | null
  contactEmail: string | null
  address: string | null
  phoneNumber: string | null
  public: boolean
  archived: boolean

  members: User[]
}

export type Question = {
  id: number
  question: string
  answer: string
  viewCount: number
  upVoteCount: number
  tags: TagID[]
}

export type QuestionTag = {
  id: TagID
  text: string
  colorScheme?: {
    text: string
    bg: string
    ring: string
  }
}

export type TagID = number | string;
export type OrganizationType = 'SCHOOL' | 'COMPANY' | 'COMMUNITY' | 'CLUB' | 'OTHER';
export type UserOrganizationRole = 'GUEST' | 'STUDENT' | 'PILOT' | 'OPS' | 'FI' | 'TKI' | 'MAIN' | 'OFFICE' | 'SUPERVISOR' | 'ADMIN' | 'OTHER';
export type UserPermissions = 'USER' | 'SUPPORT' | 'QUESTIONS_MANAGER' | 'FPL_MANAGER' | 'LOGBOOK_MANAGER' | 'MANAGER' | 'ADMIN';

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

export interface FIR {
    fir: string; // ICAO code of the FIR
    waypoints: {
        vfr: Waypoint[] | null; // VFR waypoints, null if not available
        ifr: Waypoint[] | null; // IFR waypoints, null if not available
    };
    ad: Aerodrome[] | null; // Airport data, null if not available
    navaid: any[] | null; // Navaids, null if not available
}
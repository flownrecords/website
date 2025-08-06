export type User = {
    id: number;
    email: string;
    username: string;
    phone: string | null;

    lastLogin: Date | null;
    createdAt: Date;
    updatedAt: Date;
    birthday: Date | null;

    firstName: string | null;
    lastName: string | null;
    profilePictureUrl: string | null;
    bio: string | null;
    location: string | null;
    homeAirport: string | null;

    permissions: UserPermissions[] | null;

    organizationId: string | null;
    organizationRole: UserOrganizationRole | null;
    organizationJoinedAt: Date | null;

    language: string | null;
    publicProfile: boolean;
    disabled: boolean;

    logbookEntries: LogbookEntry[];
    crewFor: LogbookEntry[] | null;
    organization: Organization | null;
} | null;

export type LogbookEntry = {
    id: number;
    unique: string;
    createdAt: Date;
    updatedAt: Date;

    date: Date | null;
    depAd: string | null;
    arrAd: string | null;
    offBlock: Date | null;
    onBlock: Date | null;

    aircraftType: string | null;
    aircraftRegistration: string | null;
    picName: string | null;

    total: number | string | null;
    dayTime: number | string | null;
    nightTime: number | string | null;
    sepVfr: number | string | null;
    sepIfr: number | string | null;
    meVfr: number | string | null;
    meIfr: number | string | null;
    picTime: number | string | null;
    copilotTime: number | string | null;
    multiPilotTime: number | string | null;
    instructorTime: number | string | null;
    dualTime: number | string | null;
    simTime: number | string | null;
    simInstructorTime: number | string | null;
    landDay: number | null;
    landNight: number | null;
    includeInFt: boolean;
    remarks: string | null;

    userId: number | string | null;
    user: User | null;
    crew: User[];

    recording: FlightRecording | null;
    plan: FlightPlan | null;
};

export type FlightPlan = {
    id: number;
    depAd: string;
    arrAd: string;
    route: string | null;
    alternate: string | null;
    cruiseLevel: string | null;
    cruiseSpeed: string | null;
    fuelPlan: Number | null;
    etd: Date | null;
    eta: Date | null;
    remarks: string | null;
    weather: any | null;
    createdAt: Date;
    updatedAt: Date;

    logbookEntryId: number;
    logbookEntry: LogbookEntry | null;
};

export type FlightRecording = {
    id: number;
    createdAt: Date;
    updatedAt: Date;

    name: string;
    description: string | null;
    coords: FlightRecordingPlacemark[];

    logbookEntryId: number | null;
    logbookEntry: LogbookEntry | null;
};

export type FlightRecordingPlacemark ={
    id: number;
    latitude: number;
    longitude: number;
    altitude: {
        mode: string; // e.g., 'relativeToGround', 'absolute'
        value: number; // Altitude (ft)
    };
    timestamp?: string;
    heading?: number; // Optional heading in degrees
    groundSpeed?: number; // Optional ground speed (kt)
    verticalSpeed?: number; // Optional vertical speed (ft/min)
    source?: string; // Source of the data
    squawk?: number; // Optional transponder code
}

export type Organization = {
    id: string;
    name: string;
    handle: string;
    type: OrganizationType;
    createdAt: Date;
    updatedAt: Date;
    description: string | null;
    logoUrl: string | null;
    websiteUrl: string | null;
    contactEmail: string | null;
    address: string | null;
    phoneNumber: string | null;
    public: boolean;
    archived: boolean;

    members: User[];
};

export type Question = {
    id: number;
    question: string;
    answer: string;
    viewCount: number;
    upVoteCount: number;
    tags: TagID[];
};

export type QuestionTag = {
    id: TagID;
    text: string;
    colorScheme?: {
        text: string;
        bg: string;
        ring: string;
    };
};

export type TagID = number | string;
export type OrganizationType = "SCHOOL" | "COMPANY" | "COMMUNITY" | "CLUB" | "OTHER";
export type UserOrganizationRole =
    | "GUEST"
    | "STUDENT"
    | "PILOT"
    | "OPS"
    | "FI"
    | "TKI"
    | "MAIN"
    | "OFFICE"
    | "SUPERVISOR"
    | "ADMIN"
    | "OTHER";
export type UserPermissions =
    | "USER"
    | "SUPPORT"
    | "QUESTIONS_MANAGER"
    | "FPL_MANAGER"
    | "LOGBOOK_MANAGER"
    | "MANAGER"
    | "ADMIN";

export type Waypoint = {
    name: string;
    id: string;
    coords: Coordinates;
    aliases?: string[];
};

export type Aerodrome = {
    name?: string;
    icao: string;
    coords: Coordinates;
};

export type Navaid = {
    icao: string;
    coords: Coordinates;
    type: string; // e.g., VOR, NDB, etc.
    name?: string; // Optional name for the navaid
    frequency?: string; // Optional frequency for the navaid
};

export type Coordinates = {
    lat: number;
    long: number;
};

export interface FIR {
    fir: string; // ICAO code of the FIR
    info: {
        name: string;
        icao: string;
        country: string;
        region: string;
        limits: Coordinates[];
    };
    waypoints: {
        vfr: Waypoint[] | null; // VFR waypoints, null if not available
        ifr: Waypoint[] | null; // IFR waypoints, null if not available
    };
    ad: Aerodrome[] | null; // Airport data, null if not available
    navaid: any[] | null; // Navaids, null if not available
}

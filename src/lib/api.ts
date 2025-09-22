import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from "axios";

export const ENDPOINTS = {
    USER: {
        ME: "/users/me",
        USERNAME: "/users/{username}",
        SIGNIN: "/auth/signin",
        SIGNUP: "/auth/signup",
        ADD_PLAN: "/users/plan/add",
        GET_PLANS: "/users/plan/list",
        EDIT_PLAN: "/users/plan/edit",
    },
    LOGBOOK: {
        UPLOAD: "/users/logbook/upload",
        ADD: "/users/logbook/add",
        GET: "/users/logbook",
        DELETE: "/users/logbook/delete",
        ENTRY: "/users/logbook/{id}",
        ADD_CREW: "/users/logbook/crewAdd",
        REMOVE_CREW: "/users/logbook/crewRemove",
        CREW: "/users/logbook/crew",
        CREW_ENTRY: "/users/logbook/crew/{id}",
    },
    RECORDING: {
        UPLOAD: "/users/recording/upload",
    },
    NAVDATA: {
        ALL: "/navdata",
        AD: "/navdata?ad=true",
    },
    WX: {
        AD: "/wx/ad",
        SIGMET: "/wx/sigmet",
    },
    GEN: {
    },
    REPORTS: {
        STATS: {
            YEAR: "/reports/year",
        }
    },
    ORGS: {
        LIST: "/orgs",
    },
} as const;

type EndpointValues<T> = T extends string
    ? T
    : T extends Record<string, unknown>
      ? EndpointValues<T[keyof T]>
      : never;

export type Endpoint = EndpointValues<typeof ENDPOINTS>;

export type ApiResponse<T = any> = T & {
    meta: {
        status: number;
        statusText: string;
        config: AxiosRequestConfig;
        headers: any;
        request?: any;
    };
};

export type ApiError = {
    message: string;
    status: number;
    statusText: string;
    data: any;
};

export type ReplaceBy = { key: string; value: string }[];

export class API {
    private axios: AxiosInstance;
    private url: string;
    private token: string | null;

    public ENDPOINTS = ENDPOINTS;

    constructor() {
        this.url = import.meta.env.VITE_API_URL;
        this.token = localStorage.getItem("accessToken");

        this.axios = axios.create({
            baseURL: this.url,
        });

        if (this.token) {
            this.axios.defaults.headers.Authorization = `Bearer ${this.token}`;
        }
    }

    private refreshToken() {
        this.token = localStorage.getItem("accessToken");
        if (this.token) {
            this.axios.defaults.headers.Authorization = `Bearer ${this.token}`;
        } else {
            delete this.axios.defaults.headers.Authorization;
        }
    }

    async get<T = any>(
        endpoint: Endpoint,
        config: AxiosRequestConfig & {
            requireAuth?: boolean;
            navigate?: (p: string) => void;
            replaceBy?: ReplaceBy;
        } = {},
    ): Promise<ApiResponse<T> | Array<T>> {
        this.refreshToken();

        try {
            let end = endpoint;
            for (const replace of config.replaceBy ?? []) {
                end = end.replace(replace.key, replace.value) as Endpoint;
            }
            const response = await this.axios.get(end, config);
            return this._format<T>(response);
        } catch (e: any) {
            const status = e.response?.status;

            if (config.requireAuth && status === 401) {
                localStorage.removeItem("accessToken");
                if (config.navigate) config.navigate("/login");
            }

            throw this.error(e.response);
        }
    }

    async post<T = any>(
        endpoint: Endpoint,
        data: any,
        config: AxiosRequestConfig & {
            requireAuth?: boolean;
            navigate?: (p: string) => void;
            replaceBy?: ReplaceBy;
        } = {},
    ): Promise<ApiResponse<T> | Array<T>> {
        this.refreshToken();

        try {
            let end = endpoint;
            for (const replace of config.replaceBy ?? []) {
                end = end.replace(replace.key, replace.value) as Endpoint;
            }
            const response = await this.axios.post(end, data, config);

            return this._format<T>(response);
        } catch (e: any) {
            const status = e.response?.status;

            if (config.requireAuth && status === 401) {
                localStorage.removeItem("accessToken");
                if (config.navigate) config.navigate("/login");
            }

            throw this.error(e.response);
        }
    }

    private error(response?: AxiosResponse<any>): ApiError {
        return {
            message: `Error: ${response?.status ?? "??"} - ${response?.statusText ?? "Unknown"}`,
            status: response?.status ?? 0,
            statusText: response?.statusText ?? "Unknown",
            data: response?.data ?? null,
        };
    }

    private _format<T>(response: AxiosResponse<any>): ApiResponse<T> | Array<T> {
        if (Array.isArray(response.data)) {
            return response.data as Array<T>;
        } else {
            return {
                ...(response.data as T),
                meta: {
                    status: response.status,
                    statusText: response.statusText,
                    config: response.config,
                    headers: response.headers,
                    request: response.request,
                },
            };
        }
    }
}

export default new API();

const BASE_URL = "https://giangvien.org/ceovcci-backend/api/v1.0";

export type TicketStatus = "New" | "Processing" | "Completed" | "Cancelled";

export interface Ticket {
  id: string;
  website: string;
  full_name: string;
  phone_number: string;
  email: string | null;
  message: string;
  status: TicketStatus;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

const TOKEN_KEY = "access_token";
const REFRESH_KEY = "refresh_token";
const USER_KEY = "user_data";

export const auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  getUser: () => {
    const d = localStorage.getItem(USER_KEY);
    return d ? JSON.parse(d) : null;
  },
  setSession: (access: string, refresh: string, user: unknown) => {
    localStorage.setItem(TOKEN_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const token = auth.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(init.headers as Record<string, string> | undefined),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));

  if (res.status === 401 && retry && auth.getRefresh()) {
    const ok = await tryRefresh();
    if (ok) return request<T>(path, init, false);
    auth.clear();
    throw new Error("Phiên đăng nhập hết hạn");
  }

  if (!res.ok || data.status === "fail") {
    const violations = data?.violations?.[0]?.action?.errors
      ?.map((e: { message: string }) => e.message)
      .join(", ");
    throw new Error(violations || data.message || `HTTP ${res.status}`);
  }
  return data as T;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: auth.getRefresh() }),
    });
    const data = await res.json();
    if (!res.ok || data.status === "fail") return false;
    const r = data.responseData;
    localStorage.setItem(TOKEN_KEY, r.access_token);
    if (r.refresh_token) localStorage.setItem(REFRESH_KEY, r.refresh_token);
    return true;
  } catch {
    return false;
  }
}

export interface ApiResponse<T> {
  status: string;
  message: string;
  responseData: T;
}

export interface TicketListResponse {
  count: number;
  page: number;
  pageSize: number;
  rows: Ticket[];
}

export const ticketApi = {
  login: (email: string, password: string) =>
    request<ApiResponse<{ access_token: string; refresh_token: string; user: unknown }>>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) }
    ),

  list: (params: {
    filters?: Record<string, unknown>;
    sortField?: string;
    sortOrder?: "ASC" | "DESC";
    page?: number;
    pageSize?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.filters && Object.keys(params.filters).length)
      qs.set("filters", JSON.stringify(params.filters));
    if (params.sortField) qs.set("sortField", params.sortField);
    if (params.sortOrder) qs.set("sortOrder", params.sortOrder);
    if (params.page) qs.set("page", String(params.page));
    if (params.pageSize) qs.set("pageSize", String(params.pageSize));
    return request<ApiResponse<TicketListResponse>>(`/ticket?${qs.toString()}`);
  },

  get: (id: string) => request<ApiResponse<Ticket>>(`/ticket/${id}`),

  update: (id: string, body: Partial<Ticket>) =>
    request<ApiResponse<Ticket>>(`/ticket/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  remove: (id: string) =>
    request<ApiResponse<boolean>>(`/ticket/${id}`, { method: "DELETE" }),
};

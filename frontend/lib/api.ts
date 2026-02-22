const API_BASE = "http://localhost:8000/api";

// ─── Types ───────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  username: string;
  phone_number?: string;
  display_name: string;
  is_bot: boolean;
  bio?: string;
  avatar?: string;
}

export interface RegisterPayload {
  username: string;
  phone_number: string;
  display_name?: string;
  password: string;
  password2: string;
}

export interface LoginPayload {
  identifier: string;
  password: string;
}

export interface ChatUser {
  id: number;
  username: string;
  display_name: string;
  is_bot: boolean;
  is_online: boolean;
  last_seen: string | null;
}

export interface LastMessage {
  message: string;
  timestamp: string;
  user_id: number;
}

export interface Thread {
  id: string;
  first_person: number;
  second_person: number;
  last_message: LastMessage | null;
  updated: string;
}

export interface Message {
  id: string;
  user: ApiUser;
  sender_email: string | null;
  timestamp: string;
}

// ─── Fetch helper ────────────────────────────────────────────────────

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && !Array.isArray(data)
        ? Object.values(data).flat().join(" ")
        : null) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

// ─── Auth ────────────────────────────────────────────────────────────

export async function register(payload: RegisterPayload) {
  return request<{ detail: string; user: ApiUser }>("/auth/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload) {
  return request<{ detail: string; user: ApiUser }>("/auth/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  return request<{ detail: string }>("/auth/logout/", { method: "POST" });
}

export async function getMe() {
  return request<ApiUser>("/auth/me/");
}

export async function searchUsers(query: string) {
  return request<ApiUser[]>(`/auth/search/?q=${encodeURIComponent(query)}`);
}

export async function updateProfile(data: FormData) {
  // Use FormData for file upload support
  const res = await fetch(`${API_BASE}/auth/me/`, {
    method: "PATCH",
    body: data,
    credentials: "include",
    // Content-Type header not set manually for FormData, browser sets it with boundary
  });
  if (!res.ok) {
    throw new Error("Failed to update profile");
  }
  return res.json() as Promise<ApiUser>;
}

// ─── Threads ─────────────────────────────────────────────────────────

export async function getThreads() {
  return request<Thread[]>("/chat/threads/");
}

export async function createThread(userId: number) {
  return request<Thread>("/chat/threads/", {
    method: "POST",
    body: JSON.stringify({ user_id: userId }),
  });
}

// ─── Messages ────────────────────────────────────────────────────────

export async function getMessages(threadId: number) {
  return request<Message[]>(`/chat/threads/${threadId}/messages/`);
}

export async function sendMessage(threadId: number, message: string) {
  return request<Message>(`/chat/threads/${threadId}/messages/`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

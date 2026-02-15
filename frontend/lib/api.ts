const API_BASE = "http://localhost:8000/api/auth";

interface ApiUser {
  id: number;
  username: string;
  phone_number: string;
  display_name: string;
  is_bot: boolean;
}

interface RegisterPayload {
  username: string;
  phone_number: string;
  display_name?: string;
  password: string;
  password2: string;
}

interface LoginPayload {
  identifier: string;
  password: string;
}

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
    // Try to extract the best error message from DRF responses
    const message =
      (data && typeof data === "object" && !Array.isArray(data)
        ? Object.values(data).flat().join(" ")
        : null) || `Request failed (${res.status})`;
    throw new Error(message);
  }

  return data as T;
}

export async function register(payload: RegisterPayload) {
  return request<{ detail: string; user: ApiUser }>("/register/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function login(payload: LoginPayload) {
  return request<{ detail: string; user: ApiUser }>("/login/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function logout() {
  return request<{ detail: string }>("/logout/", { method: "POST" });
}

export async function getMe() {
  return request<ApiUser>("/me/");
}

export type { ApiUser, RegisterPayload, LoginPayload };

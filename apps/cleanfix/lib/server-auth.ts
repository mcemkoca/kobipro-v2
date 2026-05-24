// Static-export compatible server auth stubs
export interface AuthUser {
  name: string;
  email: string;
  role: string;
}

export async function getServerAuthToken(): Promise<string | undefined> {
  if (typeof window === "undefined") return "demo-token";
  return localStorage.getItem("demo_login") || undefined;
}

export async function getServerUserFromCookie(): Promise<AuthUser | null> {
  try {
    if (typeof window === "undefined") return { name: "Admin", email: "admin@cleanfix.com", role: "admin" };
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function serverRequireAuth(): Promise<{ token: string; user: AuthUser } | null> {
  const token = (await getServerAuthToken()) || "";
  const user = await getServerUserFromCookie();
  if (!user) return null;
  return { token, user };
}

export async function setSecureSession(token: string, user: AuthUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem("demo_login", token);
    localStorage.setItem("user", JSON.stringify(user));
  }
}

export async function clearServerSession() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("demo_login");
    localStorage.removeItem("user");
  }
}

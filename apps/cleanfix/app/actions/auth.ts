// Static-export compatible auth helpers for Kobipro-v2
// No server-only APIs — demo mode always returns admin user

const DEMO_USER = { name: "Admin", email: "admin@cleanfix.com", role: "admin" };
const DEMO_CREDENTIALS = [
  { email: "admin@cleanfix.com", password: "admin123", name: "Jan Wouters", role: "admin" },
  { email: "manager@cleanfix.com", password: "manager123", name: "Ayşe Yılmaz", role: "manager" },
  { email: "staff@cleanfix.com", password: "staff123", name: "Mehmet Demir", role: "employee" },
];

function generateSecureToken(): string {
  const arr = new Uint8Array(16);
  for (let i = 0; i < 16; i++) arr[i] = Math.floor(Math.random() * 256);
  const hex = Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
  return `cf_${hex}_${Date.now()}`;
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const redirect = String(formData.get("redirect") || "/dashboard");

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const user = DEMO_CREDENTIALS.find(
    (u) => u.email === email && u.password === password
  );

  if (!user) {
    return { success: false, error: "Invalid email or password" };
  }

  const token = generateSecureToken();
  const userData = { name: user.name, email: user.email, role: user.role };

  if (typeof window !== "undefined") {
    localStorage.setItem("demo_login", token);
    localStorage.setItem("user", JSON.stringify(userData));
  }

  return { success: true, redirect, user: userData };
}

export async function logout() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("demo_login");
    localStorage.removeItem("user");
  }
  return { success: true };
}

export async function getSession() {
  if (typeof window === "undefined") return DEMO_USER;
  const token = localStorage.getItem("demo_login");
  const userRaw = localStorage.getItem("user");
  if (!token || !userRaw) return null;
  const parts = token.split("_");
  if (parts.length !== 3 || !token.startsWith("cf_")) return null;
  const ts = parseInt(parts[2], 10);
  if (isNaN(ts) || Date.now() - ts > 24 * 60 * 60 * 1000) return null;
  try {
    return JSON.parse(userRaw);
  } catch {
    return null;
  }
}

export async function getDemoUser() {
  const session = await getSession();
  if (!session) return null;
  return {
    name: session.name || "Jan Wouters",
    email: session.email || "jan@cleanfix.be",
    role: session.role || "admin",
    avatar: session.name?.charAt(0).toUpperCase() || "J",
  };
}

export async function isAdmin(): Promise<boolean> {
  const session = await getSession();
  if (!session) return false;
  return session.role === "admin";
}

export async function requireAuth() {
  const user = await getDemoUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isVerified: boolean;
}

export function getAuthStatus(): { isAuthenticated: boolean; user: User | null } {
  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("user");
  
  let user: User | null = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error("Error parsing user data:", error);
    // Clear invalid user data
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
  }

  const isAuthenticated = token && user && user.isVerified;
  
  return { isAuthenticated, user };
}

export function requireAuth(redirectTo: string = "/login"): boolean {
  const { isAuthenticated } = getAuthStatus();
  
  if (!isAuthenticated) {
    window.location.href = redirectTo;
    return false;
  }
  
  return true;
}

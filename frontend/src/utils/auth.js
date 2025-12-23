// Auth utility functions for checking authentication state

export const isAuthenticated = () => {
  try {
    const token = sessionStorage.getItem('accessToken');
    return !!token;
  } catch {
    return false;
  }
};

export const getCurrentUser = () => {
  try {
    const userStr = sessionStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const logout = () => {
  try {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('user');
    return true;
  } catch {
    return false;
  }
};

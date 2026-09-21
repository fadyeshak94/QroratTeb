export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  const newOptions = {
    ...options,
    headers
  };
  
  const response = await fetch(url, newOptions);
  
  if (response.status === 401) {
    // Optional: handle token expiration globally
    console.error('Unauthorized! Token may be expired.');
    // localStorage.removeItem('token');
    // window.location.href = '/login';
  }
  
  return response;
};

import axios from 'axios';
import type { 
  Announcement, 
  Event, 
  MassSchedule, 
  MissionStation,
  Ministry, 
  GalleryItem, 
  Parishioner,
  Prayer,
  Sermon,
  User,
  AuthResponse,
  SaintDay,
  SaintsResponse,
  Donation
} from '../types';

// Normalize baseURL - trim spaces and ensure proper format
const getBaseURL = () => {
  const envURL = import.meta.env.VITE_API_URL;
  
  // In production, warn if VITE_API_URL is not set
  if (!envURL && import.meta.env.PROD) {
    console.error(
      '⚠️ VITE_API_URL is not set! API calls will fail. ' +
      'Please set VITE_API_URL in Vercel environment variables to your backend URL (e.g., https://your-backend.herokuapp.com/api)'
    );
  }
  
  // In development, use relative URL (will be proxied by Vite)
  if (!envURL) {
    return '/api';
  }
  
  // Trim whitespace and remove trailing slashes
  let url = envURL.trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  
  // If URL doesn't end with /api, add it (unless it's already a full API URL)
  if (!url.endsWith('/api') && !url.includes('/api/')) {
    url = url.endsWith('/') ? url + 'api' : url + '/api';
  }
  
  return url;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  // Prevent axios from automatically parsing JSON - we'll handle it manually
  // This allows us to catch HTML responses before they cause parse errors
  transformResponse: [
    (data) => {
      // If data is already parsed (object), return it (shouldn't happen with responseType: 'text')
      if (typeof data === 'object' && data !== null) {
        return data;
      }
      
      // If data is a string, check if it's HTML first (most common error case)
      if (typeof data === 'string') {
        const trimmed = data.trim();
        
        // If it starts with HTML tags, return as-is (interceptor will handle it)
        if (trimmed.startsWith('<!') || trimmed.startsWith('<html') || trimmed.toLowerCase().includes('<!doctype')) {
          return data; // Return HTML as string - don't try to parse
        }
        
        // Only try to parse if it looks like JSON
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
          try {
            return JSON.parse(data);
          } catch (e) {
            // If parsing fails, return the raw data (interceptor will handle it)
            return data;
          }
        }
        
        // If it doesn't look like JSON, return as-is
        return data;
      }
      
      return data;
    }
  ],
  // Override default response type to handle both JSON and text
  responseType: 'text', // Get raw response, then parse manually
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || localStorage.getItem('token'); // Support both for backward compatibility
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors and token refresh
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value?: any) => void; reject: (reason?: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    // Parse the response data if it's a string (with responseType: 'text', all responses are strings)
    if (typeof response.data === 'string') {
      const contentType = response.headers['content-type'] || '';
      const data = response.data.trim();
      
      // If it's HTML, convert to error immediately
      if (data.startsWith('<!') || data.startsWith('<html') || data.toLowerCase().includes('<!doctype')) {
        const baseURL = getBaseURL();
        const isRelativeURL = baseURL.startsWith('/');
        
        let errorMessage = 'API endpoint returned HTML instead of JSON. ';
        if (isRelativeURL && import.meta.env.PROD) {
          errorMessage += 'VITE_API_URL environment variable is not set in Vercel. Please configure it in Vercel project settings to point to your backend API (e.g., https://your-backend.herokuapp.com/api).';
        } else {
          errorMessage += 'The endpoint may not exist or the request failed. Please check the API URL configuration.';
        }
        
        const error: any = new Error(errorMessage);
        error.response = {
          status: response.status || 404,
          statusText: response.statusText || 'Not Found',
          data: { 
            message: errorMessage,
            status: response.status || 404,
            statusText: response.statusText || 'Not Found',
            baseURL: baseURL,
            isRelativeURL: isRelativeURL
          },
          headers: response.headers
        };
        error.config = response.config;
        
        // Log helpful debugging info
        console.error('❌ API Error: Received HTML instead of JSON', {
          url: response.config?.url,
          baseURL: baseURL,
          fullURL: baseURL + (response.config?.url || ''),
          status: response.status,
          isProduction: import.meta.env.PROD,
          viteApiUrl: import.meta.env.VITE_API_URL || 'NOT SET'
        });
        
        return Promise.reject(error);
      }
      
      // Try to parse as JSON if it looks like JSON or content-type says JSON
      if (contentType.includes('application/json') || data.startsWith('{') || data.startsWith('[')) {
        try {
          response.data = JSON.parse(response.data);
        } catch (e) {
          // If parsing fails, create an error
          const error: any = new Error('Failed to parse JSON response from server');
          error.response = {
            status: response.status,
            statusText: response.statusText,
            data: { 
              message: 'Server returned invalid JSON. This may indicate a server error.',
              status: response.status,
              statusText: response.statusText
            },
            headers: response.headers
          };
          error.config = response.config;
          return Promise.reject(error);
        }
      }
      // If it's not JSON and not HTML, leave it as string (might be plain text)
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isLoginPage = window.location.pathname === '/login';
    
    // Handle JSON parse errors (SyntaxError from trying to parse non-JSON as JSON)
    if (error.name === 'SyntaxError' || error.message?.includes('JSON.parse') || error.message?.includes('Unexpected token')) {
      const status = error.response?.status || 404;
      const statusText = error.response?.statusText || 'Not Found';
      const errorMessage = 'API endpoint returned HTML instead of JSON. The endpoint may not exist or the request failed.';
      
      // Create a proper error object
      const parseError: any = new Error(errorMessage);
      parseError.response = {
        status,
        statusText,
        data: { message: errorMessage, status, statusText },
        headers: error.response?.headers || {}
      };
      parseError.config = error.config || originalRequest;
      parseError.status = status;
      
      // If it's a 401, continue with token refresh logic
      if (status === 401 && !originalRequest?._retry && !isLoginPage) {
        // Will be handled below
        error = parseError;
      } else {
        return Promise.reject(parseError);
      }
    }
    
    // Handle non-JSON responses (e.g., HTML error pages)
    if (error.response) {
      const contentType = error.response.headers['content-type'] || '';
      let responseData = error.response.data;
      
      // If data is a string and looks like HTML
      if (typeof responseData === 'string') {
        const trimmed = responseData.trim();
        if (trimmed.startsWith('<!') || trimmed.startsWith('<html')) {
          const status = error.response.status || 404;
          const statusText = error.response.statusText || 'Not Found';
          const errorMessage = status === 404 
            ? 'API endpoint not found'
            : status === 405
            ? `Method ${originalRequest?.method?.toUpperCase() || 'POST'} not allowed for this endpoint`
            : `Server returned ${status} ${statusText}. The API endpoint may not exist.`;
          
          // Replace the error response data with a proper JSON object
          error.response.data = { 
            message: errorMessage, 
            status, 
            statusText
          };
        } else if (!contentType.includes('application/json')) {
          // Not HTML but also not JSON
          const status = error.response.status || 500;
          const statusText = error.response.statusText || 'Unknown Error';
          error.response.data = {
            message: `Server returned ${status} ${statusText}. Expected JSON but received ${contentType}`,
            status,
            statusText
          };
        }
      }
    }
    
    // If 401 and not already retrying and not on login page
    if (error.response?.status === 401 && !originalRequest._retry && !isLoginPage) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Try to refresh the token
        const { data } = await axios.post(`${getBaseURL()}/auth/refresh`, {}, {
          withCredentials: true // Include cookies for refresh token
        });
        
        const { accessToken } = data;
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('token', accessToken); // For backward compatibility
        
        processQueue(null, accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear auth and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (!isLoginPage) {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { username, password }, {
      withCredentials: true // Include cookies for refresh token
    });
    return data;
  },
  loginWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', { email, password }, {
      withCredentials: true // Include cookies for refresh token
    });
    return data;
  },
  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await api.post<{ accessToken: string }>('/auth/refresh', {}, {
      withCredentials: true
    });
    return data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout', {}, {
      withCredentials: true
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  register: async (registrationData: { firstName: string; lastName: string; email: string; password: string; phone?: string }): Promise<{ message: string; accessToken: string; user: User; parishioner: { _id: string; firstName: string; lastName: string } }> => {
    const { data } = await api.post<{ message: string; accessToken: string; user: User; parishioner: { _id: string; firstName: string; lastName: string } }>('/auth/register', registrationData, {
      withCredentials: true // Include cookies for refresh token
    });
    return data;
  },
  getProfileByEmail: async (email: string): Promise<Parishioner> => {
    const { data } = await api.get<Parishioner>(`/auth/profile/by-email/${email}`);
    return data;
  },
  verify: async () => {
    const { data } = await api.get('/auth/verify');
    return data;
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return data;
  },
};

// Announcements API
export const announcementsAPI = {
  getAll: async (): Promise<Announcement[]> => {
    const { data } = await api.get<Announcement[]>('/announcements', {
      headers: {
        'Cache-Control': 'public, max-age=300' // 5 minutes
      }
    });
    return data;
  },
  getAllAdmin: async (): Promise<Announcement[]> => {
    const { data } = await api.get<Announcement[]>('/announcements/all');
    return data;
  },
  getById: async (id: string): Promise<Announcement> => {
    const { data } = await api.get<Announcement>(`/announcements/${id}`);
    return data;
  },
  create: async (announcement: Partial<Announcement>): Promise<Announcement> => {
    const { data } = await api.post<Announcement>('/announcements', announcement);
    return data;
  },
  update: async (id: string, announcement: Partial<Announcement>): Promise<Announcement> => {
    const { data } = await api.put<Announcement>(`/announcements/${id}`, announcement);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/announcements/${id}`);
  },
};

// Events API
export const eventsAPI = {
  getAll: async (): Promise<Event[]> => {
    const { data } = await api.get<Event[]>('/events');
    return data;
  },
  getAllAdmin: async (): Promise<Event[]> => {
    const { data } = await api.get<Event[]>('/events/all');
    return data;
  },
  getById: async (id: string): Promise<Event> => {
    const { data } = await api.get<Event>(`/events/${id}`);
    return data;
  },
  create: async (event: Partial<Event>): Promise<Event> => {
    const { data } = await api.post<Event>('/events', event);
    return data;
  },
  update: async (id: string, event: Partial<Event>): Promise<Event> => {
    const { data } = await api.put<Event>(`/events/${id}`, event);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/events/${id}`);
  },
};

// Mission Stations API
export const missionStationsAPI = {
  getAll: async (): Promise<MissionStation[]> => {
    const { data } = await api.get<MissionStation[]>('/mission-stations');
    return data;
  },
  getAllAdmin: async (): Promise<MissionStation[]> => {
    const { data } = await api.get<MissionStation[]>('/mission-stations/all');
    return data;
  },
  getById: async (id: string): Promise<MissionStation> => {
    const { data } = await api.get<MissionStation>(`/mission-stations/${id}`);
    return data;
  },
  create: async (station: Partial<MissionStation>): Promise<MissionStation> => {
    const { data } = await api.post<MissionStation>('/mission-stations', station);
    return data;
  },
  update: async (id: string, station: Partial<MissionStation>): Promise<MissionStation> => {
    const { data } = await api.put<MissionStation>(`/mission-stations/${id}`, station);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/mission-stations/${id}`);
  },
};

// Mass Schedule API
export const massScheduleAPI = {
  getAll: async (missionStationId?: string): Promise<MassSchedule[]> => {
    const params = missionStationId ? { missionStation: missionStationId } : {};
    const { data } = await api.get<MassSchedule[]>('/mass-schedule', { params });
    return data;
  },
  getAllAdmin: async (): Promise<MassSchedule[]> => {
    const { data } = await api.get<MassSchedule[]>('/mass-schedule/all');
    return data;
  },
  create: async (schedule: Partial<MassSchedule>): Promise<MassSchedule> => {
    const { data } = await api.post<MassSchedule>('/mass-schedule', schedule);
    return data;
  },
  update: async (id: string, schedule: Partial<MassSchedule>): Promise<MassSchedule> => {
    const { data } = await api.put<MassSchedule>(`/mass-schedule/${id}`, schedule);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/mass-schedule/${id}`);
  },
};

// Ministries API
export const ministriesAPI = {
  getAll: async (): Promise<Ministry[]> => {
    const { data } = await api.get<Ministry[]>('/ministries');
    return data;
  },
  getAllAdmin: async (): Promise<Ministry[]> => {
    const { data } = await api.get<Ministry[]>('/ministries/all');
    return data;
  },
  getById: async (id: string): Promise<Ministry> => {
    const { data } = await api.get<Ministry>(`/ministries/${id}`);
    return data;
  },
  create: async (ministry: Partial<Ministry>): Promise<Ministry> => {
    const { data } = await api.post<Ministry>('/ministries', ministry);
    return data;
  },
  update: async (id: string, ministry: Partial<Ministry>): Promise<Ministry> => {
    const { data } = await api.put<Ministry>(`/ministries/${id}`, ministry);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/ministries/${id}`);
  },
};

// Gallery API
export const galleryAPI = {
  getAll: async (): Promise<GalleryItem[]> => {
    const { data } = await api.get<GalleryItem[]>('/gallery', {
      headers: {
        'Cache-Control': 'public, max-age=300' // 5 minutes
      }
    });
    return data;
  },
  getAllAdmin: async (): Promise<GalleryItem[]> => {
    const { data } = await api.get<GalleryItem[]>('/gallery/all');
    return data;
  },
  getById: async (id: string): Promise<GalleryItem> => {
    const { data } = await api.get<GalleryItem>(`/gallery/${id}`);
    return data;
  },
  create: async (item: Partial<GalleryItem>): Promise<GalleryItem> => {
    const { data } = await api.post<GalleryItem>('/gallery', item);
    return data;
  },
  update: async (id: string, item: Partial<GalleryItem>): Promise<GalleryItem> => {
    const { data } = await api.put<GalleryItem>(`/gallery/${id}`, item);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/gallery/${id}`);
  },
};

// Parishioners API (handles both public profile access and admin CRUD operations)
export const parishionersAPI = {
  // Public profile routes
  getProfile: async (id: string): Promise<Parishioner> => {
    const { data } = await api.get<Parishioner>(`/parishioners/profile/${id}`);
    return data;
  },
  updateProfile: async (id: string, parishioner: Partial<Parishioner>): Promise<Parishioner> => {
    const { data } = await api.put<Parishioner>(`/parishioners/profile/${id}`, parishioner);
    return data;
  },
  // Admin CRUD operations
  getAll: async (): Promise<Parishioner[]> => {
    const { data } = await api.get<Parishioner[]>('/parishioners');
    return data;
  },
  getById: async (id: string): Promise<Parishioner> => {
    const { data } = await api.get<Parishioner>(`/parishioners/${id}`);
    return data;
  },
  update: async (id: string, parishioner: Partial<Parishioner>): Promise<Parishioner> => {
    const { data } = await api.put<Parishioner>(`/parishioners/${id}`, parishioner);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/parishioners/${id}`);
  },
};

// Prayers API
export const prayersAPI = {
  getAll: async (): Promise<Prayer[]> => {
    const { data } = await api.get<Prayer[]>('/prayers');
    return data;
  },
  getAllAdmin: async (): Promise<Prayer[]> => {
    const { data } = await api.get<Prayer[]>('/prayers/all');
    return data;
  },
  getById: async (id: string): Promise<Prayer> => {
    const { data } = await api.get<Prayer>(`/prayers/${id}`);
    return data;
  },
  create: async (prayer: Partial<Prayer>): Promise<Prayer> => {
    const { data } = await api.post<Prayer>('/prayers', prayer);
    return data;
  },
  update: async (id: string, prayer: Partial<Prayer>): Promise<Prayer> => {
    const { data } = await api.put<Prayer>(`/prayers/${id}`, prayer);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/prayers/${id}`);
  },
};

// Sermons API
export const sermonsAPI = {
  getAll: async (): Promise<Sermon[]> => {
    const { data } = await api.get<Sermon[]>('/sermons');
    return data;
  },
  getAllAdmin: async (): Promise<Sermon[]> => {
    const { data } = await api.get<Sermon[]>('/sermons/all');
    return data;
  },
  getById: async (id: string): Promise<Sermon> => {
    const { data } = await api.get<Sermon>(`/sermons/${id}`);
    return data;
  },
  create: async (sermon: Partial<Sermon>): Promise<Sermon> => {
    const { data } = await api.post<Sermon>('/sermons', sermon);
    return data;
  },
  update: async (id: string, sermon: Partial<Sermon>): Promise<Sermon> => {
    const { data } = await api.put<Sermon>(`/sermons/${id}`, sermon);
    return data;
  },
  delete: async (id: string): Promise<void> => {
    await api.delete(`/sermons/${id}`);
  },
};

// Liturgical Color API
export interface LiturgicalColorResponse {
  color: string;
  hex: string;
  tailwind: {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
  date: string;
  timestamp: string;
}

export const liturgicalColorAPI = {
  getCurrent: async (): Promise<LiturgicalColorResponse> => {
    const { data } = await api.get<LiturgicalColorResponse>('/liturgical-color');
    return data;
  },
  getByDate: async (date: string): Promise<LiturgicalColorResponse> => {
    const { data } = await api.get<LiturgicalColorResponse>(`/liturgical-color/${date}`);
    return data;
  },
};

// Liturgical Color Overrides API (Admin only)
export interface ColorOverride {
  _id?: string;
  date: string;
  color: 'white' | 'red' | 'green' | 'purple' | 'rose' | 'gold';
  reason?: string;
  createdBy?: {
    username?: string;
    email?: string;
  };
  createdAt?: string;
}

export interface ColorOverridesResponse {
  overrides: ColorOverride[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const liturgicalColorOverridesAPI = {
  getAll: async (page = 1, limit = 20): Promise<ColorOverridesResponse> => {
    const { data } = await api.get<ColorOverridesResponse>('/liturgical-color-overrides', {
      params: { page, limit }
    });
    return data;
  },
  getByDate: async (date: string): Promise<ColorOverride> => {
    const { data } = await api.get<ColorOverride>(`/liturgical-color-overrides/${date}`);
    return data;
  },
  create: async (override: { date: string; color: ColorOverride['color']; reason?: string }): Promise<ColorOverride> => {
    const { data } = await api.post<ColorOverride>('/liturgical-color-overrides', override);
    return data;
  },
  update: async (date: string, override: { color: ColorOverride['color']; reason?: string }): Promise<ColorOverride> => {
    const { data } = await api.put<ColorOverride>(`/liturgical-color-overrides/${date}`, override);
    return data;
  },
  delete: async (date: string): Promise<void> => {
    await api.delete(`/liturgical-color-overrides/${date}`);
  },
};

// Contact API
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  message: string;
  success: boolean;
}

export const contactAPI = {
  submit: async (formData: ContactFormData): Promise<ContactResponse> => {
    const { data } = await api.post<ContactResponse>('/contact', formData);
    return data;
  },
};

// Users API (Admin/Parish-Priest only)
export interface UserWithDetails extends User {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
  parishioner?: {
    _id: string;
    firstName: string;
    lastName: string;
    email?: string;
  } | string;
}

export const usersAPI = {
  getAll: async (): Promise<UserWithDetails[]> => {
    const { data } = await api.get<UserWithDetails[]>('/users');
    return data;
  },
  getById: async (id: string): Promise<UserWithDetails> => {
    const { data } = await api.get<UserWithDetails>(`/users/${id}`);
    return data;
  },
  updateRole: async (id: string, role: User['role']): Promise<UserWithDetails> => {
    const { data } = await api.put<UserWithDetails>(`/users/${id}/role`, { role });
    return data;
  },
};

// Saints API
export const saintsAPI = {
  getToday: async (): Promise<SaintDay> => {
    const { data } = await api.get<SaintDay>('/saints/today');
    return data;
  },
  getUpcoming: async (days = 9): Promise<{ feasts: SaintDay[]; count: number }> => {
    const { data } = await api.get<{ feasts: SaintDay[]; count: number }>('/saints/upcoming', {
      params: { days }
    });
    return data;
  },
  getAll: async (days = 9): Promise<SaintsResponse> => {
    const { data } = await api.get<SaintsResponse>('/saints', {
      params: { days }
    });
    return data;
  },
};

// Donations API
export interface CreatePayPalOrderData {
  amount: number;
  currency: string;
  purpose: Donation['purpose'];
  donor: {
    name: string;
    email: string;
    phone?: string;
  };
  purposeDescription?: string;
  notes?: string;
  isAnonymous?: boolean;
}

export interface CreateMTNRequestData {
  amount: number;
  phoneNumber: string;
  purpose: Donation['purpose'];
  donor: {
    name: string;
    email: string;
    phone?: string;
  };
  purposeDescription?: string;
  notes?: string;
  isAnonymous?: boolean;
}

export interface PayPalOrderResponse {
  donationId: string;
  orderId: string;
  approvalUrl: string;
  status: string;
}

export interface MTNRequestResponse {
  donationId: string;
  referenceId: string;
  phoneNumber: string;
  status: string;
  message: string;
}

export interface PaymentStatusResponse {
  status: string;
  paymentStatus?: string;
  donation: Donation;
}

export interface PaymentMethodsStatus {
  paypal: {
    available: boolean;
    configured: boolean;
  };
  mtnMobileMoney: {
    available: boolean;
    configured: boolean;
  };
}

export const donationsAPI = {
  getPaymentMethodsStatus: async (): Promise<PaymentMethodsStatus> => {
    const { data } = await api.get<PaymentMethodsStatus>('/donations/payment-methods/status');
    return data;
  },
  getAll: async (params?: { status?: string; paymentMethod?: string; purpose?: string; page?: number; limit?: number }): Promise<{ donations: Donation[]; pagination: any }> => {
    const { data } = await api.get<{ donations: Donation[]; pagination: any }>('/donations', { params });
    return data;
  },
  getById: async (id: string): Promise<Donation> => {
    const { data } = await api.get<Donation>(`/donations/${id}`);
    return data;
  },
  createPayPalOrder: async (orderData: CreatePayPalOrderData): Promise<PayPalOrderResponse> => {
    const { data } = await api.post<PayPalOrderResponse>('/donations/paypal/create-order', orderData);
    return data;
  },
  capturePayPalOrder: async (orderId: string, donationId: string): Promise<{ success: boolean; donation: Donation; transactionId: string }> => {
    const { data } = await api.post<{ success: boolean; donation: Donation; transactionId: string }>('/donations/paypal/capture', { orderId, donationId });
    return data;
  },
  createMTNRequest: async (requestData: CreateMTNRequestData): Promise<MTNRequestResponse> => {
    const { data } = await api.post<MTNRequestResponse>('/donations/mtn/create-request', requestData);
    return data;
  },
  checkMTNStatus: async (donationId: string): Promise<PaymentStatusResponse> => {
    const { data } = await api.post<PaymentStatusResponse>('/donations/mtn/check-status', { donationId });
    return data;
  },
};


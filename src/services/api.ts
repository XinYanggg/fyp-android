import { Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Farm, Tree, User } from '../types';

WebBrowser.maybeCompleteAuthSession();

/**
 * Android Studio Emulator uses 10.0.2.2 to access host machine's localhost:3000.
 * iOS Simulator or web uses localhost:3000.
 */
const DEFAULT_HOST = process.env.EXPO_PUBLIC_API_URL!;

if (typeof DEFAULT_HOST !== "string") {
  throw new Error("EXPO_PUBLIC_API_URL is not configured");
}

class ApiService {
  private baseUrl: string = DEFAULT_HOST;
  private token: string | null = null;

  public setBaseUrl(url: string) {
    this.baseUrl = url.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setToken(token: string | null) {
    this.token = token;
  }

  public getToken(): string | null {
    return this.token;
  }

  private getHeaders(isFormData = false): Record<string, string> {
    const headers: Record<string, string> = {};
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      // Also provide Cookie for NextAuth compatibility
      headers['Cookie'] = `next-auth.session-token=${this.token}`;
    }
    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}, isFormData = false): Promise<T> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers = {
      ...this.getHeaders(isFormData),
      ...(options.headers as Record<string, string> || {}),
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;
      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        try {
          data = JSON.parse(text);
        } catch {
          data = { message: text };
        }
      }

      if (!response.ok) {
        const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
      }

      return data as T;
    } catch (err: any) {
      if (err.message === 'Network request failed') {
        throw new Error(`Cannot connect to server at ${this.baseUrl}. Make sure your Next.js server is running (npm run dev).`);
      }
      throw err;
    }
  }

  /**
   * Health / ping check
   */
  public async ping(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${this.baseUrl}/api/mobile/me`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      // If it responded (even 401 Unauthorized), the server is alive!
      return res.status === 200 || res.status === 401;
    } catch {
      return false;
    }
  }

  /**
   * Mobile Login (Email & Password)
   */
  public async login(email: string, password: string): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/api/mobile/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  /**
   * Mobile Google Sign-In: exchange a Google ID token for an app session token
   */
  public async googleLogin(idToken: string): Promise<{ token: string; user: User }> {
    return this.request<{ token: string; user: User }>('/api/mobile/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
  }

  /**
   * Mobile Registration (uses the original /api/register endpoint)
   */
  public async register(
    name: string,
    email: string,
    password: string
  ): Promise<{ message: string }> {
    return this.request<{ message: string }>(
      '/api/register',
      {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }
    );
  }

  /**
   * Fetch current user session
   */
  public async getMe(): Promise<{ user: User }> {
    return this.request<{ user: User }>('/api/mobile/me', {
      method: 'GET',
    });
  }

  /**
   * Get all farms for current user
   */
  public async getFarms(): Promise<Farm[]> {
    const data = await this.request<{ farms: Farm[] }>('/api/farm/get', {
      method: 'GET',
    });
    return data.farms || [];
  }

  /**
   * Create a new farm
   */
  public async addFarm(name: string, location: string): Promise<Farm> {
    const data = await this.request<{ farm: Farm }>('/api/farm/add', {
      method: 'POST',
      body: JSON.stringify({ name, location }),
    });
    return data.farm;
  }

  /**
   * Add a tree to a farm
   */
  public async addTree(farmId: string, treeId: string, cultivar: string): Promise<{ message: string; farm: Farm }> {
    return this.request<{ message: string; farm: Farm }>('/api/farm/tree/add', {
      method: 'POST',
      body: JSON.stringify({ farmId, treeId, cultivar }),
    });
  }

  /**
   * Detect leaf disease via Next.js proxy -> Python AI model
   */
  public async detectDisease(imageUri: string): Promise<{ prediction: string; confidence: number }> {
    const formData = new FormData();
    const filename = imageUri.split('/').pop() || 'leaf.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : 'image/jpeg';

    formData.append('file', {
      uri: imageUri,
      name: filename,
      type,
    } as any);

    return this.request<{ prediction: string; confidence: number }>('/api/scan/detect', {
      method: 'POST',
      body: formData,
    }, true);
  }

  /**
   * Save a disease scan result to a tree's history
   */
  public async saveScan(
    farmId: string,
    treeId: string,
    disease: string,
    confidence: number
  ): Promise<{ farm: Farm }> {
    return this.request<{ farm: Farm }>('/api/scan/save', {
      method: 'POST',
      body: JSON.stringify({ farmId, treeId, disease, confidence }),
    });
  }
}

export const api = new ApiService();

import axios, { AxiosInstance } from "axios";
import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL =
    Constants.expoConfig?.extra?.apiUrl ||
    process.env.EXPO_PUBLIC_API_URL ||
    "http://localhost:3000";

class APIClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            timeout: 30000,
            headers: {
                "Content-Type": "application/json",
            },
        });

        // Add request interceptor for auth token
        this.client.interceptors.request.use(async (config) => {
            try {
                const token = await AsyncStorage.getItem("auth_token");
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (e) {
                console.error("AsyncStorage error in request interceptor", e);
            }
            return config;
        });

        // Add response interceptor for error handling
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                if (error.response?.status === 401) {
                    // Handle unauthorized - redirect to login
                    try {
                        await AsyncStorage.removeItem("auth_token");
                    } catch (e) {
                        console.error("AsyncStorage error in response interceptor", e);
                    }
                    // Trigger logout event
                }
                return Promise.reject(error);
            }
        );
    }

    // ============ AUTH ============
    async login(email: string, password: string) {
        return this.client.post("/api/auth/login", { email, password });
    }

    async register(data: any) {
        return this.client.post("/api/auth/register", data);
    }

    async logout() {
        return this.client.post("/api/auth/logout");
    }

    async getCurrentUser() {
        return this.client.get("/api/auth/me");
    }

    // ============ EVENTS ============
    async getEvents() {
        return this.client.get("/api/admin/events");
    }

    async getEventById(id: string) {
        return this.client.get(`/api/admin/events/${id}`);
    }

    async createEvent(data: any) {
        return this.client.post("/api/admin/events", data);
    }

    async updateEvent(id: string, data: any) {
        return this.client.put(`/api/admin/events/${id}`, data);
    }

    async deleteEvent(id: string) {
        return this.client.delete(`/api/admin/events/${id}`);
    }

    async registerForEvent(eventId: string, data: any) {
        return this.client.post(`/api/events/${eventId}/register`, data);
    }

    // ============ ANNOUNCEMENTS ============
    async getAnnouncements() {
        return this.client.get("/api/admin/announcements");
    }

    async createAnnouncement(data: any) {
        return this.client.post("/api/admin/announcements", data);
    }

    async updateAnnouncement(id: string, data: any) {
        return this.client.put(`/api/admin/announcements/${id}`, data);
    }

    async deleteAnnouncement(id: string) {
        return this.client.delete(`/api/admin/announcements/${id}`);
    }

    // ============ SERMONS ============
    async getSermons() {
        return this.client.get("/api/admin/sermons");
    }

    async getSermonSeries() {
        return this.client.get("/api/admin/sermon-series");
    }

    async createSermon(data: any) {
        return this.client.post("/api/admin/sermons", data);
    }

    async updateSermon(id: string, data: any) {
        return this.client.put(`/api/admin/sermons/${id}`, data);
    }

    async deleteSermon(id: string) {
        return this.client.delete(`/api/admin/sermons/${id}`);
    }

    // ============ VERSES ============
    async getDailyVerse() {
        return this.client.get("/api/verses/today");
    }

    async getVerses() {
        return this.client.get("/api/admin/verses");
    }

    async createVerse(data: any) {
        return this.client.post("/api/admin/verses", data);
    }

    // ============ PRAYERS ============
    async getPrayerRequests() {
        return this.client.get("/api/prayers");
    }

    async createPrayerRequest(data: any) {
        return this.client.post("/api/prayers", data);
    }

    async prayForRequest(id: string) {
        return this.client.post(`/api/prayers/${id}/pray`);
    }

    // ============ LIVE STREAM ============
    async checkLiveStatus() {
        return this.client.get("/api/youtube/check-live");
    }

    // ============ GALLERY ============
    async getGalleryPhotos(url: string) {
        return this.client.get(`/api/gallery/photos?url=${encodeURIComponent(url)}`);
    }

    // ============ CAMPUSES ============
    async getCampuses() {
        return this.client.get("/api/campuses");
    }

    // ============ USERS ============
    async getUsers() {
        return this.client.get("/api/admin/users");
    }

    async updateUserRole(id: string, role: string) {
        return this.client.put(`/api/admin/users/${id}`, { role });
    }
}

export const apiClient = new APIClient();

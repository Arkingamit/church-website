import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiClient } from "./api";

interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin" | "super_admin" | "campus_leader";
    campusId?: string;
}

interface AuthContextType {
    user: User | null;
    session: User | null;
    isLoading: boolean;
    isSignedIn: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth on mount
    useEffect(() => {
        bootstrapAsync();
    }, []);

    const bootstrapAsync = async () => {
        try {
            const token = await AsyncStorage.getItem("auth_token");
            if (token) {
                const res = await apiClient.getCurrentUser();
                setUser(res.data.user);
            }
        } catch (e) {
            console.error("Failed to restore token", e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const res = await apiClient.login(email, password);
            const { token, user: userData } = res.data;
            await AsyncStorage.setItem("auth_token", token);
            setUser(userData);
        } catch (error) {
            throw error;
        }
    };

    const register = async (data: any) => {
        try {
            const res = await apiClient.register(data);
            const { token, user: userData } = res.data;
            await AsyncStorage.setItem("auth_token", token);
            setUser(userData);
        } catch (error) {
            throw error;
        }
    };

    const logout = async () => {
        try {
            await apiClient.logout();
            await AsyncStorage.removeItem("auth_token");
            setUser(null);
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const updateProfile = async (data: any) => {
        try {
            const res = await apiClient.getCurrentUser();
            setUser(res.data.user);
        } catch (error) {
            throw error;
        }
    };

    const value = {
        user,
        session: user,
        isLoading,
        isSignedIn: !!user,
        login,
        register,
        logout,
        updateProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}

import React, { createContext, useContext, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./api";

interface AdminDataContextType {
    events: any[];
    announcements: any[];
    sermons: any[];
    sermonSeries: any[];
    verses: any[];
    prayerRequests: any[];
    campuses: any[];
    liveStreams: any[];
    users: any[];
    isLoading: boolean;
    refetch: () => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(
    undefined
);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);

    // Fetch all data on mount
    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setIsLoading(true);
            const [
                eventsRes,
                announcementsRes,
                sermonsRes,
                versesRes,
                prayersRes,
                campusesRes,
            ] = await Promise.allSettled([
                apiClient.getEvents(),
                apiClient.getAnnouncements(),
                apiClient.getSermons(),
                apiClient.getDailyVerse(),
                apiClient.getPrayerRequests(),
                apiClient.getCampuses(),
            ]);

            const extractData = (result: any) => {
                return result.status === "fulfilled" ? result.value.data : [];
            };

            setData({
                events: extractData(eventsRes),
                announcements: extractData(announcementsRes),
                sermons: extractData(sermonsRes),
                sermonSeries: [], // Add sermon series logic
                verses: [extractData(versesRes)],
                prayerRequests: extractData(prayersRes),
                campuses: extractData(campusesRes),
                liveStreams: [], // Add live streams logic
                users: [],
            });
        } catch (error) {
            console.error("Failed to fetch admin data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const value: AdminDataContextType = {
        events: data.events || [],
        announcements: data.announcements || [],
        sermons: data.sermons || [],
        sermonSeries: data.sermonSeries || [],
        verses: data.verses || [],
        prayerRequests: data.prayerRequests || [],
        campuses: data.campuses || [],
        liveStreams: data.liveStreams || [],
        users: data.users || [],
        isLoading,
        refetch: fetchAllData,
    };

    return (
        <AdminDataContext.Provider value={value}>
            {children}
        </AdminDataContext.Provider>
    );
}

export function useAdminData() {
    const context = useContext(AdminDataContext);
    if (context === undefined) {
        throw new Error("useAdminData must be used within an AdminDataProvider");
    }
    return context;
}

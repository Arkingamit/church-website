export interface Event {
    id: string;
    title: string;
    description?: string;
    date: string;
    time: string;
    location: string;
    category?: string;
    isFeatured?: boolean;
    googlePhotosUrl?: string;
    formFields?: FormField[];
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    createdAt: string;
    campusId?: string;
}

export interface Sermon {
    id: string;
    title: string;
    description?: string;
    pastor: string;
    date: string;
    videoId: string;
    seriesId: string;
    duration: string;
    category?: string;
    isFeatured?: boolean;
    views: number;
    likes: number;
}

export interface SermonSeries {
    id: string;
    title: string;
    description?: string;
}

export interface DailyVerse {
    text: string;
    reference: string;
}

export interface PrayerRequest {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
    prayerCount: number;
    isPrayed?: boolean;
}

export interface Campus {
    id: string;
    name: string;
    address: string;
    city: string;
    zipCode: string;
    phone: string;
    email: string;
    pastor: string;
    serviceTimes: {
        day: string;
        times: string[];
    }[];
    latitude?: number;
    longitude?: number;
}

export interface FormField {
    id: string;
    label: string;
    type: "text" | "textarea" | "checkbox" | "radio" | "select";
    required?: boolean;
    options?: string[];
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: "user" | "admin" | "super_admin" | "campus_leader";
    campusId?: string;
    createdAt?: string;
}

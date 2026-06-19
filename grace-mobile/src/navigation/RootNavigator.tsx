import React from "react";
import {
    createNativeStackNavigator,
    NativeStackScreenProps,
} from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { useAuth } from "@/lib/auth";

// Public screens
import HomeScreen from "@/screens/public/HomeScreen";
import EventsScreen from "@/screens/public/EventsScreen";
import EventDetailScreen from "@/screens/public/EventDetailScreen";
import GalleryScreen from "@/screens/public/GalleryScreen";
import SermonsScreen from "@/screens/public/SermonsScreen";
import SermonDetailScreen from "@/screens/public/SermonDetailScreen";
import LiveStreamScreen from "@/screens/public/LiveStreamScreen";
import PrayerWallScreen from "@/screens/public/PrayerWallScreen";
import LoginScreen from "@/screens/auth/LoginScreen";
import RegisterScreen from "@/screens/auth/RegisterScreen";
import ProfileScreen from "@/screens/auth/ProfileScreen";

// Admin screens
import AdminDashboardScreen from "@/screens/admin/AdminDashboardScreen";
import AdminEventsScreen from "@/screens/admin/AdminEventsScreen";
import AdminAnnouncementsScreen from "@/screens/admin/AdminAnnouncementsScreen";
import AdminSermonsScreen from "@/screens/admin/AdminSermonsScreen";
import AdminVersesScreen from "@/screens/admin/AdminVersesScreen";
import AdminUsersScreen from "@/screens/admin/AdminUsersScreen";

export type RootStackParamList = {
    PublicTabs: undefined;
    AdminDrawer: undefined;
    Login: undefined;
    Register: undefined;
    EventDetail: { id: string };
    SermonDetail: { id: string };
    Profile: undefined;
};

export type PublicTabParamList = {
    Home: undefined;
    Events: undefined;
    Gallery: undefined;
    LiveStream: undefined;
    PrayerWall: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const PublicTab = createBottomTabNavigator<PublicTabParamList>();
const AdminDrawer = createDrawerNavigator();

// ===== PUBLIC TABS NAVIGATOR =====
export function PublicTabsNavigator() {
    return (
        <PublicTab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#e8f4ff",
                tabBarInactiveTintColor: "#726d7a",
                tabBarStyle: {
                    backgroundColor: "#131c2a",
                    borderTopColor: "#1a2432",
                    paddingBottom: 8,
                },
            }}
        >
            <PublicTab.Screen
                name="Home"
                component={HomeScreen}
                options={{
                    title: "Home",
                    tabBarLabel: "Home",
                }}
            />
            <PublicTab.Screen
                name="Events"
                component={EventsScreen}
                options={{
                    title: "Events",
                    tabBarLabel: "Events",
                }}
            />
            <PublicTab.Screen
                name="Gallery"
                component={GalleryScreen}
                options={{
                    title: "Gallery",
                    tabBarLabel: "Gallery",
                }}
            />
            <PublicTab.Screen
                name="LiveStream"
                component={LiveStreamScreen}
                options={{
                    title: "Live",
                    tabBarLabel: "Live",
                }}
            />
            <PublicTab.Screen
                name="PrayerWall"
                component={PrayerWallScreen}
                options={{
                    title: "Pray",
                    tabBarLabel: "Pray",
                }}
            />
        </PublicTab.Navigator>
    );
}

// ===== ADMIN DRAWER NAVIGATOR =====
export function AdminDrawerNavigator() {
    return (
        <AdminDrawer.Navigator
            screenOptions={{
                drawerStyle: {
                    backgroundColor: "#131c2a",
                },
                drawerLabelStyle: {
                    color: "#faf8fe",
                },
            }}
        >
            <AdminDrawer.Screen
                name="AdminDashboard"
                component={AdminDashboardScreen}
                options={{ title: "Dashboard" }}
            />
            <AdminDrawer.Screen
                name="AdminEvents"
                component={AdminEventsScreen}
                options={{ title: "Events" }}
            />
            <AdminDrawer.Screen
                name="AdminAnnouncements"
                component={AdminAnnouncementsScreen}
                options={{ title: "Announcements" }}
            />
            <AdminDrawer.Screen
                name="AdminSermons"
                component={AdminSermonsScreen}
                options={{ title: "Sermons" }}
            />
            <AdminDrawer.Screen
                name="AdminVerses"
                component={AdminVersesScreen}
                options={{ title: "Verses" }}
            />
            <AdminDrawer.Screen
                name="AdminUsers"
                component={AdminUsersScreen}
                options={{ title: "Users" }}
            />
        </AdminDrawer.Navigator>
    );
}

// ===== ROOT NAVIGATOR =====
export function RootNavigator() {
    const { isSignedIn, user } = useAuth();

    return (
        <RootStack.Navigator
            screenOptions={{
                headerShown: false,
                animationEnabled: true,
            }}
        >
            {!isSignedIn ? (
                <>
                    <RootStack.Screen name="Login" component={LoginScreen} />
                    <RootStack.Screen name="Register" component={RegisterScreen} />
                    <RootStack.Screen
                        name="PublicTabs"
                        component={PublicTabsNavigator}
                        options={{
                            headerShown: false,
                        }}
                    />
                </>
            ) : user?.role === "admin" || user?.role === "super_admin" ? (
                <>
                    <RootStack.Screen
                        name="AdminDrawer"
                        component={AdminDrawerNavigator}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <RootStack.Screen name="Profile" component={ProfileScreen} />
                </>
            ) : (
                <>
                    <RootStack.Screen
                        name="PublicTabs"
                        component={PublicTabsNavigator}
                        options={{
                            headerShown: false,
                        }}
                    />
                    <RootStack.Screen name="EventDetail" component={EventDetailScreen} />
                    <RootStack.Screen name="SermonDetail" component={SermonDetailScreen} />
                    <RootStack.Screen name="Profile" component={ProfileScreen} />
                </>
            )}
        </RootStack.Navigator>
    );
}

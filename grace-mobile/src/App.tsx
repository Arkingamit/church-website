import React, { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";

import { AuthProvider, useAuth } from "@/lib/auth";
import { AdminDataProvider } from "@/lib/admin-data-context";
import { RootNavigator } from "@/navigation/RootNavigator";

// Keep splash screen visible while loading resources
SplashScreen.preventAutoHideAsync().catch(() => { });

const queryClient = new QueryClient();

function NavigationWrapper() {
    const { isLoading } = useAuth();
    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                // Resources to load can go here
                // For now, just a small delay to show splash screen
                await new Promise((resolve) => setTimeout(resolve, 500));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        }

        prepare();
    }, []);

    useEffect(() => {
        if (appIsReady && !isLoading) {
            SplashScreen.hideAsync().catch(() => { });
        }
    }, [appIsReady, isLoading]);

    if (!appIsReady || isLoading) {
        return null;
    }

    return (
        <NavigationContainer>
            <StatusBar barStyle="light-content" />
            <RootNavigator />
        </NavigationContainer>
    );
}

export default function App() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                        <AdminDataProvider>
                            <NavigationWrapper />
                        </AdminDataProvider>
                    </AuthProvider>
                </QueryClientProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

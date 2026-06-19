import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

const ProfileScreen = ({ navigation }: any) => {
    const { user, logout } = useAuth();

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Profile</Text>
                <View style={styles.card}>
                    <Text style={styles.label}>Name</Text>
                    <Text style={styles.value}>{user?.name}</Text>
                    <Text style={styles.label}>Email</Text>
                    <Text style={styles.value}>{user?.email}</Text>
                    <Text style={styles.label}>Role</Text>
                    <Text style={styles.value}>{user?.role}</Text>
                </View>

                <Pressable
                    style={styles.logoutButton}
                    onPress={() => {
                        logout();
                    }}
                >
                    <Text style={styles.logoutButtonText}>Sign Out</Text>
                </Pressable>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 24,
        paddingTop: 40,
    },
    title: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        marginBottom: 24,
    },
    card: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 20,
        marginBottom: 24,
        borderColor: colors.border,
        borderWidth: 1,
    },
    label: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
        marginTop: 12,
        marginBottom: 4,
        fontWeight: fontWeight.semibold,
    },
    value: {
        fontSize: fontSize.base,
        color: colors.foreground,
    },
    logoutButton: {
        backgroundColor: colors.destructive,
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    logoutButtonText: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.destructiveForeground,
    },
});

export default ProfileScreen;

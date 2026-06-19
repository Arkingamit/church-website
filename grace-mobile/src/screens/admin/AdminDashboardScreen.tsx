import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";

const AdminDashboardScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Admin Dashboard</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        padding: 24,
    },
    title: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
    },
});

export default AdminDashboardScreen;

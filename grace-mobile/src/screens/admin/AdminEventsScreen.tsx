import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";

const AdminEventsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage Events</Text>
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

export default AdminEventsScreen;

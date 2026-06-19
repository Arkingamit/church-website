import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";

const PrayerWallScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Prayer Wall</Text>
            <Text style={styles.subtitle}>Share your prayer requests</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: "center",
        alignItems: "center",
    },
    title: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.mutedForeground,
    },
});

export default PrayerWallScreen;

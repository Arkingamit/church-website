import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";

const LiveStreamScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Live Worship</Text>
            <Text style={styles.subtitle}>Join us online for live worship</Text>
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

export default LiveStreamScreen;

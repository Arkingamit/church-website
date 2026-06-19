import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";

const SermonsScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sermons</Text>
            <Text style={styles.subtitle}>Life-changing messages that inspire and strengthen</Text>
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
        textAlign: "center",
        paddingHorizontal: 20,
    },
});

export default SermonsScreen;

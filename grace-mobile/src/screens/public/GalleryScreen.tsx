import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";

const GalleryScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Photo Gallery</Text>
            <Text style={styles.subtitle}>
                Capturing moments of faith, fellowship, and community
            </Text>
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

export default GalleryScreen;

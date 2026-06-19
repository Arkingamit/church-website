import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";

const AdminVersesScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manage Verses</Text>
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

export default AdminVersesScreen;

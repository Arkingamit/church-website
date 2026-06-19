import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";

const SermonDetailScreen = ({ route }: any) => {
    const { id } = route.params;

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sermon Detail</Text>
            <Text style={styles.id}>Sermon ID: {id}</Text>
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
    },
    id: {
        fontSize: fontSize.base,
        color: colors.mutedForeground,
        marginTop: 12,
    },
});

export default SermonDetailScreen;

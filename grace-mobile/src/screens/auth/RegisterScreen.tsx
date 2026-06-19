import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

const RegisterScreen = ({ navigation }: any) => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Create Account</Text>
                <Text style={styles.subtitle}>Join Grace Community today</Text>
                {/* Registration form UI to be implemented */}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: fontSize["3xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: fontSize.base,
        color: colors.mutedForeground,
        marginBottom: 40,
    },
});

export default RegisterScreen;

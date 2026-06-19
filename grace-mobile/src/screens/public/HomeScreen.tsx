import React from "react";
import { View, Text, ScrollView, StyleSheet, Pressable } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";

const HomeScreen = () => {
    return (
        <ScrollView style={styles.container}>
            {/* Hero Section */}
            <View style={styles.heroSection}>
                <Text style={styles.heroTitle}>Welcome to Grace Community</Text>
                <Text style={styles.heroSubtitle}>
                    A place where faith grows, hearts connect, and lives are transformed
                </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonRow}>
                <Pressable style={[styles.button, styles.primaryButton]}>
                    <Text style={styles.buttonText}>Join Us Sunday</Text>
                </Pressable>
                <Pressable style={[styles.button, styles.secondaryButton]}>
                    <Text style={styles.buttonText}>Watch Live</Text>
                </Pressable>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>2,500+</Text>
                    <Text style={styles.statLabel}>Members</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>25+</Text>
                    <Text style={styles.statLabel}>Small Groups</Text>
                </View>
                <View style={styles.stat}>
                    <Text style={styles.statValue}>15</Text>
                    <Text style={styles.statLabel}>Years Serving</Text>
                </View>
            </View>

            {/* Daily Verse Card */}
            <View style={styles.verseCard}>
                <Text style={styles.verseLabel}>Daily Bible Verse</Text>
                <Text style={styles.verseText}>
                    "The Lord is my shepherd; I shall not want."
                </Text>
                <Text style={styles.verseReference}>— Psalm 23:1</Text>
            </View>

            {/* Featured Content */}
            <View style={styles.contentSection}>
                <Text style={styles.sectionTitle}>Latest Updates</Text>
                <View style={styles.contentCard}>
                    <Text style={styles.contentCardTitle}>Upcoming Event</Text>
                    <Text style={styles.contentCardDesc}>
                        Join us for our annual worship conference
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    heroSection: {
        padding: 24,
        paddingTop: 40,
        alignItems: "center",
    },
    heroTitle: {
        fontSize: fontSize["3xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        marginBottom: 12,
        textAlign: "center",
    },
    heroSubtitle: {
        fontSize: fontSize.lg,
        color: colors.mutedForeground,
        textAlign: "center",
        marginBottom: 24,
    },
    buttonRow: {
        flexDirection: "row",
        gap: 12,
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    button: {
        flex: 1,
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    primaryButton: {
        backgroundColor: colors.primary,
    },
    secondaryButton: {
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
    },
    buttonText: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
    },
    statsContainer: {
        flexDirection: "row",
        paddingHorizontal: 24,
        marginBottom: 32,
        gap: 16,
    },
    stat: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeight.bold,
        color: colors.primary,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
    verseCard: {
        marginHorizontal: 24,
        marginBottom: 32,
        padding: 20,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
    },
    verseLabel: {
        fontSize: fontSize.xs,
        color: colors.accent,
        marginBottom: 12,
        textTransform: "uppercase",
        fontWeight: fontWeight.semibold,
    },
    verseText: {
        fontSize: fontSize.lg,
        color: colors.foreground,
        fontStyle: "italic",
        marginBottom: 12,
        lineHeight: 24,
    },
    verseReference: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
        textAlign: "right",
    },
    contentSection: {
        paddingHorizontal: 24,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: fontSize.xl,
        fontWeight: fontWeight.bold,
        color: colors.foreground,
        marginBottom: 16,
    },
    contentCard: {
        padding: 16,
        backgroundColor: colors.card,
        borderRadius: 12,
        borderColor: colors.border,
        borderWidth: 1,
    },
    contentCardTitle: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
        marginBottom: 8,
    },
    contentCardDesc: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
});

export default HomeScreen;

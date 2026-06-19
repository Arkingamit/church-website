import React from "react";
import { View, Text, FlatList, StyleSheet, Pressable } from "react-native";
import { colors, fontSize, fontWeight } from "@/lib/theme";
import { useAdminData } from "@/lib/admin-data-context";

const EventsScreen = ({ navigation }: any) => {
    const { events, isLoading } = useAdminData();

    const renderEvent = ({ item }: any) => (
        <Pressable
            style={styles.eventCard}
            onPress={() => navigation.navigate("EventDetail", { id: item.id })}
        >
            <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{item.title}</Text>
            </View>
            <Text style={styles.eventDate}>{item.date} at {item.time}</Text>
            <Text style={styles.eventLocation}>{item.location}</Text>
            <Text
                style={styles.eventDesc}
                numberOfLines={2}
            >
                {item.description}
            </Text>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Events</Text>
            </View>
            <FlatList
                data={events}
                renderItem={renderEvent}
                keyExtractor={(item) => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                scrollEnabled={true}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
    },
    title: {
        fontSize: fontSize["2xl"],
        fontWeight: fontWeight.bold,
        color: colors.foreground,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 16,
        paddingBottom: 20,
    },
    eventCard: {
        backgroundColor: colors.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderColor: colors.border,
        borderWidth: 1,
    },
    eventHeader: {
        marginBottom: 12,
    },
    eventTitle: {
        fontSize: fontSize.base,
        fontWeight: fontWeight.semibold,
        color: colors.foreground,
    },
    eventDate: {
        fontSize: fontSize.sm,
        color: colors.primary,
        marginBottom: 4,
    },
    eventLocation: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
        marginBottom: 8,
    },
    eventDesc: {
        fontSize: fontSize.sm,
        color: colors.mutedForeground,
    },
});

export default EventsScreen;

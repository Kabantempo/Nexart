import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

export default function SearchEventsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Marchés & Événements</Text>
      <Text style={styles.placeholder}>Recherche par région, date et catégorie — à venir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.xxl },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm },
  placeholder: { ...typography.body, color: colors.text.secondary },
});

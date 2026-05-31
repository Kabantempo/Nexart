import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../stores/auth';
import { colors, spacing, typography } from '../../constants/theme';

export default function OrganizerHomeScreen() {
  const { profile } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Bonjour, {profile?.full_name?.split(' ')[0] ?? 'organisateur'} 👋</Text>
      <Text style={styles.subtitle}>Gérez vos marchés artisanaux</Text>
      {/* TODO: résumé marchés actifs, nouvelles candidatures */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl },
  greeting: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.text.secondary },
});

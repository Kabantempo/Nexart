import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '../../stores/auth';
import { colors, spacing, typography } from '../../constants/theme';

export default function CreatorHomeScreen() {
  const { profile } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>Bonjour, {profile?.full_name?.split(' ')[0] ?? 'artisan'} 👋</Text>
      <Text style={styles.subtitle}>Trouvez vos prochains marchés</Text>
      {/* TODO: événements recommandés, candidatures récentes */}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl },
  greeting: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.text.secondary },
});

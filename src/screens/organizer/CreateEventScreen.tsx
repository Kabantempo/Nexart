import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';

export default function CreateEventScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un marché</Text>
      <Text style={styles.placeholder}>Formulaire de création d'événement — à venir</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.xxl },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.sm },
  placeholder: { ...typography.body, color: colors.text.secondary },
});

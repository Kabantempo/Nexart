import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../stores/auth';
import { colors, spacing, typography, radius } from '../../constants/theme';

export default function ProfileScreen() {
  const { profile } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mon profil</Text>
      <Text style={styles.name}>{profile?.full_name}</Text>
      <Text style={styles.role}>{profile?.role === 'creator' ? '🎨 Créateur / Artisan' : '🗓️ Organisateur'}</Text>

      <TouchableOpacity style={styles.btnLogout} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.btnLogoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.xxl },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xl },
  name: { ...typography.h3, color: colors.text.primary, marginBottom: spacing.xs },
  role: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.xxl },
  btnLogout: { borderWidth: 1, borderColor: colors.error, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  btnLogoutText: { color: colors.error, fontWeight: '600' },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../stores/auth';
import { colors, spacing, typography, radius } from '../../constants/theme';

export default function VisitorProfileScreen() {
  const { profile } = useAuth();

  return (
    <View style={s.container}>
      <View style={s.avatar}><Text style={s.avatarText}>{profile?.full_name?.[0]?.toUpperCase() ?? '?'}</Text></View>
      <Text style={s.name}>{profile?.full_name}</Text>
      <Text style={s.role}>Visiteur</Text>

      <View style={s.infoBox}>
        <Text style={s.infoText}>
          Vous êtes en mode visiteur. Vous pouvez explorer les marchés et contacter les artisans.
        </Text>
        <Text style={s.infoText}>
          Pour candidater à un marché, créez un compte Créateur.
        </Text>
      </View>

      <TouchableOpacity style={s.btnLogout} onPress={() => supabase.auth.signOut()}>
        <Text style={s.btnLogoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.xxl, alignItems: 'center' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary + '30', alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { ...typography.h1, color: colors.primary },
  name: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xs },
  role: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.xl },
  infoBox: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.border, gap: spacing.sm, marginBottom: spacing.xxl, width: '100%' },
  infoText: { ...typography.body, color: colors.text.secondary, lineHeight: 22 },
  btnLogout: { borderWidth: 1, borderColor: colors.error, padding: spacing.md, borderRadius: radius.md, alignItems: 'center', width: '100%' },
  btnLogoutText: { color: colors.error, fontWeight: '600' },
});

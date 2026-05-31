import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { useAuth } from '../../stores/auth';
import { Profile } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = { navigation: StackNavigationProp<AuthStackParams, 'Welcome'> };

const MOCK_CREATOR: Profile = {
  id: 'dev-creator-id',
  role: 'creator',
  full_name: 'Alice Dupont (test)',
  avatar_url: null,
  bio: 'Céramiste indépendante, mode test.',
  created_at: new Date().toISOString(),
};

const MOCK_ORGANIZER: Profile = {
  id: 'dev-organizer-id',
  role: 'organizer',
  full_name: 'Bob Martin (test)',
  avatar_url: null,
  bio: null,
  created_at: new Date().toISOString(),
};

export default function WelcomeScreen({ navigation }: Props) {
  const { setProfile } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.logo}>Nexart</Text>
        <Text style={styles.tagline}>La plateforme des marchés artisanaux</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.btnPrimaryText}>Créer un compte</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnSecondary} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnSecondaryText}>Se connecter</Text>
        </TouchableOpacity>

        {/* Mode test — visible uniquement en développement */}
        {__DEV__ && (
          <View style={styles.devSection}>
            <Text style={styles.devLabel}>⚙ Mode test</Text>
            <View style={styles.devRow}>
              <TouchableOpacity style={styles.devBtn} onPress={() => setProfile(MOCK_CREATOR)}>
                <Text style={styles.devBtnText}>🎨 Créateur</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.devBtn, styles.devBtnAlt]} onPress={() => setProfile(MOCK_ORGANIZER)}>
                <Text style={styles.devBtnText}>🗓 Organisateur</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  hero:           { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo:           { ...typography.h1, color: colors.primary, fontSize: 48, marginBottom: spacing.md },
  tagline:        { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  actions:        { gap: spacing.md, paddingBottom: spacing.xl },
  btnPrimary:     { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  btnPrimaryText: { ...typography.label, color: colors.text.inverse, fontSize: 16, fontWeight: '600' },
  btnSecondary:   { borderWidth: 1, borderColor: colors.border, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  btnSecondaryText: { ...typography.label, color: colors.text.primary, fontSize: 16 },

  devSection: {
    marginTop: spacing.md,
    borderTopWidth: 1, borderColor: colors.border,
    paddingTop: spacing.md,
  },
  devLabel: { ...typography.caption, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.sm },
  devRow:   { flexDirection: 'row', gap: spacing.sm },
  devBtn:   {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.primary + '60',
    alignItems: 'center',
  },
  devBtnAlt:  { borderColor: colors.secondary + '60' },
  devBtnText: { ...typography.caption, color: colors.text.primary, fontWeight: '600' },
});

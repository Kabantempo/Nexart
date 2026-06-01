import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { useAuth } from '../../stores/auth';
import { Profile } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';
import EtherealBackground from '../../components/ui/EtherealBackground';

type Props = { navigation: StackNavigationProp<AuthStackParams, 'Welcome'> & { getParent: () => any } };

const MOCK_CREATOR: Profile = {
  id: 'dev-creator-id', role: 'creator', full_name: 'Alice Dupont (test)',
  avatar_url: null, bio: 'Céramiste indépendante, mode test.', created_at: new Date().toISOString(),
};
const MOCK_ORGANIZER: Profile = {
  id: 'dev-organizer-id', role: 'organizer', full_name: 'Bob Martin (test)',
  avatar_url: null, bio: null, created_at: new Date().toISOString(),
};
const MOCK_VISITOR: Profile = {
  id: 'dev-visitor-id', role: 'visitor', full_name: 'Clara Visiteur (test)',
  avatar_url: null, bio: null, created_at: new Date().toISOString(),
};

export default function WelcomeScreen({ navigation }: Props) {
  const { setProfile } = useAuth();

  return (
    <EtherealBackground intensity={0.22}>
      <View style={s.inner}>

        {/* Hero */}
        <View style={s.hero}>
          <View style={s.logoWrap}>
            <View style={s.logoDivider} />
            <Text style={s.logo}>Nexart</Text>
            <View style={s.logoDivider} />
          </View>

          <Text style={s.tagline}>La plateforme des marchés artisanaux</Text>
          <Text style={s.sub}>
            Connectez créateurs et organisateurs.{'\n'}Trouvez votre prochain marché.
          </Text>

          <View style={s.pillRow}>
            {['Tatouage', 'Céramique', 'Bijoux', 'Illustration'].map(t => (
              <View key={t} style={s.pill}>
                <Text style={s.pillText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Actions */}
        <View style={s.actions}>
          <TouchableOpacity
            style={s.btnPrimary}
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.85}
          >
            <Text style={s.btnPrimaryText}>Créer un compte</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnSecondary}
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.85}
          >
            <Text style={s.btnSecondaryText}>Se connecter</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnExplore}
            onPress={() => (navigation as any).getParent()?.navigate('Discover')}
            activeOpacity={0.85}
          >
            <Text style={s.btnExploreText}>Explorer sans compte →</Text>
          </TouchableOpacity>

          {__DEV__ && (
            <View style={s.devSection}>
              <Text style={s.devLabel}>Mode test</Text>
              <View style={s.devRow}>
                <TouchableOpacity style={s.devBtn} onPress={() => setProfile(MOCK_CREATOR)}>
                  <Text style={s.devBtnText}>Créateur</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.devBtn, s.devBtnAlt]} onPress={() => setProfile(MOCK_ORGANIZER)}>
                  <Text style={s.devBtnText}>Orga</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.devBtn, s.devBtnVisitor]} onPress={() => setProfile(MOCK_VISITOR)}>
                  <Text style={s.devBtnText}>Visiteur</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </EtherealBackground>
  );
}

const s = StyleSheet.create({
  inner: { flex: 1, paddingHorizontal: spacing.xl },

  // Hero
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingBottom: spacing.xl },
  logoWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.lg },
  logoDivider: { height: 1.5, width: 28, backgroundColor: colors.primary + '80' },
  logo: { fontSize: 54, fontWeight: '700', color: colors.primary, letterSpacing: -1 },

  tagline: {
    ...typography.h3, color: colors.text.primary,
    textAlign: 'center', marginBottom: spacing.sm, fontWeight: '600',
  },
  sub: {
    ...typography.body, color: colors.text.secondary,
    textAlign: 'center', lineHeight: 22, marginBottom: spacing.xl,
  },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, justifyContent: 'center' },
  pill: {
    paddingHorizontal: spacing.md, paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1, borderColor: colors.border,
  },
  pillText: { ...typography.caption, color: colors.text.secondary },

  // Actions
  actions: { gap: spacing.sm, paddingBottom: spacing.xxl },

  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: 16, borderRadius: radius.xl,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  btnPrimaryText: { ...typography.label, color: colors.text.inverse, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },

  btnSecondary: {
    paddingVertical: 16, borderRadius: radius.xl,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.75)',
    borderWidth: 1, borderColor: colors.border,
  },
  btnSecondaryText: { ...typography.label, color: colors.text.primary, fontSize: 16 },

  btnExplore: { paddingVertical: 12, alignItems: 'center' },
  btnExploreText: { ...typography.label, color: colors.primary, fontSize: 15 },

  // Dev
  devSection: {
    marginTop: spacing.sm, borderTopWidth: 1, borderColor: colors.border + '80',
    paddingTop: spacing.md,
  },
  devLabel: { ...typography.caption, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.sm },
  devRow:   { flexDirection: 'row', gap: spacing.sm },
  devBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: colors.primary + '40',
    alignItems: 'center',
  },
  devBtnAlt:     { borderColor: colors.secondary + '40' },
  devBtnVisitor: { borderColor: '#8B7CF640' },
  devBtnText:    { ...typography.caption, color: colors.text.primary, fontWeight: '600' },
});

import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { supabase } from '../../lib/supabase';
import { UserRole } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = { navigation: StackNavigationProp<AuthStackParams, 'Register'> };

export default function RegisterScreen({ navigation }: Props) {
  const [role, setRole] = useState<UserRole | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!role) {
      Alert.alert('Erreur', 'Choisissez votre profil');
      return;
    }
    if (!fullName || !email || !password) {
      Alert.alert('Erreur', 'Tous les champs sont requis');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit faire au moins 6 caractères');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    setLoading(false);
    if (error) Alert.alert('Erreur', error.message);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Retour</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Créer un compte</Text>

      <Text style={styles.sectionLabel}>Je suis…</Text>
      <View style={styles.roleRow}>
        <TouchableOpacity style={[styles.roleCard, role === 'creator' && styles.roleCardActive]} onPress={() => setRole('creator')}>
          <Text style={styles.roleIcon}>🎨</Text>
          <Text style={[styles.roleTitle, role === 'creator' && styles.roleTextActive]}>Créateur</Text>
          <Text style={styles.roleDesc}>J'expose mes créations</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleCard, role === 'organizer' && styles.roleCardActiveAlt]} onPress={() => setRole('organizer')}>
          <Text style={styles.roleIcon}>🗓️</Text>
          <Text style={[styles.roleTitle, role === 'organizer' && styles.roleTextActiveAlt]}>Organisateur</Text>
          <Text style={styles.roleDesc}>J'organise des marchés</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.roleCard, role === 'visitor' && styles.roleCardActiveVisitor]} onPress={() => setRole('visitor')}>
          <Text style={styles.roleIcon}>👀</Text>
          <Text style={[styles.roleTitle, role === 'visitor' && styles.roleTextActiveVisitor]}>Visiteur</Text>
          <Text style={styles.roleDesc}>J'explore les marchés</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder="Nom complet"
        placeholderTextColor={colors.text.secondary}
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={colors.text.secondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe (min. 6 caractères)"
        placeholderTextColor={colors.text.secondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.btn, !role && styles.btnDisabled]}
        onPress={handleRegister}
        disabled={loading || !role}
      >
        <Text style={styles.btnText}>{loading ? 'Création…' : 'Créer mon compte'}</Text>
      </TouchableOpacity>

      <Text style={styles.legal}>
        En créant un compte, vous acceptez nos{' '}
        <Text style={styles.legalLink} onPress={() => Linking.openURL('https://nexart.app/cgu.html')}>
          Conditions d'utilisation
        </Text>
        {' '}et notre{' '}
        <Text style={styles.legalLink} onPress={() => Linking.openURL('https://nexart.app/privacy.html')}>
          Politique de confidentialité
        </Text>
        .
      </Text>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  back: { marginBottom: spacing.xl },
  backText: { color: colors.text.secondary },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xl },
  sectionLabel: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 1 },
  roleRow: { flexDirection: 'row', marginBottom: spacing.xl, gap: spacing.sm },
  roleCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  roleCardRight: {},
  roleCardActive: { borderColor: colors.primary },
  roleCardActiveAlt: { borderColor: colors.secondary },
  roleCardActiveVisitor: { borderColor: '#8B7CF6' },
  roleTextActiveVisitor: { color: '#8B7CF6' },
  roleIcon: { fontSize: 28, marginBottom: spacing.xs },
  roleTitle: { ...typography.h3, color: colors.text.primary, marginBottom: 2 },
  roleTextActive: { color: colors.primary },
  roleTextActiveAlt: { color: colors.secondary },
  roleDesc: { ...typography.caption, color: colors.text.secondary, textAlign: 'center' },
  input: {
    backgroundColor: colors.surface,
    color: colors.text.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  btn: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { ...typography.label, color: colors.text.inverse, fontSize: 16, fontWeight: '600' },
  link: { color: colors.secondary, textAlign: 'center', marginTop: spacing.lg },
  legal: { ...typography.caption, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.lg, lineHeight: 18 },
  legalLink: { color: colors.primary, textDecorationLine: 'underline' },
});

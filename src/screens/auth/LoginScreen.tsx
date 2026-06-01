import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { supabase } from '../../lib/supabase';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = { navigation: StackNavigationProp<AuthStackParams, 'Login'> };

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) Alert.alert('Erreur', error.message);
  };

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
        <Text style={s.backText}>← Retour</Text>
      </TouchableOpacity>

      <View style={s.hero}>
        <Text style={s.title}>Bon retour</Text>
        <Text style={s.subtitle}>Connectez-vous à votre compte Nexart</Text>
      </View>

      <View style={s.form}>
        <View style={s.inputWrap}>
          <Text style={s.inputLabel}>Email</Text>
          <TextInput
            style={s.input}
            placeholder="votre@email.fr"
            placeholderTextColor={colors.text.secondary + '70'}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
        </View>

        <View style={s.inputWrap}>
          <Text style={s.inputLabel}>Mot de passe</Text>
          <View style={s.pwdRow}>
            <TextInput
              style={[s.input, { flex: 1, marginBottom: 0 }]}
              placeholder="••••••••"
              placeholderTextColor={colors.text.secondary + '70'}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPwd}
              autoComplete="password"
              textContentType="password"
            />
            <TouchableOpacity style={s.pwdToggle} onPress={() => setShowPwd(v => !v)}>
              <Text style={s.pwdToggleText}>{showPwd ? 'Cacher' : 'Voir'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[s.btn, loading && s.btnLoading]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={s.btnText}>{loading ? 'Connexion…' : 'Se connecter'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={s.link}>Pas encore de compte ? S'inscrire</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl, paddingTop: spacing.xxl },

  back:     { marginBottom: spacing.xl },
  backText: { color: colors.text.secondary },

  hero: { marginBottom: spacing.xl },
  title:    { ...typography.h2, color: colors.text.primary, fontWeight: '700', marginBottom: spacing.xs },
  subtitle: { ...typography.body, color: colors.text.secondary },

  form: { gap: spacing.sm },

  inputWrap:  { gap: spacing.xs },
  inputLabel: { ...typography.caption, color: colors.text.secondary, marginLeft: 2, fontWeight: '500' },
  input: {
    backgroundColor: colors.surface,
    color: colors.text.primary,
    padding: spacing.md,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
  },

  pwdRow:       { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  pwdToggle:    { paddingHorizontal: spacing.md },
  pwdToggleText:{ ...typography.caption, color: colors.primary },

  btn: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: radius.xl,
    alignItems: 'center',
    marginTop: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  btnLoading: { opacity: 0.7 },
  btnText: { ...typography.label, color: '#0D0D0D', fontSize: 16, fontWeight: '700' },

  link: { color: colors.secondary, textAlign: 'center', marginTop: spacing.md },
});

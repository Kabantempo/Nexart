import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParams } from '../../navigation/AuthNavigator';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = { navigation: StackNavigationProp<AuthStackParams, 'Welcome'> };

export default function WelcomeScreen({ navigation }: Props) {
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.xl },
  hero: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { ...typography.h1, color: colors.primary, fontSize: 48, marginBottom: spacing.md },
  tagline: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  actions: { gap: spacing.md, paddingBottom: spacing.xl },
  btnPrimary: { backgroundColor: colors.primary, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  btnPrimaryText: { ...typography.label, color: colors.text.inverse, fontSize: 16, fontWeight: '600' },
  btnSecondary: { borderWidth: 1, borderColor: colors.border, padding: spacing.md, borderRadius: radius.md, alignItems: 'center' },
  btnSecondaryText: { ...typography.label, color: colors.text.primary, fontSize: 16 },
});

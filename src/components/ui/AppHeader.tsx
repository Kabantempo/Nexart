import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { colors, spacing, typography, radius } from '../../constants/theme';

interface AppHeaderProps {
  title?:      string;
  showFavorites?: boolean;
  showCreate?:    boolean;
  onCreatePress?: () => void;
}

export function AppHeader({
  title = 'Nexart',
  showFavorites = true,
  showCreate = false,
  onCreatePress,
}: AppHeaderProps) {
  const insets  = useSafeAreaInsets();
  const nav     = useNavigation<any>();
  const { profile } = useAuth();

  const goToFavorites = () => nav.navigate('Favoris');
  const goToProfile   = () => nav.navigate('Profil');

  return (
    <View style={[s.header, { paddingTop: insets.top + spacing.xs }]}>
      {/* Logo */}
      <Text style={s.logo}>{title}</Text>

      {/* Actions droite */}
      <View style={s.actions}>
        {showCreate && (
          <TouchableOpacity style={s.createBtn} onPress={onCreatePress} activeOpacity={0.8}>
            <Text style={s.createText}>+ Post</Text>
          </TouchableOpacity>
        )}

        {showFavorites && (
          <TouchableOpacity style={s.iconBtn} onPress={goToFavorites} activeOpacity={0.8}>
            <Ionicons name="heart-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        )}

        {/* Avatar rond */}
        <TouchableOpacity style={s.avatarBtn} onPress={goToProfile} activeOpacity={0.85}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={s.avatarImg} />
          ) : (
            <View style={s.avatarFallback}>
              <Ionicons name="person" size={16} color={colors.primary} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  logo:    { ...typography.h2, color: colors.primary, fontWeight: '700' },
  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },

  iconBtn:  { padding: spacing.xs },

  createBtn:  { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: 6 },
  createText: { ...typography.caption, color: colors.text.inverse, fontWeight: '700' },

  avatarBtn: {},
  avatarImg: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 2, borderColor: colors.primary + '40',
  },
  avatarFallback: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: colors.primary + '30',
  },
});

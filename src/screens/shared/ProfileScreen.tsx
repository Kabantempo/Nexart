import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Image, Platform, FlatList, Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const SCREEN_W = Dimensions.get('window').width;
const IMG_SIZE = (SCREEN_W - 32 * 2 - 8 * 2) / 3;
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../stores/auth';
import { useCreatorProfile } from '../../hooks/useCreatorProfile';
import { useProfileReviews } from '../../hooks/useReviews';
import { DISCIPLINE_TAGS, TravelRadius } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

const RADIUS_OPTIONS: { label: string; value: TravelRadius }[] = [
  { label: '5 km',       value: '5' },
  { label: '10 km',      value: '10' },
  { label: '25 km',      value: '25' },
  { label: 'National',   value: 'national' },
];

// ─── Discipline tag picker ────────────────────────────────────────────────────

function DisciplinePicker({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (tags: string[]) => void;
}) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) onChange(selected.filter(t => t !== tag));
    else if (selected.length < 8) onChange([...selected, tag]);
  };

  return (
    <View style={tagStyles.wrap}>
      {DISCIPLINE_TAGS.map(tag => {
        const active = selected.includes(tag);
        return (
          <TouchableOpacity
            key={tag}
            style={[tagStyles.tag, active && tagStyles.tagActive]}
            onPress={() => toggle(tag)}
          >
            <Text style={[tagStyles.tagText, active && tagStyles.tagTextActive]}>{tag}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const tagStyles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.full,
    paddingHorizontal: spacing.sm, paddingVertical: 5,
  },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { ...typography.caption, color: colors.text.secondary },
  tagTextActive: { color: colors.text.inverse, fontWeight: '600' },
});

// ─── Portfolio section ────────────────────────────────────────────────────────

function PortfolioSection({ userId, images, onUpdate }: { userId: string; images: string[]; onUpdate: (imgs: string[]) => Promise<any> }) {
  const [uploading, setUploading] = useState(false);

  const addPhoto = async () => {
    if (images.length >= 20) { Alert.alert('Maximum atteint', '20 photos maximum.'); return; }
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission requise'); return; }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true,
      quality: 0.8, selectionLimit: Math.min(5, 20 - images.length),
    });
    if (result.canceled) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const asset of result.assets) {
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const resp = await fetch(asset.uri);
      const blob = await resp.blob();
      const { error } = await supabase.storage.from('portfolios').upload(path, blob, { upsert: false });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(path);
        newUrls.push(publicUrl);
      }
    }
    if (newUrls.length) await onUpdate([...images, ...newUrls]);
    setUploading(false);
  };

  const removePhoto = (url: string) =>
    Alert.alert('Supprimer cette photo ?', '', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Supprimer', style: 'destructive', onPress: () => onUpdate(images.filter(u => u !== url)) },
    ]);

  return (
    <View style={{ marginTop: spacing.xl }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
        <Text style={styles.fieldLabel}>Portfolio ({images.length}/20)</Text>
        <TouchableOpacity onPress={addPhoto} disabled={uploading}>
          <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 13 }}>
            {uploading ? 'Upload…' : '+ Ajouter'}
          </Text>
        </TouchableOpacity>
      </View>
      {images.length === 0 ? (
        <TouchableOpacity style={porto.placeholder} onPress={addPhoto}>
          <Text style={porto.placeholderText}>Ajoutez vos créations · 20 photos max</Text>
        </TouchableOpacity>
      ) : (
        <View style={porto.grid}>
          {images.map(url => (
            <TouchableOpacity key={url} onLongPress={() => removePhoto(url)}>
              <Image source={{ uri: url }} style={porto.img} />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const porto = StyleSheet.create({
  placeholder: { height: 80, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { ...typography.caption, color: colors.text.secondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  img: { width: IMG_SIZE, height: IMG_SIZE, borderRadius: radius.sm, backgroundColor: colors.surface },
});

// ─── Creator profile section ──────────────────────────────────────────────────

function CreatorProfileSection({ userId }: { userId: string }) {
  const { profile, refetchProfile } = useAuth();
  const { creatorProfile, loading, saving, upsert, updateBio } = useCreatorProfile(userId);
  const [isEditing, setIsEditing] = useState(false);

  // form state
  const [bio, setBio]                   = useState('');
  const [disciplines, setDisciplines]   = useState<string[]>([]);
  const [city, setCity]                 = useState('');
  const [region, setRegion]             = useState('');
  const [travelRadius, setTravelRadius] = useState<TravelRadius>('25');
  const [website, setWebsite]           = useState('');
  const [instagram, setInstagram]       = useState('');
  const [etsy, setEtsy]                 = useState('');

  useEffect(() => {
    if (creatorProfile) {
      setDisciplines(creatorProfile.disciplines ?? []);
      setCity(creatorProfile.city ?? '');
      setRegion(creatorProfile.region ?? '');
      setTravelRadius(creatorProfile.travel_radius ?? '25');
      setWebsite(creatorProfile.website ?? '');
      setInstagram(creatorProfile.instagram ?? '');
      setEtsy(creatorProfile.etsy ?? '');
    }
    if (profile?.bio) setBio(profile.bio);
  }, [creatorProfile, profile]);

  const showForm = !creatorProfile || isEditing;

  const handleSave = async () => {
    if (disciplines.length === 0) {
      Alert.alert('Disciplines requises', 'Sélectionnez au moins une discipline.');
      return;
    }
    const [{ error: e1 }, e2] = await Promise.all([
      upsert({ disciplines, city: city || null, region: region || null, travel_radius: travelRadius, website: website || null, instagram: instagram || null, etsy: etsy || null }),
      updateBio(bio),
    ]);
    if (e1) { Alert.alert('Erreur', e1); return; }
    await refetchProfile();
    setIsEditing(false);
  };

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />;

  // ── View mode ──
  if (!showForm) {
    return (
      <View>
        {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

        <Text style={styles.fieldLabel}>Disciplines</Text>
        <View style={tagStyles.wrap}>
          {creatorProfile.disciplines.map(d => (
            <View key={d} style={[tagStyles.tag, tagStyles.tagActive]}>
              <Text style={[tagStyles.tagText, tagStyles.tagTextActive]}>{d}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.fieldLabel}>Localisation</Text>
        <Text style={styles.fieldValue}>
          {[creatorProfile.city, creatorProfile.region].filter(Boolean).join(', ') || '—'}
          {' · '}
          {RADIUS_OPTIONS.find(r => r.value === creatorProfile.travel_radius)?.label ?? ''}
        </Text>

        {(creatorProfile.website || creatorProfile.instagram || creatorProfile.etsy) ? (
          <>
            <Text style={styles.fieldLabel}>Liens</Text>
            {creatorProfile.website   && <Text style={styles.link}>{creatorProfile.website}</Text>}
            {creatorProfile.instagram && <Text style={styles.link}>@{creatorProfile.instagram}</Text>}
            {creatorProfile.etsy      && <Text style={styles.link}>Etsy : {creatorProfile.etsy}</Text>}
          </>
        ) : null}

        <TouchableOpacity style={styles.btnSecondary} onPress={() => setIsEditing(true)}>
          <Text style={styles.btnSecondaryText}>Modifier mon profil</Text>
        </TouchableOpacity>

        <PortfolioSection userId={userId} images={creatorProfile.portfolio_images} onUpdate={(imgs) => upsert({ portfolio_images: imgs })} />
      </View>
    );
  }

  // ── Setup / Edit form ──
  return (
    <View>
      {!creatorProfile && (
        <View style={styles.setupBanner}>
          <Text style={styles.setupTitle}>Complétez votre profil</Text>
          <Text style={styles.setupSubtitle}>
            Les organisateurs voient votre profil avant d'accepter votre candidature.
          </Text>
        </View>
      )}

      <Text style={styles.fieldLabel}>Bio</Text>
      <TextInput
        style={[styles.input, styles.inputMulti]}
        placeholder="Décrivez votre travail en quelques phrases…"
        placeholderTextColor={colors.text.secondary}
        value={bio}
        onChangeText={setBio}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.fieldLabel}>Disciplines <Text style={styles.hint}>(8 max)</Text></Text>
      <DisciplinePicker selected={disciplines} onChange={setDisciplines} />

      <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Ville</Text>
      <TextInput style={styles.input} placeholder="Ex : Lyon" placeholderTextColor={colors.text.secondary} value={city} onChangeText={setCity} />

      <Text style={styles.fieldLabel}>Région</Text>
      <TextInput style={styles.input} placeholder="Ex : Auvergne-Rhône-Alpes" placeholderTextColor={colors.text.secondary} value={region} onChangeText={setRegion} />

      <Text style={styles.fieldLabel}>Rayon de déplacement</Text>
      <View style={styles.radiusRow}>
        {RADIUS_OPTIONS.map(opt => (
          <TouchableOpacity
            key={opt.value}
            style={[styles.radiusBtn, travelRadius === opt.value && styles.radiusBtnActive]}
            onPress={() => setTravelRadius(opt.value)}
          >
            <Text style={[styles.radiusBtnText, travelRadius === opt.value && styles.radiusBtnTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.fieldLabel, { marginTop: spacing.lg }]}>Liens (optionnel)</Text>
      <TextInput style={styles.input} placeholder="Site web (https://…)" placeholderTextColor={colors.text.secondary} value={website} onChangeText={setWebsite} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Instagram (sans @)" placeholderTextColor={colors.text.secondary} value={instagram} onChangeText={setInstagram} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Boutique Etsy" placeholderTextColor={colors.text.secondary} value={etsy} onChangeText={setEtsy} autoCapitalize="none" />

      <View style={styles.formActions}>
        {isEditing && (
          <TouchableOpacity style={styles.btnCancel} onPress={() => setIsEditing(false)}>
            <Text style={styles.btnCancelText}>Annuler</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[styles.btnSave, saving && { opacity: 0.6 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.btnSaveText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Main ProfileScreen ───────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { profile, refetchProfile } = useAuth();
  const { average, count, isTrusted } = useProfileReviews(profile?.id);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const pickAvatar = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission requise'); return; }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (result.canceled || !result.assets[0] || !profile?.id) return;

    setUploadingAvatar(true);
    const asset = result.assets[0];
    const ext = asset.uri.split('.').pop() ?? 'jpg';
    const path = `${profile.id}/avatar.${ext}`;

    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const { error: upErr } = await supabase.storage.from('avatars').upload(path, blob, { upsert: true });
    if (upErr) { Alert.alert('Erreur upload', upErr.message); setUploadingAvatar(false); return; }

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
    await refetchProfile();
    setUploadingAvatar(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={pickAvatar} disabled={uploadingAvatar}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}>
              {uploadingAvatar
                ? <ActivityIndicator color={colors.primary} />
                : <Text style={styles.avatarText}>{profile?.full_name?.[0]?.toUpperCase() ?? '?'}</Text>
              }
            </View>
          )}
          <View style={styles.avatarEditBadge}><Text style={styles.avatarEditIcon}>✎</Text></View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.full_name}</Text>
          <Text style={styles.roleLabel}>
            {profile?.role === 'creator' ? 'Créateur / Artisan' : 'Organisateur'}
          </Text>
          {average !== null && (
            <Text style={styles.rating}>{'★'.repeat(Math.round(average))} {average}/5 · {count} avis</Text>
          )}
          {isTrusted && (
            <View style={styles.trustBadge}><Text style={styles.trustBadgeText}>✓ Créateur de confiance</Text></View>
          )}
        </View>
      </View>

      {profile?.role === 'creator' && profile?.id ? (
        <CreatorProfileSection userId={profile.id} />
      ) : null}

      <TouchableOpacity style={styles.btnLogout} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.btnLogoutText}>Se déconnecter</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },

  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.xl },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary + '30', alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 64, height: 64, borderRadius: 32 },
  avatarEditBadge: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarEditIcon: { color: colors.text.inverse, fontSize: 11 },
  avatarText: { ...typography.h2, color: colors.primary },
  rating: { ...typography.caption, color: colors.primary, marginTop: 3 },
  trustBadge: { marginTop: 4, alignSelf: 'flex-start', backgroundColor: colors.secondary + '20', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 2, borderWidth: 1, borderColor: colors.secondary + '50' },
  trustBadgeText: { ...typography.caption, color: colors.secondary, fontWeight: '700', fontSize: 10 },
  name: { ...typography.h3, color: colors.text.primary },
  roleLabel: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },

  setupBanner: {
    backgroundColor: colors.primary + '15', borderRadius: radius.md,
    padding: spacing.md, marginBottom: spacing.lg,
    borderWidth: 1, borderColor: colors.primary + '40',
  },
  setupTitle: { ...typography.h3, color: colors.primary, marginBottom: spacing.xs },
  setupSubtitle: { ...typography.caption, color: colors.text.secondary, lineHeight: 18 },

  bio: { ...typography.body, color: colors.text.secondary, marginBottom: spacing.lg, lineHeight: 22 },

  fieldLabel: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm, marginTop: spacing.lg, textTransform: 'uppercase', letterSpacing: 0.8 },
  fieldValue: { ...typography.body, color: colors.text.primary },
  hint: { color: colors.text.secondary, textTransform: 'none', letterSpacing: 0 },
  link: { ...typography.body, color: colors.primary, marginBottom: 2 },

  input: {
    backgroundColor: colors.surface, color: colors.text.primary,
    padding: spacing.md, borderRadius: radius.md, marginBottom: spacing.sm,
    borderWidth: 1, borderColor: colors.border,
  },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },

  radiusRow: { flexDirection: 'row', gap: spacing.sm },
  radiusBtn: {
    flex: 1, paddingVertical: spacing.sm, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  radiusBtnActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  radiusBtnText: { ...typography.caption, color: colors.text.secondary },
  radiusBtnTextActive: { color: colors.text.inverse, fontWeight: '700' },

  formActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  btnSave: {
    flex: 1, backgroundColor: colors.primary, padding: spacing.md,
    borderRadius: radius.md, alignItems: 'center',
  },
  btnSaveText: { ...typography.label, color: colors.text.inverse, fontWeight: '700', fontSize: 15 },
  btnCancel: {
    paddingHorizontal: spacing.lg, padding: spacing.md,
    borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  btnCancelText: { ...typography.label, color: colors.text.secondary },

  btnSecondary: {
    marginTop: spacing.xl, padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border, alignItems: 'center',
  },
  btnSecondaryText: { ...typography.label, color: colors.text.primary },

  btnLogout: {
    marginTop: spacing.xxl, borderWidth: 1, borderColor: colors.error,
    padding: spacing.md, borderRadius: radius.md, alignItems: 'center',
  },
  btnLogoutText: { color: colors.error, fontWeight: '600' },
});

import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Image, Platform,
  FlatList, Dimensions, Linking, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

function CreatorProfileSection({ userId, onSaved }: { userId: string; onSaved?: () => void }) {
  const { profile, refetchProfile } = useAuth();
  const { creatorProfile, loading, saving, upsert, updateBio } = useCreatorProfile(userId);
  const [isEditing, setIsEditing] = useState(true); // toujours en mode édition dans le modal

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
    onSaved?.();
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

// ─── Organizer profile section ───────────────────────────────────────────────

function OrganizerProfileSection({ userId }: { userId: string }) {
  const [orgName, setOrgName]     = useState('');
  const [website, setWebsite]     = useState('');
  const [instagram, setInstagram] = useState('');
  const [loaded, setLoaded]       = useState(false);
  const [saving, setSaving]       = useState(false);
  const [editing, setEditing]     = useState(false);

  useEffect(() => {
    supabase.from('organizer_profiles').select('*').eq('user_id', userId).maybeSingle()
      .then(({ data }) => {
        if (data) { setOrgName(data.organization_name ?? ''); setWebsite(data.website ?? ''); setInstagram(data.instagram ?? ''); }
        else setEditing(true);
        setLoaded(true);
      });
  }, [userId]);

  const handleSave = async () => {
    if (!orgName.trim()) { Alert.alert('Erreur', "Le nom de l'organisation est requis."); return; }
    setSaving(true);
    await supabase.from('organizer_profiles').upsert(
      { user_id: userId, organization_name: orgName.trim(), website: website.trim() || null, instagram: instagram.trim() || null },
      { onConflict: 'user_id' },
    );
    setSaving(false);
    setEditing(false);
  };

  if (!loaded) return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />;

  if (!editing) return (
    <View>
      <Text style={styles.fieldLabel}>Organisation</Text>
      <Text style={styles.fieldValue}>{orgName || '—'}</Text>
      {website   && <><Text style={styles.fieldLabel}>Site web</Text><Text style={styles.link}>{website}</Text></>}
      {instagram && <><Text style={styles.fieldLabel}>Instagram</Text><Text style={styles.link}>@{instagram}</Text></>}
      <TouchableOpacity style={styles.btnSecondary} onPress={() => setEditing(true)}>
        <Text style={styles.btnSecondaryText}>Modifier mon profil</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View>
      {!orgName && (
        <View style={styles.setupBanner}>
          <Text style={styles.setupTitle}>Complétez votre profil organisateur</Text>
          <Text style={styles.setupSubtitle}>Visible par les créateurs qui candidatent à vos marchés.</Text>
        </View>
      )}
      <Text style={styles.fieldLabel}>Nom de l'organisation</Text>
      <TextInput style={styles.input} value={orgName} onChangeText={setOrgName} placeholder="Ex : Marché des Créateurs de Lyon" placeholderTextColor={colors.text.secondary} />
      <Text style={styles.fieldLabel}>Site web <Text style={styles.hint}>(optionnel)</Text></Text>
      <TextInput style={styles.input} value={website} onChangeText={setWebsite} placeholder="https://…" placeholderTextColor={colors.text.secondary} autoCapitalize="none" />
      <Text style={styles.fieldLabel}>Instagram <Text style={styles.hint}>(sans @)</Text></Text>
      <TextInput style={styles.input} value={instagram} onChangeText={setInstagram} placeholder="monmarche" placeholderTextColor={colors.text.secondary} autoCapitalize="none" />
      <View style={styles.formActions}>
        {orgName !== '' && <TouchableOpacity style={styles.btnCancel} onPress={() => setEditing(false)}><Text style={styles.btnCancelText}>Annuler</Text></TouchableOpacity>}
        <TouchableOpacity style={[styles.btnSave, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
          <Text style={styles.btnSaveText}>{saving ? 'Enregistrement…' : 'Enregistrer'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Creator profile view (mode lecture, style Instagram) ────────────────────

function CreatorProfileView({ userId, onEdit }: { userId: string; onEdit: () => void }) {
  const { creatorProfile, loading } = useCreatorProfile(userId);
  const { profile }  = useAuth();
  const { average, count, isTrusted } = useProfileReviews(userId);
  const insets = useSafeAreaInsets();
  const W = Dimensions.get('window').width;
  const CELL = (W - spacing.xl * 2 - spacing.xs * 2) / 3;

  if (loading) return <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xxl }} />;

  const portfolioImages = creatorProfile?.portfolio_images ?? [];

  return (
    <ScrollView
      style={profileViewStyles.container}
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header profil ── */}
      <View style={[profileViewStyles.header, { paddingTop: insets.top + spacing.md }]}>
        {/* Avatar */}
        <View style={profileViewStyles.avatarWrap}>
          {profile?.avatar_url ? (
            <Image source={{ uri: profile.avatar_url }} style={profileViewStyles.avatar} />
          ) : (
            <View style={profileViewStyles.avatarFallback}>
              <Ionicons name="person" size={32} color={colors.primary} />
            </View>
          )}
        </View>

        {/* Stats */}
        <View style={profileViewStyles.statsRow}>
          <View style={profileViewStyles.stat}>
            <Text style={profileViewStyles.statNum}>{portfolioImages.length}</Text>
            <Text style={profileViewStyles.statLabel}>œuvres</Text>
          </View>
          <View style={profileViewStyles.stat}>
            <Text style={profileViewStyles.statNum}>{count}</Text>
            <Text style={profileViewStyles.statLabel}>avis</Text>
          </View>
          <View style={profileViewStyles.stat}>
            <Text style={profileViewStyles.statNum}>{average != null ? `${average}/5` : '—'}</Text>
            <Text style={profileViewStyles.statLabel}>note</Text>
          </View>
        </View>
      </View>

      {/* ── Bio ── */}
      <View style={profileViewStyles.bio}>
        <Text style={profileViewStyles.name}>{profile?.full_name}</Text>
        {creatorProfile?.disciplines?.length ? (
          <Text style={profileViewStyles.disciplines}>{creatorProfile.disciplines.join(' · ')}</Text>
        ) : null}
        {profile?.bio ? (
          <Text style={profileViewStyles.bioText}>{profile.bio}</Text>
        ) : null}
        {creatorProfile?.city ? (
          <View style={profileViewStyles.locationRow}>
            <Ionicons name="location-outline" size={13} color={colors.text.secondary} />
            <Text style={profileViewStyles.location}>{creatorProfile.city}{creatorProfile.region ? `, ${creatorProfile.region}` : ''}</Text>
          </View>
        ) : null}
        {isTrusted && (
          <View style={profileViewStyles.trustBadge}>
            <Ionicons name="checkmark-circle" size={13} color={colors.success} />
            <Text style={profileViewStyles.trustText}>Créateur de confiance</Text>
          </View>
        )}
      </View>

      {/* ── Boutons ── */}
      <View style={profileViewStyles.actions}>
        <TouchableOpacity style={profileViewStyles.btnEdit} onPress={onEdit} activeOpacity={0.85}>
          <Text style={profileViewStyles.btnEditText}>Modifier le profil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={profileViewStyles.btnShare} activeOpacity={0.85}>
          <Ionicons name="share-outline" size={16} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* ── Grille portfolio ── */}
      {portfolioImages.length > 0 ? (
        <View style={profileViewStyles.grid}>
          {portfolioImages.map((uri, i) => (
            <Image key={i} source={{ uri }} style={{ width: CELL, height: CELL, borderRadius: radius.sm }} resizeMode="cover" />
          ))}
        </View>
      ) : (
        <View style={profileViewStyles.emptyGrid}>
          <Ionicons name="camera-outline" size={40} color={colors.border} />
          <Text style={profileViewStyles.emptyGridText}>Aucune œuvre publiée</Text>
          <Text style={profileViewStyles.emptyGridSub}>Ajoutez des photos dans "Modifier le profil"</Text>
        </View>
      )}
    </ScrollView>
  );
}

const profileViewStyles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.background },
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.xl, paddingBottom: spacing.md, gap: spacing.xl },
  avatarWrap:   {},
  avatar:       { width: 80, height: 80, borderRadius: 40, borderWidth: 2, borderColor: colors.primary + '50' },
  avatarFallback: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primary + '30' },
  statsRow:     { flex: 1, flexDirection: 'row', justifyContent: 'space-around' },
  stat:         { alignItems: 'center' },
  statNum:      { ...typography.h3, color: colors.text.primary, fontWeight: '700' },
  statLabel:    { ...typography.caption, color: colors.text.secondary, marginTop: 2 },

  bio:          { paddingHorizontal: spacing.xl, paddingBottom: spacing.md },
  name:         { ...typography.label, color: colors.text.primary, fontWeight: '700', fontSize: 15, marginBottom: 2 },
  disciplines:  { ...typography.caption, color: colors.primary, fontWeight: '600', marginBottom: 4 },
  bioText:      { ...typography.caption, color: colors.text.primary, lineHeight: 18, marginBottom: 4 },
  locationRow:  { flexDirection: 'row', alignItems: 'center', gap: 3, marginBottom: 4 },
  location:     { ...typography.caption, color: colors.text.secondary },
  trustBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.success + '15', borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 3, alignSelf: 'flex-start' },
  trustText:    { ...typography.caption, color: colors.success, fontWeight: '700', fontSize: 11 },

  actions:      { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: spacing.sm, marginBottom: spacing.md },
  btnEdit:      { flex: 1, backgroundColor: colors.muted, borderRadius: radius.lg, paddingVertical: 9, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  btnEditText:  { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  btnShare:     { width: 38, height: 38, borderRadius: radius.lg, backgroundColor: colors.muted, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },

  grid:         { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.xl, gap: spacing.xs },
  emptyGrid:    { alignItems: 'center', paddingTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyGridText:{ ...typography.h3, color: colors.text.primary, marginTop: spacing.md },
  emptyGridSub: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xs },
});

// ─── Main ProfileScreen ───────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { profile, refetchProfile } = useAuth();
  const { average, count, isTrusted } = useProfileReviews(profile?.id);
  const [showEdit, setShowEdit]       = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const insets = useSafeAreaInsets();

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

  // ── Créateur : vue profil Instagram + modal édition ──
  if (profile?.role === 'creator' && profile?.id) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <CreatorProfileView userId={profile.id} onEdit={() => setShowEdit(true)} />

        {/* Modal édition */}
        <Modal visible={showEdit} animationType="slide" presentationStyle="pageSheet">
          <View style={{ flex: 1, backgroundColor: colors.background }}>
            {/* Header modal */}
            <View style={[styles.modalHeader, { paddingTop: insets.top + spacing.sm }]}>
              <TouchableOpacity onPress={() => setShowEdit(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Modifier le profil</Text>
              <View style={{ width: 32 }} />
            </View>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
              {/* Avatar */}
              <TouchableOpacity style={styles.avatarEditRow} onPress={pickAvatar} disabled={uploadingAvatar}>
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatar}>
                    {uploadingAvatar ? <ActivityIndicator color={colors.primary} /> : <Text style={styles.avatarText}>{profile?.full_name?.[0]?.toUpperCase() ?? '?'}</Text>}
                  </View>
                )}
                <Text style={styles.changePhotoText}>Changer la photo</Text>
              </TouchableOpacity>
              <CreatorProfileSection userId={profile.id} onSaved={() => setShowEdit(false)} />
            </ScrollView>
          </View>
        </Modal>

        {/* Déconnexion + mentions légales en bas de la vue profil */}
      </View>
    );
  }

  // ── Organisateur & visiteur : vue classique ──
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
                : <Text style={styles.avatarText}>{profile?.full_name?.[0]?.toUpperCase() ?? '?'}</Text>}
            </View>
          )}
          <View style={styles.avatarEditBadge}><Text style={styles.avatarEditIcon}>✎</Text></View>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{profile?.full_name}</Text>
          <Text style={styles.roleLabel}>
            {profile?.role === 'organizer' ? 'Organisateur' : 'Visiteur'}
          </Text>
          {average !== null && <Text style={styles.rating}>{'★'.repeat(Math.round(average))} {average}/5 · {count} avis</Text>}
        </View>
      </View>

      {profile?.role === 'organizer' && profile?.id ? (
        <OrganizerProfileSection userId={profile.id} />
      ) : null}

      <TouchableOpacity style={styles.btnLogout} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.btnLogoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={styles.legalRow}>
        <TouchableOpacity onPress={() => Linking.openURL('https://nexart.app/cgu.html')}>
          <Text style={styles.legalLink}>CGU</Text>
        </TouchableOpacity>
        <Text style={styles.legalSep}>·</Text>
        <TouchableOpacity onPress={() => Linking.openURL('https://nexart.app/privacy.html')}>
          <Text style={styles.legalLink}>Confidentialité</Text>
        </TouchableOpacity>
      </View>
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

  // Modal édition
  modalHeader:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingBottom: spacing.md, borderBottomWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  modalTitle:     { ...typography.h3, color: colors.text.primary, fontWeight: '700' },
  modalClose:     { ...typography.h3, color: colors.text.secondary, padding: spacing.xs },
  avatarEditRow:  { alignItems: 'center', paddingVertical: spacing.xl },
  changePhotoText:{ ...typography.caption, color: colors.primary, fontWeight: '600', marginTop: spacing.xs },

  btnLogout: {
    marginTop: spacing.xxl, borderWidth: 1, borderColor: colors.error,
    padding: spacing.md, borderRadius: radius.md, alignItems: 'center',
  },
  btnLogoutText: { color: colors.error, fontWeight: '600' },
  legalRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: spacing.lg, gap: spacing.sm },
  legalLink: { ...typography.caption, color: colors.text.secondary, textDecorationLine: 'underline' },
  legalSep:  { ...typography.caption, color: colors.text.secondary },
});

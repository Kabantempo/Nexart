import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, Alert, ActivityIndicator,
} from 'react-native';
import { useAuth } from '../../stores/auth';
import { useCreateEvent, EMPTY_FORM, EventFormData } from '../../hooks/useCreateEvent';
import { DISCIPLINE_TAGS, EventType } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

const EVENT_TYPES: { label: string; value: EventType }[] = [
  { label: 'Pop-up',     value: 'popup' },
  { label: 'Salon',      value: 'salon' },
  { label: 'Foire',      value: 'fair' },
  { label: 'Permanent',  value: 'permanent' },
  { label: 'Saisonnier', value: 'seasonal' },
];

// ─── Reusable field components ────────────────────────────────────────────────

function FieldLabel({ children, hint }: { children: string; hint?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: spacing.xs, marginTop: spacing.lg }}>
      <Text style={styles.label}>{children}</Text>
      {hint && <Text style={styles.hint}>{hint}</Text>}
    </View>
  );
}

function Field({
  label, hint, value, onChange, placeholder, multiline, keyboardType, maxLength,
}: {
  label: string; hint?: string; value: string;
  onChange: (v: string) => void; placeholder?: string;
  multiline?: boolean; keyboardType?: any; maxLength?: number;
}) {
  return (
    <>
      <FieldLabel hint={hint}>{label}</FieldLabel>
      <TextInput
        style={[styles.input, multiline && styles.inputMulti]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        multiline={multiline}
        numberOfLines={multiline ? 4 : 1}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={keyboardType === 'email-address' ? 'none' : 'sentences'}
      />
    </>
  );
}

// ─── Discipline picker ────────────────────────────────────────────────────────

function DisciplinePicker({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) onChange(selected.filter(t => t !== tag));
    else onChange([...selected, tag]);
  };
  return (
    <View style={styles.tagWrap}>
      {DISCIPLINE_TAGS.map(tag => {
        const active = selected.includes(tag);
        return (
          <TouchableOpacity
            key={tag}
            style={[styles.tag, active && styles.tagActive]}
            onPress={() => toggle(tag)}
          >
            <Text style={[styles.tagText, active && styles.tagTextActive]}>{tag}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function CreateEventScreen() {
  const { profile } = useAuth();
  const { save, saving } = useCreateEvent();
  const [form, setForm] = useState<EventFormData>({ ...EMPTY_FORM });

  const set = (key: keyof EventFormData) => (value: string) =>
    setForm(f => ({ ...f, [key]: value }));

  const handleSave = async (publish: boolean) => {
    if (!profile?.id) return;
    const { error, data } = await save(profile.id, form, publish ? 'published' : 'draft');
    if (error) { Alert.alert('Erreur', error); return; }
    Alert.alert(
      publish ? 'Marché publié !' : 'Brouillon enregistré',
      publish
        ? 'Votre marché est maintenant visible par les artisans.'
        : 'Vous pourrez le publier depuis "Mes marchés".',
      [{ text: 'OK', onPress: () => setForm({ ...EMPTY_FORM }) }],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Créer un marché</Text>

      {/* Infos générales */}
      <Field label="Nom du marché" value={form.title} onChange={set('title')} placeholder="Ex : Marché de Noël de Lyon" />

      <FieldLabel>Type d'événement</FieldLabel>
      <View style={styles.typeRow}>
        {EVENT_TYPES.map(t => (
          <TouchableOpacity
            key={t.value}
            style={[styles.typeChip, form.event_type === t.value && styles.typeChipActive]}
            onPress={() => setForm(f => ({ ...f, event_type: t.value }))}
          >
            <Text style={[styles.typeChipText, form.event_type === t.value && styles.typeChipTextActive]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Field label="Description" hint="(optionnel)" value={form.description} onChange={set('description')} placeholder="Décrivez votre marché…" multiline />

      {/* Localisation */}
      <Text style={styles.sectionTitle}>Localisation</Text>
      <Field label="Adresse / lieu" hint="(optionnel)" value={form.location} onChange={set('location')} placeholder="Ex : Parc de la Tête d'Or" />
      <Field label="Ville" value={form.city} onChange={set('city')} placeholder="Ex : Lyon" />
      <Field label="Région" hint="(optionnel)" value={form.region} onChange={set('region')} placeholder="Ex : Auvergne-Rhône-Alpes" />

      {/* Dates */}
      <Text style={styles.sectionTitle}>Dates</Text>
      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <Field label="Date de début" value={form.start_date} onChange={set('start_date')} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Date de fin" value={form.end_date} onChange={set('end_date')} placeholder="AAAA-MM-JJ" keyboardType="numeric" />
        </View>
      </View>
      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <Field label="Heure ouverture" hint="(optionnel)" value={form.start_time} onChange={set('start_time')} placeholder="09:00" keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Heure fermeture" hint="(optionnel)" value={form.end_time} onChange={set('end_time')} placeholder="18:00" keyboardType="numeric" />
        </View>
      </View>

      {/* Stands */}
      <Text style={styles.sectionTitle}>Stands</Text>
      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <Field label="Nombre de stands" value={form.stand_count} onChange={set('stand_count')} placeholder="Ex : 40" keyboardType="numeric" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Prix du stand (€)" hint="0 = gratuit" value={form.stand_price} onChange={set('stand_price')} placeholder="Ex : 80" keyboardType="numeric" />
        </View>
      </View>
      <Field label="Dimensions" hint="(optionnel)" value={form.stand_dimensions} onChange={set('stand_dimensions')} placeholder="Ex : 3m × 2m" />

      {/* Disciplines */}
      <Text style={styles.sectionTitle}>Disciplines recherchées</Text>
      <DisciplinePicker
        selected={form.discipline_tags}
        onChange={tags => setForm(f => ({ ...f, discipline_tags: tags }))}
      />
      <Text style={styles.selectedCount}>{form.discipline_tags.length} discipline{form.discipline_tags.length !== 1 ? 's' : ''} sélectionnée{form.discipline_tags.length !== 1 ? 's' : ''}</Text>

      {/* Règlement */}
      <Field label="Règlement" hint="(optionnel)" value={form.rules} onChange={set('rules')} placeholder="Commission, assurance requise, setup…" multiline />

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.btnDraft, saving && { opacity: 0.5 }]}
          onPress={() => handleSave(false)}
          disabled={saving}
        >
          <Text style={styles.btnDraftText}>Enregistrer en brouillon</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.btnPublish, saving && { opacity: 0.5 }]}
          onPress={() => handleSave(true)}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={colors.text.inverse} />
            : <Text style={styles.btnPublishText}>Publier maintenant</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingTop: spacing.xxl, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text.primary, marginBottom: spacing.xl },

  sectionTitle: {
    ...typography.label, color: colors.text.secondary, textTransform: 'uppercase',
    letterSpacing: 1, marginTop: spacing.xl, marginBottom: 0,
    borderBottomWidth: 1, borderColor: colors.border, paddingBottom: spacing.xs,
  },

  label: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11 },
  hint:  { ...typography.caption, color: colors.text.secondary + '99' },

  input: {
    backgroundColor: colors.surface, color: colors.text.primary,
    padding: spacing.md, borderRadius: radius.md,
    borderWidth: 1, borderColor: colors.border,
  },
  inputMulti: { minHeight: 90, textAlignVertical: 'top' },

  dateRow: { flexDirection: 'row', gap: spacing.sm },

  typeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  typeChip: {
    paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full,
    borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface,
  },
  typeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  typeChipText: { ...typography.caption, color: colors.text.secondary, fontWeight: '500' },
  typeChipTextActive: { color: colors.text.inverse, fontWeight: '700' },

  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.sm },
  tag: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: 5 },
  tagActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  tagText: { ...typography.caption, color: colors.text.secondary },
  tagTextActive: { color: colors.text.inverse, fontWeight: '600' },
  selectedCount: { ...typography.caption, color: colors.primary, marginTop: spacing.sm },

  actions: { gap: spacing.sm, marginTop: spacing.xxl },
  btnDraft: {
    padding: spacing.md, borderRadius: radius.md, alignItems: 'center',
    borderWidth: 1, borderColor: colors.border,
  },
  btnDraftText: { ...typography.label, color: colors.text.secondary, fontWeight: '600' },
  btnPublish: {
    padding: spacing.md, borderRadius: radius.md, alignItems: 'center',
    backgroundColor: colors.primary,
  },
  btnPublishText: { ...typography.label, color: colors.text.inverse, fontWeight: '700', fontSize: 15 },
});

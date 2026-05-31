import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { EventType, EventStatus } from '../types';
import { geocodeCity } from '../utils/geocode';

export interface EventFormData {
  title: string;
  description: string;
  event_type: EventType;
  city: string;
  region: string;
  location: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  stand_count: string;
  stand_price: string;
  stand_dimensions: string;
  discipline_tags: string[];
  rules: string;
}

export const EMPTY_FORM: EventFormData = {
  title: '',
  description: '',
  event_type: 'popup',
  city: '',
  region: '',
  location: '',
  start_date: '',
  end_date: '',
  start_time: '',
  end_time: '',
  stand_count: '',
  stand_price: '',
  stand_dimensions: '',
  discipline_tags: [],
  rules: '',
};

export function useCreateEvent() {
  const [saving, setSaving] = useState(false);

  const validate = (form: EventFormData): string | null => {
    if (!form.title.trim())       return 'Le titre est requis';
    if (!form.city.trim())        return 'La ville est requise';
    if (!form.start_date.match(/^\d{4}-\d{2}-\d{2}$/)) return 'Date de début invalide (format AAAA-MM-JJ)';
    if (!form.end_date.match(/^\d{4}-\d{2}-\d{2}$/))   return 'Date de fin invalide (format AAAA-MM-JJ)';
    if (form.end_date < form.start_date)                return 'La date de fin doit être après la date de début';
    if (!form.stand_count || isNaN(Number(form.stand_count))) return 'Nombre de stands invalide';
    if (form.discipline_tags.length === 0)              return 'Sélectionnez au moins une discipline';
    return null;
  };

  const save = async (
    organizerId: string,
    form: EventFormData,
    status: EventStatus = 'draft',
  ) => {
    const err = validate(form);
    if (err) return { error: err, data: null };

    setSaving(true);
    // Auto-geocode city
    const geo = form.city ? await geocodeCity(form.city, form.region) : null;

    const payload = {
      organizer_id:     organizerId,
      lat:              geo?.lat ?? null,
      lng:              geo?.lng ?? null,
      title:            form.title.trim(),
      description:      form.description.trim() || null,
      event_type:       form.event_type,
      city:             form.city.trim(),
      region:           form.region.trim() || null,
      location:         form.location.trim() || null,
      start_date:       form.start_date,
      end_date:         form.end_date,
      start_time:       form.start_time || null,
      end_time:         form.end_time || null,
      stand_count:      Number(form.stand_count),
      stand_price:      form.stand_price !== '' ? Number(form.stand_price) : null,
      stand_dimensions: form.stand_dimensions.trim() || null,
      discipline_tags:  form.discipline_tags,
      rules:            form.rules.trim() || null,
      status,
    };

    const { data, error } = await supabase.from('events').insert(payload).select().single();
    setSaving(false);
    return { error: error?.message ?? null, data };
  };

  return { save, saving };
}

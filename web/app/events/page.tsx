'use client'

import { useEvents } from '@/lib/hooks'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar } from 'lucide-react'

export default function EventsPage() {
  const { events, loading, error } = useEvents()

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">Chargement des événements...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center text-red-500">Erreur : {error.message}</div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold">Événements & Marchés</h1>
        <p className="mt-4 text-lg text-slate-300">
          Découvrez {events.length} événements artisanaux en France
        </p>
      </motion.div>

      <div className="mt-12 space-y-6">
        {events.map((event, idx) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden hover:border-amber-500 transition"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
              {event.cover_image ? (
                <div className="relative aspect-video md:aspect-square rounded-lg overflow-hidden">
                  <Image
                    src={event.cover_image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition"
                  />
                </div>
              ) : (
                <div className="bg-slate-800 rounded-lg flex items-center justify-center text-slate-500">
                  Pas d'image
                </div>
              )}

              <div className="md:col-span-3">
                <h3 className="text-2xl font-semibold">{event.title}</h3>

                <div className="mt-4 flex flex-col gap-2 text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-amber-500" />
                    <span>
                      {event.city}, {event.region}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-500" />
                    <span>
                      {new Date(event.start_date).toLocaleDateString('fr-FR')} -{' '}
                      {new Date(event.end_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>

                {event.theme && event.theme.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.theme.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-green-500/20 px-3 py-1 text-xs text-green-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-4 line-clamp-2 text-slate-400">{event.description}</p>

                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-400 transition">
                    Voir les détails
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-slate-400">Aucun événement pour le moment. Revenez plus tard !</p>
        </div>
      )}
    </div>
  )
}

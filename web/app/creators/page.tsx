'use client'

import { useCreators } from '@/lib/hooks'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'

export default function CreatorsPage() {
  const { creators, loading, error } = useCreators()

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">Chargement des créateurs...</div>
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
        <h1 className="text-4xl font-bold">Créateurs & Artisans</h1>
        <p className="mt-4 text-lg text-slate-300">
          Découvrez {creators.length} créateurs talentueux à travers la France
        </p>
      </motion.div>

      <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((creator, idx) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden hover:border-amber-500 transition"
          >
            <div className="aspect-square bg-slate-800 relative overflow-hidden">
              {creator.avatar_url ? (
                <Image
                  src={creator.avatar_url}
                  alt={creator.full_name}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-500">
                  Pas d'image
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold">{creator.full_name}</h3>

              {creator.disciplines && creator.disciplines.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {creator.disciplines.slice(0, 3).map((discipline) => (
                    <span
                      key={discipline}
                      className="rounded-full bg-amber-500/20 px-3 py-1 text-xs text-amber-400"
                    >
                      {discipline}
                    </span>
                  ))}
                </div>
              )}

              {creator.city && (
                <p className="mt-4 text-sm text-slate-400">
                  📍 {creator.city}, {creator.region}
                </p>
              )}

              <div className="mt-6 flex gap-2">
                {creator.instagram && (
                  <a
                    href={`https://instagram.com/${creator.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-500 hover:text-amber-400 transition"
                  >
                    Instagram
                  </a>
                )}
                {creator.website && (
                  <a
                    href={creator.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-amber-500 hover:text-amber-400 transition"
                  >
                    Site
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {creators.length === 0 && (
        <div className="mt-12 text-center">
          <p className="text-slate-400">Aucun créateur pour le moment. Revenez plus tard !</p>
        </div>
      )}
    </div>
  )
}

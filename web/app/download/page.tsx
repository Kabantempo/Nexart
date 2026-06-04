'use client'

import { motion } from 'framer-motion'
import { Download, Apple, MessageSquare } from 'lucide-react'

export default function DownloadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold sm:text-5xl">Téléchargez Nexart</h1>
        <p className="mt-4 text-xl text-slate-300">
          Découvrez, candidatez et gérez vos événements artisanaux depuis votre téléphone
        </p>
      </motion.div>

      {/* Platforms Grid */}
      <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2">
        {/* iOS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-slate-800 bg-slate-900/50 p-8"
        >
          <Apple className="h-12 w-12 text-slate-300" />
          <h2 className="mt-4 text-2xl font-semibold">iPhone & iPad</h2>
          <p className="mt-2 text-slate-400">iOS 14.0 ou supérieur</p>

          <div className="mt-8 space-y-3">
            <a
              href="#"
              className="block w-full rounded-lg bg-amber-500 px-4 py-3 text-center font-semibold text-slate-950 hover:bg-amber-400 transition"
            >
              <div className="flex items-center justify-center gap-2">
                <Download className="h-5 w-5" />
                App Store
              </div>
            </a>
            <p className="text-center text-sm text-slate-500">
              Ou scannez le code QR
            </p>
          </div>
        </motion.div>

        {/* Android */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-slate-800 bg-slate-900/50 p-8"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded bg-green-500 font-bold text-white">
            A
          </div>
          <h2 className="mt-4 text-2xl font-semibold">Android</h2>
          <p className="mt-2 text-slate-400">Android 8.0 ou supérieur</p>

          <div className="mt-8 space-y-3">
            <a
              href="#"
              className="block w-full rounded-lg bg-amber-500 px-4 py-3 text-center font-semibold text-slate-950 hover:bg-amber-400 transition"
            >
              <div className="flex items-center justify-center gap-2">
                <Download className="h-5 w-5" />
                Google Play
              </div>
            </a>
            <p className="text-center text-sm text-slate-500">
              Ou scannez le code QR
            </p>
          </div>
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-20 rounded-lg border border-slate-800 bg-slate-900/50 p-8"
      >
        <h2 className="text-2xl font-bold">Fonctionnalités principales</h2>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <span className="text-lg font-bold text-amber-500">📍</span>
            </div>
            <div>
              <h3 className="font-semibold">Découvrez les marchés</h3>
              <p className="mt-1 text-sm text-slate-400">
                100+ marchés en France avec filtres avancés
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <span className="text-lg font-bold text-amber-500">📝</span>
            </div>
            <div>
              <h3 className="font-semibold">Candidatez facilement</h3>
              <p className="mt-1 text-sm text-slate-400">
                Inscription en un clic avec message personnalisé
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <MessageSquare className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-semibold">Messagerie en temps réel</h3>
              <p className="mt-1 text-sm text-slate-400">
                Communiquez avec les organisateurs instantanément
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <span className="text-lg font-bold text-amber-500">💳</span>
            </div>
            <div>
              <h3 className="font-semibold">Paiement Stripe</h3>
              <p className="mt-1 text-sm text-slate-400">
                Payez vos stands directement dans l'app
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <span className="text-lg font-bold text-amber-500">⭐</span>
            </div>
            <div>
              <h3 className="font-semibold">Avis & évaluations</h3>
              <p className="mt-1 text-sm text-slate-400">
                Notez et commentez vos expériences
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-amber-500/20">
              <span className="text-lg font-bold text-amber-500">🗺️</span>
            </div>
            <div>
              <h3 className="font-semibold">Vue interactive</h3>
              <p className="mt-1 text-sm text-slate-400">
                Carte des événements proches de vous
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Help Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-16 text-center"
      >
        <h2 className="text-2xl font-bold">Des questions ?</h2>
        <p className="mt-4 text-slate-300">
          Contactez-nous à{' '}
          <a href="mailto:hello@nexart.fr" className="text-amber-500 hover:text-amber-400">
            hello@nexart.fr
          </a>
        </p>
      </motion.div>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-4xl font-bold">À propos de Nexart</h1>
        <p className="mt-4 text-lg text-slate-300">
          Une plateforme créée pour connecter créateurs et marchés artisanaux
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mt-12 space-y-8"
      >
        <section>
          <h2 className="text-2xl font-bold">Notre mission</h2>
          <p className="mt-4 text-slate-300">
            Nexart connecte deux écosystèmes :
          </p>
          <ul className="mt-4 space-y-2 text-slate-400">
            <li>
              🎨 <strong>Créateurs & Artisans :</strong> tatoueurs, céramistes, graveurs, joailliers, illustrateurs, brodeurs...
              qui cherchent des marchés pour exposer et vendre
            </li>
            <li>
              🏢 <strong>Organisateurs :</strong> marchés permanents, pop-ups, salons, foires qui cherchent des artisans de qualité
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Pourquoi Nexart ?</h2>
          <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="font-semibold text-amber-500">Pour les créateurs</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>✓ Découvrir 100+ marchés en France</li>
                <li>✓ Candidater facilement en 1 clic</li>
                <li>✓ Communiquer avec les organisateurs</li>
                <li>✓ Gérer ses candidatures</li>
                <li>✓ Recevoir des avis</li>
              </ul>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
              <h3 className="font-semibold text-amber-500">Pour les organisateurs</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-400">
                <li>✓ Recruter les bons artisans</li>
                <li>✓ Recevoir des candidatures qualifiées</li>
                <li>✓ Gérer les sélections</li>
                <li>✓ Communiquer facilement</li>
                <li>✓ Évaluer les créateurs</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Fonctionnalités clés</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              '📱 Application mobile native (iOS & Android)',
              '🗺️ Carte interactive des marchés',
              '💬 Messagerie temps réel',
              '💳 Paiement Stripe intégré',
              '⭐ Système d\'avis & évaluations',
              '📍 Filtres géographiques avancés',
              '🔔 Notifications push',
              '🎨 Portfolio créateurs',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-900/50 p-4">
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold">Contact</h2>
          <p className="mt-4 text-slate-300">
            Des questions ? Nous aimerions vous entendre !
          </p>
          <div className="mt-6 flex flex-col gap-4">
            <a
              href="mailto:hello@nexart.fr"
              className="text-amber-500 hover:text-amber-400 transition"
            >
              📧 hello@nexart.fr
            </a>
            <a
              href="https://instagram.com/nexart"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 hover:text-amber-400 transition"
            >
              📸 Instagram @nexart
            </a>
          </div>
        </section>
      </motion.div>
    </div>
  )
}

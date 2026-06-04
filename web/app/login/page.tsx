'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md rounded-lg border border-slate-800 bg-slate-900/50 p-8"
      >
        <h1 className="text-2xl font-bold">Connexion</h1>
        <p className="mt-2 text-slate-400">Accédez à votre compte Nexart</p>

        <form className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="vous@exemple.fr"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Mot de passe</label>
            <input
              type="password"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white placeholder-slate-500 focus:border-amber-500 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-amber-500 px-4 py-2 font-semibold text-slate-950 hover:bg-amber-400 transition"
          >
            Se connecter
          </button>
        </form>

        <p className="mt-6 text-center text-slate-400">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-amber-500 hover:text-amber-400">
            S'inscrire
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, Users, MapPin, MessageSquare, Award, Zap, Heart } from 'lucide-react'

export default function Home() {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
      {/* Hero Section */}
      <section
        style={{
          position: 'relative',
          background: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F7 100%)',
          paddingTop: '128px',
          paddingBottom: '80px',
          paddingLeft: '16px',
          paddingRight: '16px',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center', marginBottom: '48px' }}
          >
            {/* Badge */}
            <div
              style={{
                display: 'inline-block',
                marginBottom: '24px',
                padding: '8px 16px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                color: '#6366F1',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Zap size={16} />
              Connexion créateurs & marchés
            </div>

            {/* Main Heading */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              style={{
                fontSize: '56px',
                fontWeight: '700',
                marginBottom: '24px',
                lineHeight: '1.2',
                color: '#1A1A1A',
              }}
            >
              La plateforme des{' '}
              <span style={{ color: '#6366F1' }}>marchés artisanaux</span> en France
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                fontSize: '20px',
                marginBottom: '48px',
                maxWidth: '900px',
                margin: '0 auto 48px',
                color: '#888888',
                lineHeight: '1.6',
              }}
            >
              Connectez créateurs, artisans et organisateurs de marchés. Découvrez les meilleures
              opportunités pour exposer vos créations et trouver les talents de demain.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                justifyContent: 'center',
                marginBottom: '64px',
              }}
            >
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link
                  href="/events"
                  style={{
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '18px',
                    backgroundColor: '#6366F1',
                    color: '#FFFFFF',
                    textDecoration: 'none',
                    transition: 'all 300ms ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    boxShadow: '0 10px 25px rgba(99, 102, 241, 0.2)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.boxShadow = '0 15px 35px rgba(99, 102, 241, 0.3)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.boxShadow = '0 10px 25px rgba(99, 102, 241, 0.2)'
                  }}
                >
                  Découvrir les événements
                  <ArrowRight size={20} />
                </Link>
                <Link
                  href="/register"
                  style={{
                    padding: '16px 32px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '18px',
                    backgroundColor: '#FFFFFF',
                    color: '#6366F1',
                    border: '2px solid #6366F1',
                    textDecoration: 'none',
                    transition: 'all 300ms ease',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)'
                    e.currentTarget.style.backgroundColor = '#F0F4FF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)'
                    e.currentTarget.style.backgroundColor = '#FFFFFF'
                  }}
                >
                  Créer un profil
                </Link>
              </div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              style={{ textAlign: 'center', marginTop: '64px' }}
            >
              <p style={{ color: '#AAAAAA', fontSize: '14px', marginBottom: '8px' }}>
                Découvrez ce que nous offrons
              </p>
              <div
                style={{
                  width: '24px',
                  height: '40px',
                  borderRadius: '9999px',
                  border: '2px solid #E5E7EB',
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  paddingTop: '8px',
                }}
              >
                <div
                  style={{
                    width: '4px',
                    height: '8px',
                    borderRadius: '9999px',
                    backgroundColor: '#6366F1',
                    animation: 'bounce 1s infinite',
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        style={{
          padding: '64px 16px',
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '32px',
            }}
          >
            {[
              { value: '500+', label: 'Créateurs & Artisans' },
              { value: '100+', label: 'Marchés & Événements' },
              { value: '2000+', label: 'Candidatures/Mois' },
              { value: '45k+', label: 'Visiteurs/Mois' },
            ].map((stat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                style={{ textAlign: 'center' }}
              >
                <p style={{ fontSize: '48px', fontWeight: '700', marginBottom: '8px', color: '#6366F1' }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: '16px', color: '#888888' }}>{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        style={{
          padding: '80px 16px',
          background: 'linear-gradient(to bottom, #FFFFFF, #F5F5F7)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <h2 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px', color: '#1A1A1A' }}>
              Pourquoi choisir Nexart ?
            </h2>
            <p style={{ fontSize: '18px', color: '#888888' }}>
              Une plateforme complète pensée pour créateurs et organisateurs
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '32px',
            }}
          >
            {[
              {
                icon: Users,
                title: 'Connectez créateurs & artisans',
                description: 'Accédez à une communauté de tatoueurs, céramistes, joailliers, illustrateurs et bien d\'autres.',
              },
              {
                icon: MapPin,
                title: '100+ marchés en France',
                description: 'Découvrez des pop-ups, salons, foires et marchés permanents près de chez vous.',
              },
              {
                icon: MessageSquare,
                title: 'Communiquez en temps réel',
                description: 'Messagerie instantanée et notifications pour rester connecté avec les organisateurs.',
              },
              {
                icon: Award,
                title: 'Construisez votre réputation',
                description: 'Avis et notations pour établir la confiance et la crédibilité sur la plateforme.',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                style={{
                  padding: '32px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  transition: 'box-shadow 300ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '16px',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  }}
                >
                  <feature.icon size={24} color="#6366F1" />
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#1A1A1A' }}>
                  {feature.title}
                </h3>
                <p style={{ fontSize: '16px', color: '#888888', lineHeight: '1.5' }}>
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Creators Section */}
      <section
        style={{
          padding: '80px 16px',
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E5E7EB',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginBottom: '64px' }}
          >
            <h2 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '16px', color: '#1A1A1A' }}>
              Découvrez nos meilleurs créateurs
            </h2>
            <p style={{ fontSize: '18px', color: '#888888', maxWidth: '600px', margin: '0 auto' }}>
              Explorez les talents de notre communauté et trouvez l'inspiration dans leurs créations uniques
            </p>
          </motion.div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
            }}
          >
            {[
              {
                name: 'Marie Dubois',
                disciplines: ['Céramique', 'Sculpture'],
                bio: 'Artiste céramiste passionnée par les formes organiques et les textures naturelles.',
                initials: 'MD',
                color: '#FF6B6B',
              },
              {
                name: 'Thomas Martin',
                disciplines: ['Tatouage', 'Illustration'],
                bio: 'Tatoeur réputé pour ses designs custom et son attention au détail.',
                initials: 'TM',
                color: '#4ECDC4',
              },
              {
                name: 'Sophie Laurent',
                disciplines: ['Joaillerie', 'Bijoux'],
                bio: 'Créatrice de bijoux artisanaux en or et argent recyclés avec des pierres naturelles.',
                initials: 'SL',
                color: '#95E1D3',
              },
              {
                name: 'Julien Beaumont',
                disciplines: ['Gravure', 'Design'],
                bio: 'Graveur spécialisé dans les techniques traditionnelles et les finitions précises.',
                initials: 'JB',
                color: '#F38181',
              },
            ].map((creator, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                style={{
                  padding: '32px',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  transition: 'all 300ms ease',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 20px 40px rgba(99, 102, 241, 0.1)'
                  e.currentTarget.style.borderColor = '#6366F1'
                  e.currentTarget.style.transform = 'translateY(-8px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none'
                  e.currentTarget.style.borderColor = '#E5E7EB'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {/* Avatar */}
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '8px',
                    backgroundColor: creator.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: '700',
                    color: '#FFFFFF',
                  }}
                >
                  {creator.initials}
                </div>

                {/* Content */}
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px', color: '#1A1A1A', margin: 0 }}>
                    {creator.name}
                  </h3>
                  <p style={{ fontSize: '14px', color: '#888888', marginBottom: '12px', margin: 0 }}>
                    {creator.bio}
                  </p>

                  {/* Disciplines */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {creator.disciplines.map((discipline) => (
                      <span
                        key={discipline}
                        style={{
                          fontSize: '12px',
                          fontWeight: '500',
                          padding: '6px 12px',
                          borderRadius: '9999px',
                          backgroundColor: 'rgba(99, 102, 241, 0.1)',
                          color: '#6366F1',
                        }}
                      >
                        {discipline}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Link */}
                <Link
                  href="/creators"
                  style={{
                    marginTop: 'auto',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    backgroundColor: '#F5F5F7',
                    color: '#6366F1',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    textAlign: 'center',
                    transition: 'all 300ms ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#6366F1'
                    e.currentTarget.style.color = '#FFFFFF'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#F5F5F7'
                    e.currentTarget.style.color = '#6366F1'
                  }}
                >
                  Voir le profil
                </Link>
              </motion.div>
            ))}
          </div>

          {/* View All Creators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', marginTop: '64px' }}
          >
            <Link
              href="/creators"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '16px 32px',
                borderRadius: '8px',
                border: '2px solid #6366F1',
                backgroundColor: 'transparent',
                color: '#6366F1',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '600',
                transition: 'all 300ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#6366F1'
                e.currentTarget.style.color = '#FFFFFF'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#6366F1'
              }}
            >
              Découvrir tous les créateurs
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        style={{
          padding: '80px 16px',
          background: 'linear-gradient(135deg, #6366F1 0%, #5B5BD6 100%)',
          textAlign: 'center',
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          style={{ maxWidth: '900px', margin: '0 auto' }}
        >
          <h2 style={{ fontSize: '48px', fontWeight: '700', marginBottom: '24px', color: '#FFFFFF' }}>
            Prêt à commencer votre aventure ?
          </h2>
          <p style={{ fontSize: '18px', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '48px' }}>
            Rejoignez des centaines de créateurs et organisateurs qui font confiance à Nexart.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/register"
              style={{
                padding: '16px 32px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '18px',
                backgroundColor: '#FFFFFF',
                color: '#6366F1',
                textDecoration: 'none',
                transition: 'all 300ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Créer mon profil
            </Link>
            <Link
              href="/events"
              style={{
                padding: '16px 32px',
                borderRadius: '8px',
                fontWeight: '600',
                fontSize: '18px',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                border: '2px solid #FFFFFF',
                textDecoration: 'none',
                transition: 'all 300ms ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'scale(1.05)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              Voir les événements
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  )
}

// frontend/src/app/(default-site)/landing/page.tsx
// This is a landing page component for a SaaS application.
'use client';

import Head from 'next/head';

import Hero from '@/components/default-site/Hero';
import ValueProposition from '@/components/default-site/ValueProposition';
import Features from '@/components/default-site/Features';
import EnhancedFeatures from '@/components/default-site/EnhancedFeatures';
import Subscription from '@/components/default-site/Subscription';

import Products from '@/components/default-site/Products';
import Services from '@/components/default-site/Services';
import Marketplace from '@/components/default-site/Marketplace';

import Trust from '@/components/default-site/Trust';
import FAQ from '@/components/default-site/FAQ';
import Blog from '@/components/default-site/Blog';

import AboutUs from '@/components/default-site/AboutUs';
import Teams from '@/components/default-site/Teams';
import Culture from '@/components/default-site/Culture';
import Careers from '@/components/default-site/Careers';

import Contact from '@/components/default-site/Contact';
import Newsletter from '@/components/default-site/Newsletter';
import CTA from '@/components/default-site/CTA';

export default function LandingPage() {
  return (
    <>
      <Head>
        <title>Tu Producto SaaS</title>
        <meta
          name="description"
          content="Empieza a escalar tu negocio con nuestra solución SaaS todo-en-uno."
        />
      </Head>

      {/* Presentación */}
      <Hero />
      <ValueProposition />

      {/* Funcionalidades y Producto */}
      <Features />
      <EnhancedFeatures />
      <Subscription />
      <Products />
      <Services />
      <Marketplace />

      {/* Confianza y contenido */}
      <Trust />
      <FAQ />
      <Blog />

      {/* Equipo y Cultura */}
      <AboutUs />
      <Teams />
      <Culture />
      {/* <Careers /> */}

      {/* Conexión final */}
      <Contact />
      <Newsletter />
      <CTA />
    </>
  );
}

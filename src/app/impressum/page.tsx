"use client";

import { Navigation } from "@/components/ui/navigation";
import { motion } from "framer-motion";

export default function ImpressumPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-slate-900 dark:to-slate-800 pt-20 transition-colors">
        <div className="container mx-auto px-4 md:px-6 py-8">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-3xl md:text-5xl font-bold font-serif text-gray-900 dark:text-white mb-8">
              Impressum
            </h1>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 p-6 md:p-8 space-y-6">
              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Angaben gemäß § 5 TMG
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Restaurant ALAS<br />
                  Bundesstr. 39<br />
                  94554 Moos
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Vertreten durch
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Anastasios Spathis
                </p>
              </section>

              <section>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Kontakt
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Telefon: <a href="tel:+4909938230307" className="text-blue-600 dark:text-blue-400 hover:underline">09938 2320307</a><br />
                  E-Mail: <a href="mailto:info@restaurant-alas.de" className="text-blue-600 dark:text-blue-400 hover:underline">info@restaurant-alas.de</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Umsatzsteuer-ID
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Umsatzsteuer-Identifikationsnummer gemäß §27 a Umsatzsteuergesetz:<br />
                  DE XXX XXX XXX
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Aufsichtsbehörde
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Zuständige Aufsichtsbehörde:
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Gewerbeaufsichtsamt bei der Regierung von Niederbayern<br />
                  Gestütstraße 10<br />
                  84028 Landshut<br /><br />
                  Telefon: 0871 808-01<br />
                  Fax: 0871 808-1799<br />
                  E-Mail: <a href="mailto:poststelle@reg-nb.bayern.de" className="text-blue-600 dark:text-blue-400 hover:underline">poststelle@reg-nb.bayern.de</a><br />
                  Website: <a href="https://www.regierung.niederbayern.bayern.de" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">www.regierung.niederbayern.bayern.de</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Datenschutzaufsicht
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Für datenschutzrechtliche Belange ist das Bayerische Landesamt für Datenschutzaufsicht zuständig:
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)<br />
                  Promenade 18<br />
                  91522 Ansbach<br /><br />
                  Telefon: 0981 180093-0<br />
                  Fax: 0981 180093-800<br />
                  Website: <a href="https://www.lda.bayern.de" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">www.lda.bayern.de</a>
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
                </h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Anastasios Spathis<br />
                  Bundesstr. 39<br />
                  94554 Moos
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Streitschlichtung
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
                  <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">https://ec.europa.eu/consumers/odr</a><br />
                  Unsere E-Mail-Adresse finden Sie oben im Impressum.
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold font-serif mb-4">Kontakt</h3>
              <p className="text-gray-400 mb-2">
                Telefon: <a href="tel:+4909938230307" className="hover:text-white transition-colors">09938 2320307</a>
              </p>
              <p className="text-gray-400 mb-4">
                E-Mail: <a href="mailto:info@restaurant-alas.de" className="hover:text-white transition-colors">info@restaurant-alas.de</a>
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Adresse</h4>
              <p className="text-gray-400 mb-2">Bundesstr. 39</p>
              <p className="text-gray-400">94554 Moos, Niederbayern</p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Folgen Sie uns</h4>
              <div className="flex space-x-4 mb-4">
                <a 
                  href="https://www.facebook.com/p/Griechisches-Restaurant-ALAS-61552077044507/?locale=de_DE" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Facebook"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a 
                  href="https://www.instagram.com/griechischesrestaurantalas/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="Instagram"
                >
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left">
            <div className="mb-4 md:mb-0">
              <a href="/impressum" className="text-gray-400 hover:text-white transition-colors mr-4">
                Impressum
              </a>
              <a href="/datenschutz" className="text-gray-400 hover:text-white transition-colors">
                Datenschutz
              </a>
            </div>
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} Restaurant ALAS. Alle Rechte vorbehalten.
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}


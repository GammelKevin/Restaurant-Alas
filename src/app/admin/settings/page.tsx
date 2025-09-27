"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Settings } from "lucide-react";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 shadow-sm border-b dark:border-slate-700">
        <div className="container mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/admin"
                className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Zurück zum Dashboard
              </Link>
              <div className="border-l border-gray-300 dark:border-gray-600 h-6"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Einstellungen
                </h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  Website-Konfiguration
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 md:px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-8 text-center"
        >
          <Settings className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Einstellungen folgen bald
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Dieser Bereich wird in einer zukünftigen Version verfügbar sein.
          </p>
        </motion.div>
      </div>
    </div>
  );
}


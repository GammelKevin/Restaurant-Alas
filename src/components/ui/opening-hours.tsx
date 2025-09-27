"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Clock, Calendar, Phone, MapPin, Loader2 } from "lucide-react";

interface OpeningHour {
  id: number;
  day: string;
  open_time_1: string | null;
  close_time_1: string | null;
  open_time_2: string | null;
  close_time_2: string | null;
  closed: boolean | number;
  vacation_start: string | null;
  vacation_end: string | null;
  vacation_active: boolean | number;
}

export function OpeningHours() {
  const [hours, setHours] = useState<OpeningHour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOpeningHours();
  }, []);

  const fetchOpeningHours = async () => {
    try {
      const response = await fetch("/api/opening-hours");
      const data = await response.json();

      if (data.success && data.data) {
        setHours(data.data);
      } else {
        // Use fallback data
        setHours(getDefaultHours());
      }
    } catch (err) {
      console.error("Error fetching hours:", err);
      setHours(getDefaultHours());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultHours = (): OpeningHour[] => [
    {
      id: 1,
      day: "Montag",
      open_time_1: "17:30",
      close_time_1: "23:00",
      open_time_2: null,
      close_time_2: null,
      closed: false,
      vacation_start: null,
      vacation_end: null,
      vacation_active: false,
    },
    {
      id: 2,
      day: "Dienstag",
      open_time_1: "17:30",
      close_time_1: "23:00",
      open_time_2: null,
      close_time_2: null,
      closed: false,
      vacation_start: null,
      vacation_end: null,
      vacation_active: false,
    },
    {
      id: 3,
      day: "Mittwoch",
      open_time_1: "17:30",
      close_time_1: "23:00",
      open_time_2: null,
      close_time_2: null,
      closed: false,
      vacation_start: null,
      vacation_end: null,
      vacation_active: false,
    },
    {
      id: 4,
      day: "Donnerstag",
      open_time_1: "17:30",
      close_time_1: "23:00",
      open_time_2: null,
      close_time_2: null,
      closed: false,
      vacation_start: null,
      vacation_end: null,
      vacation_active: false,
    },
    {
      id: 5,
      day: "Freitag",
      open_time_1: "17:30",
      close_time_1: "23:00",
      open_time_2: null,
      close_time_2: null,
      closed: false,
      vacation_start: null,
      vacation_end: null,
      vacation_active: false,
    },
    {
      id: 6,
      day: "Samstag",
      open_time_1: "17:30",
      close_time_1: "23:00",
      open_time_2: null,
      close_time_2: null,
      closed: false,
      vacation_start: null,
      vacation_end: null,
      vacation_active: false,
    },
    {
      id: 7,
      day: "Sonntag",
      open_time_1: "11:30",
      close_time_1: "14:30",
      open_time_2: "17:30",
      close_time_2: "23:00",
      closed: false,
      vacation_start: null,
      vacation_end: null,
      vacation_active: false,
    },
  ];

  const formatTimeString = (hour: OpeningHour): string => {
    // Check if closed or on vacation
    if (hour.closed || hour.closed === 1) return "Geschlossen";
    if (hour.vacation_active || hour.vacation_active === 1) return "Urlaub";

    // Helper to check if a time value is valid
    const isValidTime = (time: any): boolean => {
      if (!time) return false;
      const timeStr = String(time).trim();
      return timeStr !== "" && timeStr !== "0" && timeStr !== "null";
    };

    // Build time string
    let result = "";

    if (isValidTime(hour.open_time_1) && isValidTime(hour.close_time_1)) {
      result = `${hour.open_time_1} - ${hour.close_time_1}`;
    }

    if (isValidTime(hour.open_time_2) && isValidTime(hour.close_time_2)) {
      if (result) {
        result += ` & ${hour.open_time_2} - ${hour.close_time_2}`;
      } else {
        result = `${hour.open_time_2} - ${hour.close_time_2}`;
      }
    }

    return result || "Geschlossen";
  };

  const getCurrentDay = () => {
    const days = [
      "Sonntag",
      "Montag",
      "Dienstag",
      "Mittwoch",
      "Donnerstag",
      "Freitag",
      "Samstag",
    ];
    return days[new Date().getDay()];
  };

  const currentDay = getCurrentDay();

  if (loading) {
    return (
      <section id="hours" className="py-20 bg-gray-900 text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4">
              Öffnungszeiten
            </h2>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
              Wir freuen uns auf Ihren Besuch! Reservierungen sind empfohlen.
            </p>
          </div>
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hours" className="py-20 bg-gray-900 text-white">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold font-serif mb-4">
            Öffnungszeiten
          </h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
            Wir freuen uns auf Ihren Besuch! Reservierungen sind empfohlen.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Opening Hours Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gray-800 rounded-2xl p-8"
            >
              <div className="flex items-center mb-8">
                <Clock className="w-8 h-8 text-blue-400 mr-4" />
                <h3 className="text-2xl font-bold font-serif">
                  Unsere Öffnungszeiten
                </h3>
              </div>

              <div className="space-y-4">
                {hours.map((hour) => {
                  const isToday = hour.day === currentDay;
                  const timeString = formatTimeString(hour);
                  const isClosed =
                    timeString === "Geschlossen" || timeString === "Urlaub";

                  return (
                    <div
                      key={hour.id}
                      className={`flex justify-between items-center py-3 px-4 rounded-lg transition-colors duration-300 ${
                        isToday
                          ? "bg-blue-600/20 border border-blue-500/30"
                          : "hover:bg-gray-700/50"
                      }`}
                    >
                      <span
                        className={`font-semibold ${isToday ? "text-blue-300" : "text-white"}`}
                      >
                        {hour.day}
                        {isToday && (
                          <span className="ml-2 text-xs text-blue-400">
                            (Heute)
                          </span>
                        )}
                      </span>
                      <span
                        className={isClosed ? "text-red-400" : "text-gray-300"}
                      >
                        {timeString}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 p-4 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                <p className="text-blue-300 font-semibold mb-2 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Besondere Hinweise
                </p>
                <p className="text-sm text-gray-300">
                  An Feiertagen können sich die Öffnungszeiten ändern. Bitte
                  rufen Sie uns für aktuelle Informationen an.
                </p>
              </div>
            </motion.div>

            {/* Contact Info Card */}
            <motion.div
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8"
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold font-serif mb-8">
                Reservierung & Kontakt
              </h3>

              <div className="space-y-6">
                <div className="flex items-start">
                  <Phone className="w-6 h-6 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Telefon</p>
                    <a
                      href="tel:+4909938230307"
                      className="text-blue-100 hover:text-white transition-colors duration-300"
                    >
                      09938 / 23 203 07
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <MapPin className="w-6 h-6 mt-1 mr-4 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Adresse</p>
                    <p className="text-blue-100">
                      Bundesstraße 39
                      <br />
                      94554 Moos, Niederbayern
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-blue-500/30">
                <h4 className="font-semibold mb-4">Reservierung empfohlen</h4>
                <p className="text-blue-100 mb-6">
                  Sichern Sie sich Ihren Platz in unserem beliebten Restaurant.
                  Wir freuen uns auf Ihren Besuch!
                </p>
                <a
                  href="tel:+4909938230307"
                  className="inline-block w-full py-3 px-6 bg-white text-blue-700 rounded-lg font-semibold text-center hover:bg-gray-100 transition-colors duration-300"
                >
                  Jetzt reservieren
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

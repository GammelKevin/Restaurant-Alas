"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/context/toast-context";

interface Category {
  id: number;
  name: string;
  display_name: string;
}

interface AddDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: Category[];
}

export function AddDishModal({ isOpen, onClose, onSuccess, categories }: AddDishModalProps) {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    vegetarian: false,
    vegan: false,
    spicy: false,
    gluten_free: false,
    lactose_free: false,
    kid_friendly: false,
    alcohol_free: false,
    contains_alcohol: false,
    homemade: false,
    sugar_free: false,
    recommended: false,
    image_path: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.category_id) {
      showToast("Bitte füllen Sie alle Pflichtfelder aus", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/menu/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category_id),
        }),
      });

      const data = await response.json();

      if (data.success) {
        showToast("Gericht erfolgreich erstellt!", "success");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          name: "",
          description: "",
          price: "",
          category_id: "",
          vegetarian: false,
          vegan: false,
          spicy: false,
          gluten_free: false,
          lactose_free: false,
          kid_friendly: false,
          alcohol_free: false,
          contains_alcohol: false,
          homemade: false,
          sugar_free: false,
          recommended: false,
          image_path: "",
        });
      } else {
        showToast(data.error || "Fehler beim Erstellen des Gerichts", "error");
      }
    } catch (error) {
      console.error("Error creating dish:", error);
      showToast("Fehler beim Erstellen des Gerichts", "error");
    } finally {
      setLoading(false);
    }
  };

  const dietaryOptions = [
    { key: "vegetarian", label: "Vegetarisch", icon: "🌱" },
    { key: "vegan", label: "Vegan", icon: "🌿" },
    { key: "spicy", label: "Scharf", icon: "🌶️" },
    { key: "gluten_free", label: "Glutenfrei", icon: "🌾" },
    { key: "lactose_free", label: "Laktosefrei", icon: "🥛" },
    { key: "kid_friendly", label: "Kinderfreundlich", icon: "👶" },
    { key: "alcohol_free", label: "Alkoholfrei", icon: "🚫" },
    { key: "contains_alcohol", label: "Enthält Alkohol", icon: "🍷" },
    { key: "homemade", label: "Hausgemacht", icon: "👨‍🍳" },
    { key: "sugar_free", label: "Zuckerfrei", icon: "🍬" },
    { key: "recommended", label: "Empfohlen", icon: "⭐" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-white dark:bg-slate-800 flex items-center justify-between p-6 border-b dark:border-slate-700">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Neues Gericht hinzufügen
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                  disabled={loading}
                >
                  <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Category */}
                <div>
                  <Label htmlFor="category" className="text-gray-700 dark:text-gray-300">
                    Kategorie *
                  </Label>
                  <Select
                    value={formData.category_id}
                    onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                    disabled={loading}
                  >
                    <SelectTrigger className="mt-1 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white">
                      <SelectValue placeholder="Kategorie wählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.display_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">
                    Name des Gerichts *
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="z.B. Griechischer Salat"
                    className="mt-1 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description" className="text-gray-700 dark:text-gray-300">
                    Beschreibung
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Beschreiben Sie das Gericht..."
                    className="mt-1 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                {/* Price */}
                <div>
                  <Label htmlFor="price" className="text-gray-700 dark:text-gray-300">
                    Preis (€) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0.00"
                    className="mt-1 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Image Path */}
                <div>
                  <Label htmlFor="image" className="text-gray-700 dark:text-gray-300">
                    Bild-Pfad (optional)
                  </Label>
                  <div className="mt-1 flex gap-2">
                    <Input
                      id="image"
                      value={formData.image_path}
                      onChange={(e) => setFormData({ ...formData, image_path: e.target.value })}
                      placeholder="/images/dishes/gericht.jpg"
                      className="flex-1 border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors flex items-center gap-2"
                      disabled={loading}
                    >
                      <Upload className="w-4 h-4" />
                      Upload
                    </button>
                  </div>
                </div>

                {/* Dietary Options */}
                <div>
                  <Label className="text-gray-700 dark:text-gray-300 mb-3 block">
                    Eigenschaften
                  </Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dietaryOptions.map((option) => (
                      <div key={option.key} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.key}
                          checked={formData[option.key as keyof typeof formData] as boolean}
                          onCheckedChange={(checked) =>
                            setFormData({ ...formData, [option.key]: checked })
                          }
                          className="border-gray-300 dark:border-slate-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                          disabled={loading}
                        />
                        <Label
                          htmlFor={option.key}
                          className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer flex items-center gap-1"
                        >
                          <span>{option.icon}</span>
                          {option.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    disabled={loading}
                  >
                    Abbrechen
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Erstellen...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Gericht hinzufügen
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
import React, { useState } from 'react';
import { X, Check, FileText } from 'lucide-react';
import { ReportHeader } from '../types/tally';

interface EditHeaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  header: ReportHeader;
  onSave: (header: ReportHeader) => void;
}

export const EditHeaderModal: React.FC<EditHeaderModalProps> = ({
  isOpen,
  onClose,
  header,
  onSave,
}) => {
  const [formData, setFormData] = useState<ReportHeader>({
    ...header,
    bagWeightKg: header.bagWeightKg || 1200,
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              Modifier l'en-tête du Rapport de Chargement
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 max-h-[80vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Titre du Rapport
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs uppercase font-bold text-red-600 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* The Producer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                THE PRODUCER (Producteur)
              </label>
              <input
                type="text"
                value={formData.producer}
                onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                placeholder="COSUMAR"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs uppercase font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Unloading Place / Navire */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                UNLOADING PLACE (Navire / Lieu)
              </label>
              <input
                type="text"
                value={formData.unloadingPlace}
                onChange={(e) => setFormData({ ...formData, unloadingPlace: e.target.value })}
                placeholder="MV KAREWOOD"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs uppercase font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Commodity */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              COMMODITY (Marchandise)
            </label>
            <input
              type="text"
              value={formData.commodity}
              onChange={(e) => setFormData({ ...formData, commodity: e.target.value })}
              placeholder="WHITE REFINED SUGAR IN big bag"
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs uppercase font-medium focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                DESTINATION (Port d'arrivée)
              </label>
              <input
                type="text"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="Gaeta, Italy / Kavala, Greece"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Client */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CLIENT
              </label>
              <input
                type="text"
                value={formData.client}
                onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                placeholder="A/C Chadwell"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1 border-t border-slate-200">
            {/* Shift */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                N° SHIFT (Poste de travail)
              </label>
              <input
                type="text"
                value={formData.shiftNo}
                onChange={(e) => setFormData({ ...formData, shiftNo: e.target.value })}
                placeholder="1 (06:00 - 14:00)"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Inspecteur */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                INSPECTEUR (Tally Clerk)
              </label>
              <input
                type="text"
                value={formData.inspector}
                onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                placeholder="M. EL IDRISSI"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs uppercase font-bold focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                DATE
              </label>
              <input
                type="text"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                placeholder="22/10/2026"
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono-numbers focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Nombre de camions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de camions (à remplir par vous-même)
            </label>
            <input
              type="text"
              value={formData.truckCountManual ?? ''}
              onChange={(e) => setFormData({ ...formData, truckCountManual: e.target.value })}
              placeholder="Ex: 20"
              className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs font-mono-numbers focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Bag Weight configuration - 1.200 T default */}
          <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
            <label className="block text-xs font-bold text-amber-950 mb-1">
              Poids unitaire du sac / Big Bag (1 big bag = 1,200 T)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="25"
                max="5000"
                value={formData.bagWeightKg}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    bagWeightKg: Math.max(1, parseInt(e.target.value, 10) || 1200),
                  })
                }
                className="w-32 px-3 py-1.5 bg-white border border-amber-300 rounded text-xs font-bold font-mono-numbers focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-xs text-amber-900 font-medium">
                = <strong>{(formData.bagWeightKg / 1000).toFixed(3)} Tonne(s) (T)</strong> par big bag
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 rounded shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Valider les modifications</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

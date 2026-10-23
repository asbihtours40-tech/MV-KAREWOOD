import React, { useState } from 'react';
import { X, ExternalLink, Image as ImageIcon, ZoomIn } from 'lucide-react';

interface OriginalImageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OriginalImageModal: React.FC<OriginalImageModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [selectedImage, setSelectedImage] = useState<'sheet' | 'matricules'>('matricules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-300 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white">
              Documents Originaux Fournis
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={
                selectedImage === 'sheet'
                  ? '/assets/aistudio/image_a956a843.png'
                  : '/assets/aistudio/125909f6-e399-458d-b1df-8fbad8443e72_8108aab0.jpg'
              }
              target="_blank"
              rel="noreferrer"
              className="text-xs text-slate-300 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              <span>Ouvrir l'image</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab switch between full sheet and matricules crop */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2 text-xs">
          <button
            onClick={() => setSelectedImage('matricules')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
              selectedImage === 'matricules'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Photo des Matricules Camion (N° CAMION)
          </button>
          <button
            onClick={() => setSelectedImage('sheet')}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
              selectedImage === 'sheet'
                ? 'bg-amber-400 text-slate-950 shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Fiche Complète (Rapport Breakbulk)
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-slate-200 flex items-center justify-center min-h-[300px]">
          {selectedImage === 'matricules' ? (
            <div className="text-center">
              <img
                src="/assets/aistudio/125909f6-e399-458d-b1df-8fbad8443e72_8108aab0.jpg"
                alt="Matricules manuscrits des camions"
                className="max-h-[60vh] mx-auto object-contain border border-slate-400 rounded shadow-md bg-white"
              />
              <p className="mt-2 text-xs font-semibold text-slate-700 bg-white/80 py-1 px-3 rounded inline-block font-mono">
                Navette identifiée : 61516 A 55 · 65333 A 55 · 56061 A 55
              </p>
            </div>
          ) : (
            <img
              src="/assets/aistudio/image_a956a843.png"
              alt="Modèle original de la fiche de chargement"
              className="max-h-[60vh] object-contain border border-slate-400 rounded shadow-md bg-white"
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-white border-t border-slate-200 text-xs text-slate-600 flex justify-between items-center">
          <span>
            Configuration actuelle : <strong>3 Cales</strong> · <strong>1 Big Bag = 1,200 T</strong> · Rotation exacte des camions
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-medium rounded text-xs cursor-pointer"
          >
            Fermer l'aperçu
          </button>
        </div>
      </div>
    </div>
  );
};

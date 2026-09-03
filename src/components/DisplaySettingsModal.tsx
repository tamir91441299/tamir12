import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Tv, 
  Check, 
  RotateCcw, 
  Maximize2, 
  X,
  Eye,
  ZoomIn,
  ZoomOut,
  Sparkles
} from 'lucide-react';

export type DeviceMode = 'auto' | 'phone' | 'tablet' | 'pc';
export type CardDensity = 'compact' | 'normal' | 'large';

interface DisplaySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  uiScale: number;
  onUiScaleChange: (scale: number) => void;
  cardDensity: CardDensity;
  onCardDensityChange: (density: CardDensity) => void;
}

export const DisplaySettingsModal: React.FC<DisplaySettingsModalProps> = ({
  isOpen,
  onClose,
  deviceMode,
  onDeviceModeChange,
  uiScale,
  onUiScaleChange,
  cardDensity,
  onCardDensityChange,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'scale'>('preset');

  if (!isOpen) return null;

  const presets: {
    id: DeviceMode;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge: string;
    scale: number;
    density: CardDensity;
  }[] = [
    {
      id: 'auto',
      label: 'Автомат горим',
      description: 'Таны хэрэглэж буй дэлгэцийн өргөнд тохируулан систем өөрөө автоматаар тохирно',
      icon: Sparkles,
      badge: 'Систем',
      scale: 100,
      density: 'normal',
    },
    {
      id: 'phone',
      label: 'Гар утас (Phone)',
      description: 'Мэдрэгчтэй жижиг дэлгэцэнд тохиромжтой том товчлуур, авсаархан картууд',
      icon: Smartphone,
      badge: '360px - 640px',
      scale: 95,
      density: 'compact',
    },
    {
      id: 'tablet',
      label: 'Таблет (Tablet / iPad)',
      description: 'Дунд хэмжээний дэлгэц, iPad, таблетад 3-4 баганатай тохиромжтой харагдац',
      icon: Tablet,
      badge: '768px - 1024px',
      scale: 100,
      density: 'normal',
    },
    {
      id: 'pc',
      label: 'Компьютер / PC (Desktop)',
      description: 'Өргөн дэлгэц, мониторт зориулсан 5-6 баганатай кино театрын өргөн харагдац',
      icon: Monitor,
      badge: '1280px+',
      scale: 105,
      density: 'large',
    },
  ];

  const handleSelectPreset = (p: typeof presets[0]) => {
    onDeviceModeChange(p.id);
    if (p.id !== 'auto') {
      onUiScaleChange(p.scale);
      onCardDensityChange(p.density);
    }
  };

  const handleReset = () => {
    onDeviceModeChange('auto');
    onUiScaleChange(100);
    onCardDensityChange('normal');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="bg-[#0f1117] border border-white/[0.12] rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl shadow-cyan-950/40 text-white relative flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-cyan-950/50 via-zinc-900 to-indigo-950/50 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-lg">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide text-white flex items-center gap-2">
                Дэлгэц & Төхөөрөмжийн тохиргоо
              </h2>
              <p className="text-xs text-zinc-400">
                Утас, PC, таблетын хэмжээнд сайтын харагдацыг тохируулах
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-xl hover:bg-white/[0.06] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Preset Selector */}
          <div>
            <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider mb-2.5 flex items-center justify-between">
              <span>Төхөөрөмжийн харагдах загвар</span>
              <span className="text-cyan-400 text-[11px] font-mono normal-case">
                Одоогийн: {deviceMode.toUpperCase()}
              </span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {presets.map((preset) => {
                const Icon = preset.icon;
                const isSelected = deviceMode === preset.id;
                return (
                  <button
                    key={preset.id}
                    id={`device-mode-${preset.id}`}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-cyan-500/15 border-cyan-400/60 shadow-lg shadow-cyan-500/10'
                        : 'bg-white/[0.03] border-white/[0.07] hover:bg-white/[0.06] hover:border-white/[0.15]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl ${isSelected ? 'bg-cyan-400 text-black' : 'bg-white/[0.08] text-zinc-300'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-white">{preset.label}</span>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-cyan-400 text-black flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      {preset.description}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono pt-1 border-t border-white/[0.04]">
                      <span>Хэмжээ:</span>
                      <span className="text-cyan-300 font-semibold">{preset.badge}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size / Scale Adjustment */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-cyan-400" />
                Сайтын харагдах масштаб (Хэмжээ)
              </span>
              <span className="font-mono text-xs font-black text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-lg">
                {uiScale}%
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => onUiScaleChange(Math.max(80, uiScale - 5))}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] cursor-pointer"
                title="Багасгах"
              >
                <ZoomOut className="w-4 h-4" />
              </button>

              <input
                type="range"
                min="80"
                max="125"
                step="5"
                value={uiScale}
                onChange={(e) => onUiScaleChange(Number(e.target.value))}
                className="flex-1 accent-cyan-400 cursor-pointer h-2 bg-zinc-800 rounded-lg appearance-none"
              />

              <button
                type="button"
                onClick={() => onUiScaleChange(Math.min(125, uiScale + 5))}
                className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.08] cursor-pointer"
                title="Томсгох"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
              <span>80% (Жижиг)</span>
              <span>100% (Стандарт)</span>
              <span>125% (Том)</span>
            </div>
          </div>

          {/* Card Density */}
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 space-y-3">
            <span className="text-xs font-bold text-zinc-200 block">
              Постер, картын нягтрал (Баганын тоо):
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onCardDensityChange('compact')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  cardDensity === 'compact'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white'
                }`}
              >
                Авсаархан (Олон)
              </button>
              <button
                type="button"
                onClick={() => onCardDensityChange('normal')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  cardDensity === 'normal'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white'
                }`}
              >
                Стандарт
              </button>
              <button
                type="button"
                onClick={() => onCardDensityChange('large')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  cardDensity === 'large'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-white/[0.03] text-zinc-400 border-white/[0.06] hover:text-white'
                }`}
              >
                Том постер
              </button>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-black/40 border-t border-white/[0.08] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Анхны хэвэнд оруулах</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black font-black text-xs cursor-pointer shadow-lg shadow-cyan-500/20 transition-all active:scale-95"
          >
            Хадгалах & Болсон
          </button>
        </div>
      </div>
    </div>
  );
};

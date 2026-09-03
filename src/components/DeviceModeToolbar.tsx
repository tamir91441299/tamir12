import React, { useState } from 'react';
import { Smartphone, Tablet, Monitor, Sparkles, Sliders, ChevronDown, ChevronUp, Check, Maximize2, Minimize2 } from 'lucide-react';
import { DeviceMode, CardDensity } from './DisplaySettingsModal';

interface DeviceModeToolbarProps {
  deviceMode: DeviceMode;
  onDeviceModeChange: (mode: DeviceMode) => void;
  uiScale: number;
  onUiScaleChange: (scale: number) => void;
  cardDensity: CardDensity;
  onCardDensityChange: (density: CardDensity) => void;
  onOpenSettings: () => void;
  phoneFrameMode?: boolean;
  onTogglePhoneFrame?: () => void;
}

export const DeviceModeToolbar: React.FC<DeviceModeToolbarProps> = ({
  deviceMode,
  onDeviceModeChange,
  uiScale,
  onUiScaleChange,
  cardDensity,
  onCardDensityChange,
  onOpenSettings,
  phoneFrameMode = false,
  onTogglePhoneFrame,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const modeLabels: Record<DeviceMode, { name: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string; badge: string }> = {
    auto: {
      name: 'Автомат',
      desc: 'Дэлгэцэндээ автоматаар таарна',
      icon: Sparkles,
      color: 'bg-amber-400 text-black',
      badge: 'Систем',
    },
    phone: {
      name: 'Гар утас',
      desc: '360px - 480px хэмжээтэй',
      icon: Smartphone,
      color: 'bg-cyan-400 text-black',
      badge: 'Утас',
    },
    tablet: {
      name: 'Таблет',
      desc: '768px - 1024px iPad хэмжээтэй',
      icon: Tablet,
      color: 'bg-indigo-400 text-white',
      badge: 'Таблет',
    },
    pc: {
      name: 'Компьютер',
      desc: '1280px+ PC хэмжээтэй',
      icon: Monitor,
      color: 'bg-emerald-400 text-black',
      badge: 'PC',
    },
  };

  const handleSelect = (mode: DeviceMode) => {
    onDeviceModeChange(mode);
    if (mode === 'phone') {
      onUiScaleChange(95);
      onCardDensityChange('compact');
    } else if (mode === 'tablet') {
      onUiScaleChange(100);
      onCardDensityChange('normal');
    } else if (mode === 'pc') {
      onUiScaleChange(100);
      onCardDensityChange('normal');
    } else {
      onUiScaleChange(100);
      onCardDensityChange('normal');
    }
  };

  const current = modeLabels[deviceMode];
  const CurrentIcon = current.icon;

  return (
    <div className="fixed bottom-4 right-4 z-40 print:hidden select-none">
      <div className="flex flex-col items-end gap-2">
        {/* Expanded Panel */}
        {isExpanded && (
          <div className="cinema-glass-elevated border border-white/[0.12] rounded-2xl p-3 shadow-2xl backdrop-blur-xl w-64 animate-in fade-in slide-in-from-bottom-3 duration-150">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/[0.08]">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 font-display">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Дэлгэцийн сонголт
              </span>
              <button
                onClick={onOpenSettings}
                className="text-[10px] text-amber-400 hover:text-amber-300 hover:underline font-bold cursor-pointer"
              >
                Дэлгэрэнгүй
              </button>
            </div>

            <div className="space-y-1.5">
              {(['auto', 'phone', 'tablet', 'pc'] as DeviceMode[]).map((mode) => {
                const item = modeLabels[mode];
                const Icon = item.icon;
                const isSelected = deviceMode === mode;
                return (
                  <button
                    key={mode}
                    id={`floating-device-btn-${mode}`}
                    onClick={() => handleSelect(mode)}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-bold transition-all cursor-pointer border ${
                      isSelected
                        ? `${item.color} shadow-md border-transparent font-black`
                        : 'bg-white/[0.04] text-zinc-300 border-white/[0.06] hover:bg-white/[0.08] hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 shrink-0" />
                      <div>
                        <div className="leading-none">{item.name}</div>
                        <div className={`text-[9px] mt-0.5 font-normal leading-tight opacity-75`}>
                          {item.desc}
                        </div>
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3] shrink-0" />}
                  </button>
                );
              })}
            </div>

            {/* Quick Phone Frame Toggle if Phone mode is active */}
            {deviceMode === 'phone' && onTogglePhoneFrame && (
              <div className="mt-2.5 pt-2 border-t border-white/[0.08] flex items-center justify-between">
                <span className="text-[10px] text-zinc-400">Утасны жаазтай:</span>
                <button
                  type="button"
                  onClick={onTogglePhoneFrame}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-colors cursor-pointer border ${
                    phoneFrameMode
                      ? 'bg-cyan-500 text-black border-cyan-400'
                      : 'bg-white/[0.06] text-zinc-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {phoneFrameMode ? 'Идэвхтэй (420px)' : 'Бүхэлд нь'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Trigger Pill */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl cinema-glass-elevated border border-white/[0.12] shadow-2xl backdrop-blur-md">
          {/* Quick inline buttons */}
          <div className="flex items-center gap-1 px-1">
            <button
              id="quick-dock-phone"
              onClick={() => handleSelect('phone')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs ${
                deviceMode === 'phone'
                  ? 'bg-cyan-500 text-black font-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Гар утасны харагдац (Phone: 360px - 480px)"
            >
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">Утас</span>
            </button>

            <button
              id="quick-dock-tablet"
              onClick={() => handleSelect('tablet')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs ${
                deviceMode === 'tablet'
                  ? 'bg-indigo-500 text-white font-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Таблет харагдац (Tablet / iPad: 768px - 1024px)"
            >
              <Tablet className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">Таблет</span>
            </button>

            <button
              id="quick-dock-pc"
              onClick={() => handleSelect('pc')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs ${
                deviceMode === 'pc'
                  ? 'bg-emerald-500 text-black font-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Компьютер / PC харагдац (Desktop: 1280px+)"
            >
              <Monitor className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">PC</span>
            </button>

            <button
              id="quick-dock-auto"
              onClick={() => handleSelect('auto')}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs ${
                deviceMode === 'auto'
                  ? 'bg-amber-400 text-black font-black shadow-md'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.08]'
              }`}
              title="Автомат горим"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline font-bold">Авто</span>
            </button>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Toggle Expand / Settings */}
          <button
            id="toggle-dock-settings-btn"
            onClick={() => setIsExpanded((prev) => !prev)}
            className={`p-2 rounded-xl transition-colors cursor-pointer text-zinc-300 hover:text-white hover:bg-white/[0.08] ${
              isExpanded ? 'bg-white/[0.1] text-amber-400' : ''
            }`}
            title="Тохиргоо нээх"
          >
            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <Sliders className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};

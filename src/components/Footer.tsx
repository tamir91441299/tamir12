import React from 'react';
import { ShieldAlert, Film, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#0f0f11] border-t border-zinc-800/80 text-zinc-400 py-10 px-4 mt-16 text-xs">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Description */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-br from-[#00d2ff] via-[#00a8ff] to-[#3a7bd5] text-white font-black text-xl px-3 py-0.5 rounded">
                IOIO
              </div>
              <span className="font-extrabold text-white text-base text-cyan-400">TV</span>
            </div>
            <p className="text-zinc-400 text-xs leading-relaxed max-w-md">
              IOIO TV нь Монгол хадмал болон дуу оруулгатай кино, олон ангит цувралуудыг өндөр чанартайгаар толилуулах кино платформ юм.
            </p>
          </div>

          {/* Quick links */}
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px]">
              Цэсүүд
            </h4>
            <ul className="space-y-1.5 text-zinc-400">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Эхлэл нүүр</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Бүх кинонууд</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Олон ангит цуврал</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">AI Санал болгогч</a></li>
            </ul>
          </div>

          {/* Social / Contact */}
          <div className="space-y-2">
            <h4 className="font-bold text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Сошиал суваг
            </h4>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Манай Фэйсбүүк хуудсыг дагаж сүүлийн үеийн трэйлер болон кино мэдээллийг цаг тухайд нь аваарай.
            </p>
            <a
              href="https://www.facebook.com/share/r/17wruEiwvA/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded text-xs transition-all shadow-md mt-1"
            >
              <span>Facebook Бичлэг / Холбоос үзэх 🔗</span>
            </a>
          </div>
        </div>

        <div className="border-t border-zinc-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center text-[11px]">
          <p>© 2026 IOIO TV. Бүх эрх хуулиар хамгаалагдсан.</p>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Монгол хэлээр бүтээгдэв</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </div>
        </div>
      </div>
    </footer>
  );
};

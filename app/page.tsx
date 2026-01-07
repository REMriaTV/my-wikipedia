"use client";

import React, { useState, useEffect } from 'react';

// === 設定項目 ===
const ANIMATION_DURATION = 2000;
// 壁のテクスチャ（コンクリート風）
const STONE_TEXTURE_URL = "https://www.transparenttextures.com/patterns/concrete-wall.png";
// ★変更点: 本物の壁画に近い、少し暗めで濃い砂岩色
const STONE_COLOR = '#c2a676'; 
// =================

// プロジェクトデータ（本物）
const projects = [
  {
    id: 'ghost',
    name: 'GHOST-CALENDAR',
    glyph: '/images/glyph-ghost.jpg?v=3',
    banner: 'https://placehold.co/600x200/000000/FFF?text=GHOST+GIF',
    url: 'https://ghost-calendar-dev.com',
  },
  {
    id: 'peach',
    name: 'TWIN PEACH',
    glyph: '/images/glyph-peach.jpg?v=3',
    banner: '/images/banner-peach.gif?v=3',
    url: 'https://twin-peach-dev.com',
  },
  {
    id: 'hand',
    name: 'Hand to Hand',
    glyph: '/images/glyph-hand.jpg?v=3',
    banner: 'https://placehold.co/600x200/333333/FFF?text=Hand+to+Hand+GIF',
    url: 'https://hand-to-hand-dev.com',
  }
];

// ダミー生成用の画像リスト（今は本物と同じ画像を使い回してカサ増しします）
const dummyImages = [
  '/images/glyph-ghost.jpg?v=3',
  '/images/glyph-peach.jpg?v=3',
  '/images/glyph-hand.jpg?v=3',
];

export default function MyWikipediaPrototypeV4() {
  const [mode, setMode] = useState<'flip' | 'crumble'>('flip');
  const [gridItems, setGridItems] = useState<any[]>([]);

  // クライアント側でランダムな壁を生成する
  useEffect(() => {
    // 壁を埋めるブロックの総数（PC画面で綺麗に見える数）
    const TOTAL_SLABS = 48; 
    
    // 1. まずダミーで埋める
    let items = Array.from({ length: TOTAL_SLABS }).map((_, i) => ({
      id: `dummy-${i}`,
      type: 'dummy',
      glyph: dummyImages[Math.floor(Math.random() * dummyImages.length)],
      // ダミーに見えないよう、ランダムに反転・回転させて「別の文字」に見せる
      rotation: Math.random() < 0.5 ? 'scale-x-[-1]' : '', 
      opacity: 0.6 + Math.random() * 0.4, // 透明度もランバラに
    }));

    // 2. 本物のプロジェクトをランダムな位置に紛れ込ませる
    projects.forEach((proj) => {
      // ランダムな位置（インデックス）を決める
      let insertIdx;
      do {
        insertIdx = Math.floor(Math.random() * TOTAL_SLABS);
      } while (items[insertIdx].type !== 'dummy'); // すでに本物が入っている場所は避ける

      items[insertIdx] = {
        ...proj,
        type: 'real',
        rotation: '', // 本物は正位置
        opacity: 0.9,
      };
    });

    setGridItems(items);
  }, []);

  return (
    <div 
      className="min-h-screen font-sans p-4 relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url("${STONE_TEXTURE_URL}")`,
        backgroundColor: '#4a4036' // さらに暗い下地
      }}
    >
      {/* 全体の質感を統一するためのオーバーレイ */}
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply bg-[#5c4d3c] opacity-80"></div>

      {/* --- コントロールパネル --- */}
      <div className="fixed top-4 right-4 z-50 bg-black/60 p-2 rounded-lg backdrop-blur-md border border-stone-600">
        <div className="flex gap-2">
          <button onClick={() => setMode('flip')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'flip' ? 'bg-amber-600 text-black' : 'bg-stone-800 text-stone-400'}`}>Flip</button>
          <button onClick={() => setMode('crumble')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'crumble' ? 'bg-red-800 text-white' : 'bg-stone-800 text-stone-400'}`}>Crumble</button>
        </div>
      </div>

      {/* --- 壁画グリッド --- */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 p-2 border-y-8 border-stone-800/30 bg-stone-900/20 shadow-inner">
          
          {gridItems.map((item) => (
            <div key={item.id} className="aspect-[4/3] relative group perspective-2000">
              
              {item.type === 'real' ? (
                // === 本物のプロジェクト（リンクあり） ===
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative cursor-pointer">
                  
                  {/* 中身（GIFバナー） */}
                  <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden border border-stone-700">
                    <img 
                      src={item.banner} 
                      className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity"
                      style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
                    />
                  </div>

                  {/* 蓋（ヒエログリフ） */}
                  <div 
                    className={`
                      absolute inset-0 w-full h-full flex items-center justify-center
                      /* 枠線をほぼ消して壁と一体化させる */
                      border border-[#8c7b5b]/40
                      transition-all ease-in-out
                      ${mode === 'flip' ? 'backface-hidden group-hover:rotate-y-180 origin-center' : ''}
                      ${mode === 'crumble' ? 'group-hover:opacity-0 group-hover:scale-110 group-hover:blur-md' : ''}
                    `}
                    style={{
                      backgroundImage: `url("${STONE_TEXTURE_URL}")`,
                      backgroundColor: STONE_COLOR,
                      backgroundBlendMode: 'overlay',
                      transitionDuration: `${ANIMATION_DURATION}ms`
                    }}
                  >
                    <img 
                      src={item.glyph} 
                      className="w-[80%] h-[80%] object-contain mix-blend-multiply opacity-80 drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)] filter contrast-125 sepia brightness-90"
                    />
                  </div>
                </a>
              ) : (
                // === ダミーの石板（リンクなし） ===
                <div 
                  className="w-full h-full relative border border-[#8c7b5b]/20 flex items-center justify-center select-none"
                  style={{
                    backgroundImage: `url("${STONE_TEXTURE_URL}")`,
                    backgroundColor: STONE_COLOR,
                    backgroundBlendMode: 'overlay',
                  }}
                >
                  <img 
                    src={item.glyph} 
                    className={`w-[70%] h-[70%] object-contain mix-blend-multiply opacity-60 filter contrast-100 sepia brightness-90 grayscale-[0.3] ${item.rotation}`}
                  />
                </div>
              )}
            </div>
          ))}

        </div>
      </div>
      
      <style jsx global>{`
        .perspective-2000 { perspective: 2000px; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
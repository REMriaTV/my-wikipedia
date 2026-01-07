"use client";

import React, { useState, useEffect } from 'react';

// === 設定項目 ===
// ★修正: 石板の動きはゆっくり（重く）に戻す
const ANIMATION_DURATION = 2000; 

// スマホ用: ダミーが開いた状態で留まる時間
// ゆっくり開く(2000ms)ので、その後500msだけ見せてから閉じ始める
const PEEK_TIME_MOBILE = 2500; 

const STONE_TEXTURE_URL = "https://www.transparenttextures.com/patterns/concrete-wall.png";
const STONE_COLOR = '#c2a676'; 
const EMPTY_CHAMBER_COLOR = '#3e3b36'; // 埃っぽい土色
// =================

// プロジェクトデータ
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

const dummyImages = [
  '/images/glyph-ghost.jpg?v=3',
  '/images/glyph-peach.jpg?v=3',
  '/images/glyph-hand.jpg?v=3',
];

export default function MyWikipediaPrototypeV11() {
  const [mode, setMode] = useState<'flip' | 'crumble'>('flip');
  const [gridItems, setGridItems] = useState<any[]>([]);
  
  const [revealedRealIds, setRevealedRealIds] = useState<string[]>([]);
  const [peekingDummyId, setPeekingDummyId] = useState<string | null>(null);

  useEffect(() => {
    const TOTAL_SLABS = 48; 
    let items = Array.from({ length: TOTAL_SLABS }).map((_, i) => ({
      id: `dummy-${i}`,
      type: 'dummy',
      glyph: dummyImages[Math.floor(Math.random() * dummyImages.length)],
      rotation: Math.random() < 0.5 ? 'scale-x-[-1]' : '', 
      opacity: 0.6 + Math.random() * 0.4, 
    }));

    projects.forEach((proj) => {
      let insertIdx;
      do {
        insertIdx = Math.floor(Math.random() * TOTAL_SLABS);
      } while (items[insertIdx].type !== 'dummy');
      items[insertIdx] = { ...proj, type: 'real', rotation: '', opacity: 0.9 };
    });
    setGridItems(items);
  }, []);

  // --- インタラクション処理 ---
  
  const handleEnter = (id: string, type: 'real' | 'dummy') => {
    if (type === 'real') {
      if (!revealedRealIds.includes(id)) {
        setRevealedRealIds(prev => [...prev, id]);
      }
    } else {
      // ダミーの場合
      setPeekingDummyId(id);
      
      // スマホ用: 自動で閉じるタイマーをセット
      // PCのホバー操作と干渉しないよう、少し長めの猶予を持たせています
      setTimeout(() => {
        setPeekingDummyId(current => current === id ? null : current);
      }, PEEK_TIME_MOBILE);
    }
  };

  const handleLeave = (type: 'real' | 'dummy') => {
    if (type === 'dummy') {
      // PC: カーソルが離れたら「即座に」閉じる指令を出す
      // アニメーション速度自体はゆっくり（2秒）だが、開始は即時。
      setPeekingDummyId(null);
    }
  };

  return (
    <div 
      className="min-h-screen font-sans p-4 relative flex items-center justify-center overflow-hidden"
      style={{
        backgroundImage: `url("${STONE_TEXTURE_URL}")`,
        backgroundColor: '#4a4036' 
      }}
    >
      <div className="absolute inset-0 pointer-events-none mix-blend-multiply bg-[#5c4d3c] opacity-80"></div>

      <div className="fixed top-4 right-4 z-50 bg-black/60 p-2 rounded-lg backdrop-blur-md border border-stone-600">
        <div className="flex gap-2">
          <button onClick={() => setMode('flip')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'flip' ? 'bg-amber-600 text-black' : 'bg-stone-800 text-stone-400'}`}>Flip</button>
          <button onClick={() => setMode('crumble')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'crumble' ? 'bg-red-800 text-white' : 'bg-stone-800 text-stone-400'}`}>Crumble</button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 p-2 border-y-8 border-stone-800/30 bg-stone-900/20 shadow-inner">
          
          {gridItems.map((item) => {
            const isRevealed = item.type === 'real' 
              ? revealedRealIds.includes(item.id) 
              : peekingDummyId === item.id;

            return (
              <div 
                key={item.id} 
                className="aspect-[4/3] relative perspective-2000"
                
                // PC: ホバー中だけ開く
                onMouseEnter={() => handleEnter(item.id, item.type)}
                onMouseLeave={() => handleLeave(item.type)}
                
                // スマホ: タップで開閉サイクル開始
                onClick={() => handleEnter(item.id, item.type)}

                style={{ cursor: isRevealed && item.type === 'real' ? 'default' : 'pointer' }}
              >
                
                {item.type === 'real' ? (
                  // === 本物 ===
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full h-full relative"
                    onClick={(e) => { 
                        if (!isRevealed) { e.preventDefault(); } 
                    }}
                  >
                    <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden border border-stone-700">
                      <img 
                        src={item.banner} 
                        className={`w-full h-full object-cover transition-opacity ease-in-out ${isRevealed ? 'opacity-100' : 'opacity-0'}`}
                        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
                      />
                    </div>
                    <StoneSlab item={item} isRevealed={isRevealed} mode={mode} />
                  </a>
                ) : (
                  // === ダミー ===
                  <div className="w-full h-full relative select-none">
                     
                     {/* 埃っぽい玄室（V10のデザインを維持） */}
                     <div 
                      className="absolute inset-0 w-full h-full border border-[#2a2622]"
                      style={{
                        backgroundImage: `url("${STONE_TEXTURE_URL}")`,
                        backgroundColor: EMPTY_CHAMBER_COLOR,
                        backgroundBlendMode: 'multiply',
                      }}
                     >
                        <div className="absolute inset-0 w-full h-full shadow-[inset_0_0_50px_rgba(0,0,0,0.8)]"></div>
                        <div className="absolute inset-0 w-full h-full opacity-30 mix-blend-overlay"
                             style={{ backgroundImage: `url("${STONE_TEXTURE_URL}")`, filter: 'contrast(1.5)' }}>
                        </div>
                     </div>

                     <StoneSlab item={item} isRevealed={isRevealed} mode={mode} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <style jsx global>{`
        .perspective-2000 { perspective: 2000px; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .stone-shadow { box-shadow: 4px 4px 10px rgba(0,0,0,0.5), inset 1px 1px 2px rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
}

const StoneSlab = ({ item, isRevealed, mode }: any) => (
  <div 
    className={`
      absolute inset-0 w-full h-full flex items-center justify-center stone-shadow
      border border-[#8c7b5b]/40
      transition-all ease-in-out
      ${mode === 'flip' && isRevealed ? 'rotate-y-180 opacity-0 pointer-events-none' : ''}
      ${mode === 'crumble' && isRevealed ? 'opacity-0 scale-110 blur-md pointer-events-none' : ''}
    `}
    style={{
      backgroundImage: `url("${STONE_TEXTURE_URL}")`,
      backgroundColor: STONE_COLOR,
      backgroundBlendMode: 'overlay',
      transitionDuration: `${ANIMATION_DURATION}ms`,
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d'
    }}
  >
    <img 
      src={item.glyph} 
      className={`w-[80%] h-[80%] object-contain mix-blend-multiply drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)] filter contrast-125 sepia brightness-90 ${item.type === 'dummy' ? 'opacity-60 grayscale-[0.3]' : 'opacity-80'} ${item.rotation}`}
    />
  </div>
);
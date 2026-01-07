"use client";

import React, { useState, useEffect } from 'react';

// === 設定項目 ===
const ANIMATION_DURATION = 2000;
const STONE_TEXTURE_URL = "https://www.transparenttextures.com/patterns/concrete-wall.png";
const STONE_COLOR = '#c2a676'; 
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

export default function MyWikipediaPrototypeV5() {
  const [mode, setMode] = useState<'flip' | 'crumble'>('flip');
  const [gridItems, setGridItems] = useState<any[]>([]);
  // ★追加: 発見された（めくられた）アイテムのIDを記録するリスト
  const [discoveredIds, setDiscoveredIds] = useState<string[]>([]);

  // クライアント側でランダムな壁を生成
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

      items[insertIdx] = {
        ...proj,
        type: 'real',
        rotation: '', 
        opacity: 0.9,
      };
    });

    setGridItems(items);
  }, []);

  // ★追加: アイテムを発見状態にする関数
  const handleDiscover = (id: string) => {
    if (!discoveredIds.includes(id)) {
      setDiscoveredIds((prev) => [...prev, id]);
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

      {/* コントロールパネル */}
      <div className="fixed top-4 right-4 z-50 bg-black/60 p-2 rounded-lg backdrop-blur-md border border-stone-600">
        <div className="flex gap-2">
          <button onClick={() => setMode('flip')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'flip' ? 'bg-amber-600 text-black' : 'bg-stone-800 text-stone-400'}`}>Flip</button>
          <button onClick={() => setMode('crumble')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'crumble' ? 'bg-red-800 text-white' : 'bg-stone-800 text-stone-400'}`}>Crumble</button>
        </div>
      </div>

      {/* 壁画グリッド */}
      <div className="relative z-10 w-full max-w-7xl mx-auto">
        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1 p-2 border-y-8 border-stone-800/30 bg-stone-900/20 shadow-inner">
          
          {gridItems.map((item) => {
            // このアイテムがすでに発見されているかどうか
            const isRevealed = discoveredIds.includes(item.id);

            return (
              <div 
                key={item.id} 
                className="aspect-[4/3] relative perspective-2000"
                // PC用: ホバーしたら発見済みにする
                onMouseEnter={() => handleDiscover(item.id)}
              >
                
                {item.type === 'real' ? (
                  // === 本物のプロジェクト ===
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="block w-full h-full relative cursor-pointer"
                    // スマホ用: タップ時の挙動制御
                    onClick={(e) => {
                      // まだめくれていない時は、リンク移動をキャンセルして「めくる」だけにする
                      if (!isRevealed) {
                        e.preventDefault();
                        handleDiscover(item.id);
                      }
                      // めくれている時は、通常通りリンクへ飛ぶ
                    }}
                  >
                    
                    {/* 中身（GIFバナー） */}
                    <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden border border-stone-700">
                      <img 
                        src={item.banner} 
                        className={`w-full h-full object-cover transition-opacity ease-in-out ${isRevealed ? 'opacity-100' : 'opacity-0'}`}
                        style={{ transitionDuration: `${ANIMATION_DURATION}ms` }}
                      />
                    </div>

                    {/* 蓋（ヒエログリフ） */}
                    <div 
                      className={`
                        absolute inset-0 w-full h-full flex items-center justify-center
                        border border-[#8c7b5b]/40
                        transition-all ease-in-out
                        ${/* 状態によってクラスを切り替える */ ''}
                        ${mode === 'flip' && isRevealed ? 'rotate-y-180 opacity-0 pointer-events-none' : ''}
                        ${mode === 'crumble' && isRevealed ? 'opacity-0 scale-110 blur-md pointer-events-none' : ''}
                      `}
                      style={{
                        backgroundImage: `url("${STONE_TEXTURE_URL}")`,
                        backgroundColor: STONE_COLOR,
                        backgroundBlendMode: 'overlay',
                        transitionDuration: `${ANIMATION_DURATION}ms`,
                        // Flipモードの時は裏面を見せない
                        backfaceVisibility: 'hidden',
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <img 
                        src={item.glyph} 
                        className={`w-[80%] h-[80%] object-contain mix-blend-multiply opacity-80 drop-shadow-[1px_1px_0px_rgba(255,255,255,0.3)] filter contrast-125 sepia brightness-90 ${item.rotation}`}
                      />
                    </div>
                  </a>
                ) : (
                  // === ダミーの石板 ===
                  <div 
                    className="w-full h-full relative border border-[#8c7b5b]/20 flex items-center justify-center select-none"
                    // ダミーもタップ/ホバーで崩れるようにする
                    onClick={() => handleDiscover(item.id)}
                    style={{
                        cursor: isRevealed ? 'default' : 'pointer'
                    }}
                  >
                     {/* ダミーの中身（空洞） */}
                     <div className="absolute inset-0 w-full h-full bg-[#2a2622]"></div>

                     {/* ダミーの蓋 */}
                    <div 
                      className={`
                        absolute inset-0 w-full h-full flex items-center justify-center
                        transition-all ease-in-out
                        ${mode === 'flip' && isRevealed ? 'rotate-y-180 opacity-0' : ''}
                        ${mode === 'crumble' && isRevealed ? 'opacity-0 scale-110 blur-md' : ''}
                      `}
                      style={{
                        backgroundImage: `url("${STONE_TEXTURE_URL}")`,
                        backgroundColor: STONE_COLOR,
                        backgroundBlendMode: 'overlay',
                        transitionDuration: `${ANIMATION_DURATION}ms`,
                        backfaceVisibility: 'hidden'
                      }}
                    >
                        <img 
                            src={item.glyph} 
                            className={`w-[70%] h-[70%] object-contain mix-blend-multiply opacity-60 filter contrast-100 sepia brightness-90 grayscale-[0.3] ${item.rotation}`}
                        />
                    </div>
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
      `}</style>
    </div>
  );
}
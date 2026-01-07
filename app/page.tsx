"use client";

import React, { useState, useEffect, useRef } from 'react';

// === 設定項目 ===
const ANIMATION_DURATION = 2000; 

const BIG_WALL_IMG = "/images/stone-slab.jpg?v=7"; 
const EMPTY_CHAMBER_IMG = "/images/empty-chamber.jpg?v=7";    
const FALLBACK_TEXTURE = "https://www.transparenttextures.com/patterns/concrete-wall.png";
// =================

const projects = [
  {
    id: 'ghost',
    name: 'GHOST-CALENDAR',
    glyph: '/images/glyph-ghost.jpg?v=5',
    banner: '/images/banner_ghost.gif?v=8', 
    url: 'https://ghosttime-eta.vercel.app',
  },
  {
    id: 'peach',
    name: 'TWIN PEACH',
    glyph: '/images/glyph-peach.jpg?v=5',
    banner: '/images/banner-peach.gif?v=5', 
    url: 'https://remriatv.github.io/twinpeach/index.html',
  },
  {
    id: 'hand',
    name: 'Hand to Hand',
    glyph: '/images/glyph-hand.jpg?v=5',
    banner: 'https://placehold.co/600x200/333333/FFF?text=Hand+to+Hand+GIF',
    url: 'https://remriatv.github.io/HandtoHand/#story',
  }
];

const dummyImages = [
  '/images/glyph-ghost.jpg?v=5',
  '/images/glyph-peach.jpg?v=5',
  '/images/glyph-hand.jpg?v=5',
];

export default function MyWikipediaPrototypeV22() {
  const [mode, setMode] = useState<'flip' | 'crumble'>('flip');
  const [gridItems, setGridItems] = useState<any[]>([]);
  const [columns, setColumns] = useState(4); // モバイルファースト（初期値4）
  
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  // 画面サイズ監視（画像のズレ防止）
  useEffect(() => {
    const handleResize = () => {
      // Tailwindのブレークポイントと完全に一致させる
      let newCols = 4;
      if (window.innerWidth >= 1024) newCols = 8;      // lg
      else if (window.innerWidth >= 768) newCols = 6;  // md
      
      setColumns(newCols);
    };

    // 初回実行とリスナー登録
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const TOTAL_SLABS = 48; 
    let items = Array.from({ length: TOTAL_SLABS }).map((_, i) => ({
      id: `slab-${i}`, // IDをシンプルに
      index: i,
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
      items[insertIdx] = { ...proj, id: `slab-${insertIdx}`, index: insertIdx, type: 'real', rotation: '', opacity: 0.9 };
    });
    setGridItems(items);
  }, []);

  // 開封処理
  const reveal = (id: string) => {
    if (!revealedIds.includes(id)) {
      setRevealedIds(prev => [...prev, id]);
    }
  };

  // ★追加: スマホのなぞり操作（Touch Move）の処理
  const handleTouchMove = (e: React.TouchEvent) => {
    // 画面スクロールを少し抑制（必要に応じて）
    // e.preventDefault(); 

    // 指の位置にある要素を取得
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);

    // その要素が石板（data-slab-idを持っている）か確認
    const slabElement = target?.closest('[data-slab-id]');
    if (slabElement) {
      const id = slabElement.getAttribute('data-slab-id');
      if (id) reveal(id);
    }
  };

  return (
    <div className="min-h-screen font-sans relative flex items-center justify-center overflow-hidden bg-[#2a2622]">
      <div className="absolute inset-0 pointer-events-none opacity-50" style={{ backgroundImage: `url("${FALLBACK_TEXTURE}")`, backgroundSize: 'cover' }}></div>
      <div className="absolute inset-0 pointer-events-none bg-black/60"></div>

      <div className="fixed top-4 right-4 z-50 bg-black/60 p-2 rounded-lg backdrop-blur-md border border-stone-600">
        <div className="flex gap-2">
          <button onClick={() => setMode('flip')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'flip' ? 'bg-amber-600 text-black' : 'bg-stone-800 text-stone-400'}`}>Flip</button>
          <button onClick={() => setMode('crumble')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'crumble' ? 'bg-red-800 text-white' : 'bg-stone-800 text-stone-400'}`}>Crumble</button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto md:my-10">
        {/* ★変更: グリッド全体でタッチ操作を監視 */}
        <div 
            className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-0 shadow-2xl touch-none" // touch-noneでブラウザの戻る操作などを防ぐ
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchMove}
        >
          
          {gridItems.map((item) => {
            const isRevealed = revealedIds.includes(item.id);
            
            const colIndex = item.index % columns;
            const rowIndex = Math.floor(item.index / columns);
            const totalRows = Math.ceil(48 / columns);
            const bgSize = `${columns * 100}% ${totalRows * 100}%`;
            const bgPos = `${(colIndex / (columns - 1)) * 100}% ${(rowIndex / (totalRows - 1)) * 100}%`;

            return (
              <div 
                key={item.id} 
                // ★追加: タッチ判定用のIDを埋め込む
                data-slab-id={item.id}
                className="aspect-[4/3] relative perspective-2000 group"
                style={{ cursor: !isRevealed ? 'pointer' : 'default', willChange: 'transform' }}
                // PC用ホバー
                onMouseEnter={() => reveal(item.id)}
                // スマホ用クリック（なぞらずにタップした場合）
                onClick={() => reveal(item.id)}
              >
                {item.type === 'real' ? (
                  // === 本物 ===
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative" 
                     onClick={(e) => { 
                        // ★重要: まだ開いていない時はリンク移動を「完全に」無効化
                        if (!isRevealed) { 
                            e.preventDefault(); 
                            reveal(item.id); 
                        } 
                     }}
                  >
                    <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
                      <img src={item.banner} loading="lazy" className={`w-full h-full object-cover transition-opacity ease-in-out ${isRevealed ? 'opacity-100' : 'opacity-0'}`} style={{ transitionDuration: `${ANIMATION_DURATION}ms` }} />
                    </div>
                    <StoneSlab item={item} isRevealed={isRevealed} mode={mode} bgPos={bgPos} bgSize={bgSize} />
                  </a>
                ) : (
                  // === ダミー ===
                  <div className="w-full h-full relative select-none">
                     <div className="absolute inset-0 w-full h-full" 
                        style={{ 
                            backgroundImage: `url("${EMPTY_CHAMBER_IMG}"), url("${FALLBACK_TEXTURE}")`, 
                            backgroundColor: '#1a1815', 
                            backgroundSize: bgSize, 
                            backgroundPosition: bgPos,
                        }}>
                     </div>
                     <StoneSlab item={item} isRevealed={isRevealed} mode={mode} bgPos={bgPos} bgSize={bgSize} />
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
        .stone-shadow { box-shadow: none; }
      `}</style>
    </div>
  );
}

// 石板コンポーネント
const StoneSlab = ({ item, isRevealed, mode, bgPos, bgSize }: any) => (
  <div 
    className={`
      absolute inset-0 w-full h-full flex items-center justify-center
      transition-all ease-in-out
      ${mode === 'flip' && isRevealed ? 'rotate-y-180 opacity-0 pointer-events-none' : ''}
      ${mode === 'crumble' && isRevealed ? 'opacity-0 scale-110 blur-md pointer-events-none' : ''}
    `}
    style={{
      backgroundImage: `url("${BIG_WALL_IMG}"), url("${FALLBACK_TEXTURE}")`,
      backgroundColor: '#b09b7c',
      backgroundSize: bgSize,
      backgroundPosition: bgPos,
      transitionDuration: `${ANIMATION_DURATION}ms`,
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d',
      border: 'none',
      boxShadow: 'none',
      willChange: 'transform, opacity'
    }}
  >
    <img 
      src={item.glyph} 
      loading="lazy"
      className={`
        w-[75%] h-[75%] object-contain 
        ${item.type === 'dummy' ? 'opacity-60' : 'opacity-90'} 
        ${item.rotation}
      `}
      style={{
        mixBlendMode: 'multiply',
        filter: 'contrast(1.2)'
      }}
    />
  </div>
);
"use client";

import React, { useState, useEffect } from 'react';

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

export default function MyWikipediaPrototypeV23() {
  const [mode, setMode] = useState<'flip' | 'crumble'>('flip');
  const [gridItems, setGridItems] = useState<any[]>([]);
  const [columns, setColumns] = useState(4); 
  
  const [revealedIds, setRevealedIds] = useState<string[]>([]);

  // 画面サイズ監視
  useEffect(() => {
    const handleResize = () => {
      let newCols = 4;
      if (window.innerWidth >= 1024) newCols = 8;      // lg
      else if (window.innerWidth >= 768) newCols = 6;  // md
      setColumns(newCols);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const TOTAL_SLABS = 48; 
    let items = Array.from({ length: TOTAL_SLABS }).map((_, i) => ({
      id: `slab-${i}`,
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

  // タッチ操作（なぞり発掘）
  const handleTouchMove = (e: React.TouchEvent) => {
    // ★修正: e.preventDefault() を削除し、スクロールを許可する
    
    // 指の位置にある要素を取得して発掘
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slabElement = target?.closest('[data-slab-id]');
    if (slabElement) {
      const id = slabElement.getAttribute('data-slab-id');
      if (id) reveal(id);
    }
  };

  return (
    <div className="min-h-screen font-sans relative flex items-center justify-center bg-[#2a2622]">
      {/* 背景 */}
      <div className="fixed inset-0 pointer-events-none opacity-50" style={{ backgroundImage: `url("${FALLBACK_TEXTURE}")`, backgroundSize: 'cover' }}></div>
      <div className="fixed inset-0 pointer-events-none bg-black/60"></div>

      {/* コントロールパネル */}
      <div className="fixed top-4 right-4 z-50 bg-black/60 p-2 rounded-lg backdrop-blur-md border border-stone-600">
        <div className="flex gap-2">
          <button onClick={() => setMode('flip')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'flip' ? 'bg-amber-600 text-black' : 'bg-stone-800 text-stone-400'}`}>Flip</button>
          <button onClick={() => setMode('crumble')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'crumble' ? 'bg-red-800 text-white' : 'bg-stone-800 text-stone-400'}`}>Crumble</button>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto md:my-10">
        {/* ★修正: touch-none を削除し、代わりに style={{ touchAction: 'pan-y' }} を適用 */}
        {/* これにより「縦スクロール」が可能になり、かつ「なぞり操作」も受け付ける */}
        <div 
            className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-0 shadow-2xl"
            style={{ touchAction: 'pan-y' }} 
            onTouchMove={handleTouchMove}
            // 一応タッチ開始時も反応させる
            onTouchStart={handleTouchMove}
        >
          
          {gridItems.map((item) => {
            const isRevealed = revealedIds.includes(item.id);
            
            // === 画像の歪み防止ロジック ===
            const colIndex = item.index % columns;
            const rowIndex = Math.floor(item.index / columns);
            
            // ★変更: 縦を引き伸ばさない
            // 横幅(100%)に合わせて、縦は自動(auto)にする。
            // これによりアスペクト比が維持される（石が歪まない）。
            const bgSize = `${columns * 100}% auto`;
            
            // 位置の計算
            // 横はカラム数で分割。縦は画像が繰り返される前提で、ピクセル計算ではなく比率で逃げる
            // ※「auto」の場合、正確な位置合わせには工夫が必要だが、
            //   ここでは簡易的に rows ベースで計算し、テクスチャのリピートを活用する
            const totalRows = Math.ceil(48 / columns);
            const bgPos = `${(colIndex / (columns - 1)) * 100}% ${(rowIndex / (totalRows - 1)) * 100}%`;

            return (
              <div 
                key={item.id} 
                data-slab-id={item.id}
                className="aspect-[4/3] relative perspective-2000 group"
                style={{ cursor: !isRevealed ? 'pointer' : 'default', willChange: 'transform' }}
                onMouseEnter={() => reveal(item.id)}
                onClick={() => reveal(item.id)}
              >
                {item.type === 'real' ? (
                  // === 本物 ===
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative" 
                     onClick={(e) => { 
                        // ★安全装置: まだ開いていない時はリンク移動をブロック
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
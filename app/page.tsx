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

export default function MyWikipediaPrototypeV24() {
  const [mode, setMode] = useState<'flip' | 'crumble'>('flip');
  const [gridItems, setGridItems] = useState<any[]>([]);
  
  // 画面分割数
  const [columns, setColumns] = useState(4); 
  const [rows, setRows] = useState(12); // モバイルは縦12行で1画面に収める

  const [revealedIds, setRevealedIds] = useState<string[]>([]);
  
  // グリッドコンテナの参照（画像のサイズ計算用）
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  // 画面サイズ監視 & レイアウト計算
  useEffect(() => {
    const handleResize = () => {
      // コンテナのサイズを取得
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }

      // カラム数・行数の決定
      if (window.innerWidth >= 1024) {
        setColumns(8);
        setRows(6); // PC: 8x6 = 48
      } else if (window.innerWidth >= 768) {
        setColumns(6);
        setRows(8); // Tablet: 6x8 = 48
      } else {
        setColumns(4);
        setRows(12); // Mobile: 4x12 = 48 (縦長)
      }
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

  const reveal = (id: string) => {
    if (!revealedIds.includes(id)) {
      setRevealedIds(prev => [...prev, id]);
    }
  };

  // タッチ操作（なぞり発掘）
  const handleTouchMove = (e: React.TouchEvent) => {
    // スクロールを禁止するため preventDefault (画面固定ならこれが必要)
    // ただし、もしコンテンツがはみ出す場合はスクロールできなくなるので注意
    // 今回は「1画面に収める」要望なのでOK
    // e.preventDefault(); 
    
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const slabElement = target?.closest('[data-slab-id]');
    if (slabElement) {
      const id = slabElement.getAttribute('data-slab-id');
      if (id) reveal(id);
    }
  };

  return (
    // ★変更: h-screen と overflow-hidden でスクロールを禁止
    <div className="h-[100dvh] w-full font-sans relative flex items-center justify-center bg-[#2a2622] overflow-hidden">
      
      {/* 背景（隙間から見えるベース） */}
      <div className="fixed inset-0 pointer-events-none opacity-50" style={{ backgroundImage: `url("${FALLBACK_TEXTURE}")`, backgroundSize: 'cover' }}></div>
      <div className="fixed inset-0 pointer-events-none bg-black/60"></div>

      {/* コントロールパネル */}
      <div className="fixed top-4 right-4 z-50 bg-black/60 p-2 rounded-lg backdrop-blur-md border border-stone-600">
        <div className="flex gap-2">
          <button onClick={() => setMode('flip')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'flip' ? 'bg-amber-600 text-black' : 'bg-stone-800 text-stone-400'}`}>Flip</button>
          <button onClick={() => setMode('crumble')} className={`px-3 py-1 rounded text-xs font-bold ${mode === 'crumble' ? 'bg-red-800 text-white' : 'bg-stone-800 text-stone-400'}`}>Crumble</button>
        </div>
      </div>

      {/* グリッドコンテナ */}
      {/* ★変更: h-full で画面いっぱいに広げる */}
      <div 
        ref={containerRef}
        className="relative z-10 w-full h-full max-w-7xl mx-auto md:py-10"
      >
        <div 
            className="grid h-full w-full gap-0 shadow-2xl touch-none" // touch-noneでブラウザ標準動作を無効化
            style={{ 
              gridTemplateColumns: `repeat(${columns}, 1fr)`,
              gridTemplateRows: `repeat(${rows}, 1fr)` 
            }}
            onTouchMove={handleTouchMove}
            onTouchStart={handleTouchMove}
        >
          
          {gridItems.map((item) => {
            const isRevealed = revealedIds.includes(item.id);
            
            // === 一枚絵に見せるための魔法の計算 (Cover Logic) ===
            // 各石板が、背景画像の「どの部分」を切り取って表示すべきかを計算します。
            
            const colIndex = item.index % columns;
            const rowIndex = Math.floor(item.index / columns);

            // 1. まず、グリッド全体のアスペクト比を計算
            const gridAspect = containerSize.width / containerSize.height || 1; 
            // ※本来は画像の元サイズが必要ですが、ここでは「画像も正方形に近い」と仮定するか、
            //   あるいは「常に画像を中央配置でCoverさせる」CSSテクニックを使います。

            // シンプルかつ強力な方法: 
            // 各セルに同じ画像を貼り、「background-size: columns*100% rows*100%」ではなく
            // コンテナ全体に対する比率で指定する。
            
            // ここでは「画面サイズに合わせて引き伸ばす（100% 100%）」を採用します。
            // ユーザーが「一枚の画像になっていない（ズレている）」と感じる一番の原因はタイリングだからです。
            // 多少縦横比が変わっても、壁画全体が見えることを優先します。
            const bgSize = `${columns * 100}% ${rows * 100}%`;
            const bgPos = `${(colIndex / (columns - 1)) * 100}% ${(rowIndex / (rows - 1)) * 100}%`;

            return (
              <div 
                key={item.id} 
                data-slab-id={item.id}
                className="relative perspective-2000 group w-full h-full"
                style={{ cursor: !isRevealed ? 'pointer' : 'default', willChange: 'transform' }}
                onMouseEnter={() => reveal(item.id)}
                onClick={() => reveal(item.id)}
              >
                {item.type === 'real' ? (
                  // === 本物 ===
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative" 
                     onClick={(e) => { 
                        if (!isRevealed) { e.preventDefault(); reveal(item.id); } 
                     }}
                  >
                    <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
                      {/* バナー画像は「cover」で枠いっぱいに表示 */}
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
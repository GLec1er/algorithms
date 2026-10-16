const paths: Record<number, string> = {
  1: 'M3 8h17m-4-4 4 4-4 4M21 18H4m4-4-4 4 4 4',
  2: 'M9 3 7 21M17 3l-2 18M3 9h18M2 16h18',
  3: 'M8 12h8M4 8h4v8H4zM16 8h4v8h-4z',
  4: 'M3 7h14m-4-4 4 4-4 4M3 18h18m-4-4 4 4-4 4',
  5: 'M4 7v12h16V7M8 4h8v12H8zM1 10h3m16 0h3',
  6: 'M4 4h16M4 20h16M7 4l5 8 5-8M7 20l5-8 5 8',
  7: 'M5 3v18h14V3M8 7h8M8 12h8M8 17h8',
  8: 'M12 4 5 13m7-9 7 9M5 13l-3 7m3-7 4 7m10-7-4 7m4-7 3 7',
  9: 'M3 6h12M9 12h12M5 18h14M3 4v4m12-4v4m-6 2v4m12-4v4M5 16v4m14-4v4',
  10: 'M20 4H5l8 8-8 8h15',
  11: 'M12 3v5M5 13V8h14v5M5 13v4H2v4m3-4h3v4m11-8v4h-3v4m3-4h3v4',
  12: 'M4 3h4v5H4zM14 10h4v5h-4zM14 18h4v4h-4zM6 8v12h8M6 12h8',
  13: 'M5 5l14 2-8 13L5 5',
  14: 'M12 3v7m0 0-7 5m7-5 7 5M5 15v6m14-6v6M3 18l2 3 2-3m10 0 2 3 2-3',
  15: 'M3 3h18v18H3zM3 9h18M3 15h18M9 3v18M15 3v18',
  16: 'M3 19h5v-5h5V9h5V4h4m-4 0 4 4m0-4v8',
  17: 'M7 3v18m-4-4 4 4 4-4M17 21V3m-4 4 4-4 4 4',
  18: 'M3 6h6v12H3zM14 6h3v12m-3 0h6',
  19: 'M3 3v18h18M4 20 17 7m-8 14a5 5 0 0 0-5-5',
};

export function PatternGlyph({chapter}:{chapter:number}) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[chapter] ?? paths[1]}/></svg>;
}

export function PatternSigil({chapter}:{chapter:number}) {
  return <div className="pattern-sigil" aria-hidden="true">
    <svg className="sigil-circuit" viewBox="0 0 200 150" fill="none">
      <path className="circuit-guide" d="M0 75h35m130 0h35M100 0v23m0 104v23M0 25h38l20 20m84 60 20 20h38M12 125h27l19-20m84-60 20-20h26"/>
      <path className="circuit-main" d="M15 75h45m80 0h45M100 17v21m0 74v21"/>
      <path className="circuit-outline" d="m100 26 43 25v48l-43 25-43-25V51z"/>
      <path className="circuit-core" d="m100 38 32 18v37l-32 19-32-19V56z"/>
      <circle cx="15" cy="75" r="3"/><circle cx="185" cy="75" r="3"/><circle cx="100" cy="17" r="2"/><circle cx="100" cy="133" r="2"/>
    </svg>
    <span className="sigil-glyph"><PatternGlyph chapter={chapter}/></span>
    <span className="sigil-caption">PATTERN_{String(chapter).padStart(2,'0')}</span>
  </div>;
}

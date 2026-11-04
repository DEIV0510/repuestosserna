// Dibujos técnicos de cada repuesto (SVG de línea, 160×120). Esquemáticos y genéricos:
// ilustran el tipo de pieza, no un producto o referencia concreta.
// Clases: m metal · g caucho · f material de fricción · a acento (relleno azul)
//         s acento (trazo azul) · h agujero · t trazo fino · d discontinuo
export const DIBUJOS: Record<string, string> = {
  amortiguador: `
    <rect class="m" x="70" y="46" width="62" height="28"/>
    <rect class="a" x="92" y="46" width="16" height="28"/>
    <path class="t" d="M78 46v28M124 46v28"/>
    <rect class="m" x="38" y="57" width="32" height="6"/>
    <rect class="m" x="31" y="55" width="7" height="10"/>
    <circle class="m" cx="22" cy="60" r="9"/><circle class="h" cx="22" cy="60" r="4"/>
    <rect class="m" x="132" y="55" width="7" height="10"/>
    <circle class="m" cx="146" cy="60" r="8"/><circle class="h" cx="146" cy="60" r="3.5"/>`,

  // Hélice vista de lado: la mitad delantera de cada vuelta en trazo grueso y la trasera
  // punteada (x avanza con el giro; el seno inclina cada espira).
  espiral: `
    <rect class="m" x="14" y="28" width="8" height="64"/>
    <rect class="m" x="138" y="28" width="8" height="64"/>
    ${(() => {
      const vueltas = 7;
      const total = vueltas * 2 * Math.PI;
      const tramos: { frente: boolean; pts: string[] }[] = [];
      for (let i = 0; i <= 420; i++) {
        const t = (i / 420) * total;
        const x = 28 + (t / total) * 104 + 6 * Math.sin(t);
        const y = 60 - 27 * Math.cos(t);
        const frente = Math.sin(t) >= 0;
        const ultimo = tramos[tramos.length - 1];
        const p = `${x.toFixed(1)} ${y.toFixed(1)}`;
        if (!ultimo || ultimo.frente !== frente) tramos.push({ frente, pts: ultimo ? [ultimo.pts[ultimo.pts.length - 1], p] : [p] });
        else ultimo.pts.push(p);
      }
      return tramos.map((s) => `<path class="${s.frente ? 'grueso' : 't d'}" d="M${s.pts.join(' L')}"/>`).join('');
    })()}`,

  terminal: `
    <rect class="m" x="62" y="66" width="84" height="8"/>
    <path class="t" d="${Array.from({ length: 8 }, (_, i) => `M${112 + i * 4.4} 66l-3 8`).join('')}"/>
    <rect class="m" x="100" y="63" width="7" height="14"/>
    <path class="g" d="M38 58 Q48 48 58 58 Z"/>
    <path class="m" d="M42 56 L45 30 L51 30 L54 56 Z"/>
    <path class="t" d="M44.5 36h7M44 41h8M43.5 46h9"/>
    <rect class="a" x="40" y="22" width="16" height="8"/>
    <circle class="m" cx="48" cy="70" r="15"/><circle class="t" cx="48" cy="70" r="6"/>`,

  axial: `
    <rect class="m" x="50" y="57" width="94" height="6"/>
    <path class="t" d="${Array.from({ length: 7 }, (_, i) => `M${116 + i * 4} 57l-3 6`).join('')}"/>
    <rect class="a" x="104" y="52" width="8" height="16"/>
    <rect class="m" x="42" y="55" width="10" height="10"/>
    <polygon class="m" points="16,60 23,48 37,48 44,60 37,72 23,72"/>
    <circle class="t" cx="30" cy="60" r="6"/>`,

  tijera: `
    <path class="m" fill-rule="evenodd" d="M18 24 L126 52 L126 68 L18 96 Z M40 44 L100 60 L40 76 Z"/>
    <circle class="g" cx="22" cy="30" r="11"/><circle class="m" cx="22" cy="30" r="4.5"/>
    <circle class="g" cx="22" cy="90" r="11"/><circle class="m" cx="22" cy="90" r="4.5"/>
    <circle class="m" cx="130" cy="60" r="10"/><circle class="s" cx="130" cy="60" r="10"/>
    <path class="m" d="M139 55 L152 57 L152 63 L139 65 Z"/>`,

  rotula: `
    <rect class="m" x="38" y="78" width="84" height="9"/>
    <circle class="h" cx="50" cy="82.5" r="3"/><circle class="h" cx="110" cy="82.5" r="3"/>
    <path class="m" d="M56 78 Q56 56 80 56 Q104 56 104 78 Z"/>
    <path class="g" d="M66 58 L72 44 L88 44 L94 58 Z"/>
    <path class="m" d="M74 44 L76 22 L84 22 L86 44 Z"/>
    <path class="t" d="M75.5 27h9M75 32h10M74.6 37h10.8"/>
    <rect class="a" x="71" y="13" width="18" height="9"/>`,

  buje: `
    <path class="m2" d="M62 30 L108 30 A12 30 0 0 1 108 90 L62 90 Z"/>
    <circle class="m" cx="62" cy="60" r="30"/>
    <circle class="g" cx="62" cy="60" r="24"/>
    <circle class="a" cx="62" cy="60" r="10"/>
    <circle class="h" cx="62" cy="60" r="5"/>`,

  bieleta: `
    <rect class="m" x="40" y="56" width="80" height="8"/>
    <path class="m" d="M29 50 L31 28 L37 28 L39 50 Z"/><path class="t" d="M30.5 33h7M30 38h8M29.6 43h8.8"/>
    <rect class="a" x="26" y="20" width="16" height="8"/>
    <circle class="m" cx="34" cy="60" r="10"/><circle class="t" cx="34" cy="60" r="4"/>
    <path class="m" d="M121 70 L123 92 L129 92 L131 70 Z"/><path class="t" d="M122 77h8.6M122.4 82h8M122.8 87h7.4"/>
    <rect class="a" x="118" y="92" width="16" height="8"/>
    <circle class="m" cx="126" cy="60" r="10"/><circle class="t" cx="126" cy="60" r="4"/>`,

  pastillas: `
    <g transform="translate(10 12)">
      <path class="m" d="M26 40 Q80 22 134 40 L128 80 Q80 66 32 80 Z"/>
    </g>
    <path class="m" d="M26 40 Q80 22 134 40 L128 80 Q80 66 32 80 Z"/>
    <path class="f" d="M38 46 Q80 32 122 46 L117 74 Q80 62 43 74 Z"/>
    <path class="t" d="M80 39 V67"/>
    <path class="s" d="M130 52 l12 4 l-2 8"/>`,

  disco: `
    <circle class="m" cx="80" cy="60" r="48"/>
    <circle class="t" cx="80" cy="60" r="27"/>
    ${Array.from({ length: 12 }, (_, i) => {
      const a = (i * 30 * Math.PI) / 180;
      return `<circle class="h" cx="${(80 + 38 * Math.cos(a)).toFixed(1)}" cy="${(60 + 38 * Math.sin(a)).toFixed(1)}" r="1.8"/>`;
    }).join('')}
    <circle class="m2" cx="80" cy="60" r="22"/><circle class="s" cx="80" cy="60" r="22"/>
    ${Array.from({ length: 5 }, (_, i) => {
      const a = ((-90 + i * 72) * Math.PI) / 180;
      return `<circle class="h" cx="${(80 + 14 * Math.cos(a)).toFixed(1)}" cy="${(60 + 14 * Math.sin(a)).toFixed(1)}" r="2.6"/>`;
    }).join('')}
    <circle class="h" cx="80" cy="60" r="7"/>`,

  bandas: `
    <circle class="t d" cx="80" cy="60" r="52"/>
    <path class="m" d="M66 22.5 A40 40 0 0 0 66 97.5 L72 91 A32 32 0 0 1 72 29 Z"/>
    <path class="f" d="M64 18.9 A44 44 0 0 0 64 101.1 L66 97.5 A40 40 0 0 1 66 22.5 Z"/>
    <path class="m" d="M94 22.5 A40 40 0 0 1 94 97.5 L88 91 A32 32 0 0 0 88 29 Z"/>
    <path class="f" d="M96 18.9 A44 44 0 0 1 96 101.1 L94 97.5 A40 40 0 0 0 94 22.5 Z"/>
    <rect class="a" x="68" y="10" width="24" height="10"/>
    <path class="t" d="M72 36 l3 -4 l3 8 l3 -8 l3 8 l3 -8 l1 4"/>
    <path class="t" d="M72 86 l3 -4 l3 8 l3 -8 l3 8 l3 -8 l1 4"/>
    <rect class="m" x="72" y="72" width="16" height="5"/>`,

  campana: `
    <path class="m2" d="M66 18 L100 18 A16 42 0 0 1 100 102 L66 102 Z"/>
    <circle class="m" cx="66" cy="60" r="42"/>
    <circle class="s" cx="66" cy="60" r="36"/>
    <circle class="m2" cx="66" cy="60" r="18"/>
    <circle class="h" cx="66" cy="60" r="7"/>
    <circle class="h" cx="78" cy="60" r="2.5"/><circle class="h" cx="54" cy="60" r="2.5"/>
    <circle class="h" cx="66" cy="48" r="2.5"/><circle class="h" cx="66" cy="72" r="2.5"/>`,

  mordaza: `
    <circle class="m" cx="40" cy="132" r="100"/>
    <circle class="t" cx="40" cy="132" r="72"/>
    <g transform="rotate(40 104 52)">
      <rect class="m2" x="70" y="34" width="68" height="36" rx="5"/>
      <rect class="a" x="70" y="34" width="68" height="7"/>
      <circle class="m" cx="104" cy="56" r="10"/><circle class="t" cx="104" cy="56" r="5"/>
      <circle class="h" cx="78" cy="58" r="3"/><circle class="h" cx="130" cy="58" r="3"/>
      <rect class="m" x="96" y="70" width="8" height="8"/>
    </g>`,

  'bomba-freno': `
    <rect class="m" x="30" y="58" width="96" height="22"/>
    <path class="m" d="M126 58 L134 62 L134 76 L126 80 Z"/>
    <rect class="m" x="18" y="40" width="12" height="48"/>
    <circle class="h" cx="24" cy="48" r="3"/><circle class="h" cx="24" cy="80" r="3"/>
    <rect class="claro" x="48" y="26" width="56" height="32"/>
    <path class="t d" d="M54 38h44M54 48h44"/>
    <rect class="a" x="68" y="17" width="16" height="9"/>
    <rect class="m" x="86" y="80" width="8" height="10"/><rect class="m" x="106" y="80" width="8" height="10"/>`,

  filtros: `
    <path class="m" d="M22 34 Q22 26 30 26 L58 26 Q66 26 66 34 L66 92 L22 92 Z"/>
    <rect class="a" x="22" y="44" width="44" height="20"/>
    <path class="t" d="${Array.from({ length: 8 }, (_, i) => `M${26 + i * 5} 74v14`).join('')}"/>
    <rect class="m2" x="18" y="92" width="52" height="6"/>
    <rect class="m2" x="78" y="38" width="66" height="56"/>
    <path class="t" d="M83 44 ${Array.from({ length: 14 }, (_, i) => `l2 ${i % 2 ? -44 : 44}`).join(' ')}"/>`,

  correa: `
    <path class="correa" d="M40 50 L112 20 A16 16 0 0 1 128 36 L131 92 A11 11 0 0 1 120 103 L40 94 A22 22 0 0 1 40 50 Z"/>
    <circle class="m" cx="40" cy="72" r="20"/><circle class="t" cx="40" cy="72" r="13"/><circle class="m2" cx="40" cy="72" r="6"/>
    <circle class="m" cx="112" cy="36" r="14"/><circle class="t" cx="112" cy="36" r="8"/><circle class="h" cx="112" cy="36" r="3"/>
    <circle class="a" cx="120" cy="92" r="9"/><circle class="h" cx="120" cy="92" r="3"/>`,

  bujia: `
    <rect class="m" x="14" y="56" width="12" height="8"/>
    <rect class="m" x="26" y="53" width="6" height="14"/>
    <rect class="claro" x="32" y="47" width="52" height="26" rx="3"/>
    <path class="t" d="M40 49v22M47 49v22M54 49v22M61 49v22"/>
    <polygon class="m" points="84,48 88,42 100,42 104,48 104,72 100,78 88,78 84,72"/>
    <path class="t" d="M84 54h20M84 66h20"/>
    <rect class="a" x="104" y="50" width="5" height="20"/>
    <rect class="m" x="109" y="52" width="30" height="16"/>
    <path class="t" d="${Array.from({ length: 7 }, (_, i) => `M${113 + i * 4} 52l-3 16`).join('')}"/>
    <rect class="m" x="139" y="58" width="4" height="4"/>
    <path class="grueso" d="M139 52 H147 V58 H143"/>`,

  empaque: `
    <rect class="m" x="10" y="24" width="140" height="72" rx="4"/>
    <rect class="t d" x="16" y="30" width="128" height="60"/>
    ${[38, 66, 94, 122].map((x) => `<circle class="s" cx="${x}" cy="60" r="15"/><circle class="h" cx="${x}" cy="60" r="12.5"/>`).join('')}
    ${[24, 52, 80, 108, 136].map((x) => `<circle class="h" cx="${x}" cy="35" r="2.5"/><circle class="h" cx="${x}" cy="85" r="2.5"/>`).join('')}`,

  'bomba-agua': `
    <rect class="m" x="124" y="50" width="26" height="12"/><path class="t" d="M140 50v12"/>
    <path class="m" d="M40 30 L100 26 Q124 30 126 52 L128 86 Q110 98 86 96 L44 92 Q30 86 30 70 L30 42 Q32 32 40 30 Z"/>
    <circle class="h" cx="40" cy="39" r="3"/><circle class="h" cx="117" cy="40" r="3"/>
    <circle class="h" cx="118" cy="86" r="3"/><circle class="h" cx="42" cy="83" r="3"/>
    <circle class="m2" cx="78" cy="62" r="22"/><circle class="s" cx="78" cy="62" r="22"/>
    <circle class="m" cx="78" cy="62" r="9"/><circle class="h" cx="78" cy="62" r="3"/>
    <circle class="h" cx="78" cy="47" r="2.5"/><circle class="h" cx="93" cy="62" r="2.5"/>
    <circle class="h" cx="78" cy="77" r="2.5"/><circle class="h" cx="63" cy="62" r="2.5"/>`,

  soporte: `
    <rect class="m" x="20" y="82" width="120" height="10"/>
    <circle class="h" cx="30" cy="87" r="3"/><circle class="h" cx="130" cy="87" r="3"/>
    <path class="g" d="M44 82 Q37 65 48 48 L112 48 Q123 65 116 82 Z"/>
    <path class="t" d="M58 54 Q54 65 58 76M102 54 Q106 65 102 76"/>
    <rect class="m" x="50" y="38" width="60" height="10"/>
    <rect class="m" x="75" y="14" width="10" height="24"/>
    <path class="t" d="M75 18h10M75 22h10"/>
    <rect class="a" x="70" y="26" width="20" height="8"/>`,
};

function forEachCodePoint(
  s: string,
  f: (index: number, len: number, c: number) => void
) {
  let i = 0;
  while (i < s.length) {
    let c = s.codePointAt(i)!;
    let len = c >= 0x10000 ? 2 : 1;
    f(i, len, c);
    i += len;
  }
}

function isCodePointIdeographic(c: number): boolean {
  return (
    (c >= 0x3400 && c <= 0x4dbf) ||
    (c >= 0x4e00 && c <= 0x9fff) ||
    (c >= 0xf900 && c <= 0xfaff) ||
    (c >= 0x20000 && c <= 0x2a6df) ||
    (c >= 0x2a700 && c <= 0x2b73f) ||
    (c >= 0x2b740 && c <= 0x2b81f) ||
    (c >= 0x2b820 && c <= 0x2ceaf) ||
    (c >= 0x2ceb0 && c <= 0x2ebef) ||
    (c >= 0x2f800 && c <= 0x2fa1f) ||
    (c >= 0x30000 && c <= 0x3134f) ||
    c == 0x3005 /* 々 */ ||
    c == 0x3007 /* 〇 */ ||
    c == 0x30fb /* ・ */
  );
}

function isCodePointProhibited(c: number): boolean {
  return (
    c <= 0x20 ||
    (c >= 0x41 /* A */ && c <= 0x5a) /* Z */ ||
    (c >= 0x61 /* a */ && c <= 0x7a) /* z */ ||
    (c >= 0xff21 /* Ａ */ && c <= 0xff3a) /* Ｚ */ ||
    (c >= 0xff41 /* ａ */ && c <= 0xff5a) /* ｚ */ ||
    /* U+3000: Ideographic Space "　".
           U+0304: Combining Macron "◌̄". */
    "\u3000/\\／＼ĀĪŪĒŌāīūēō\u0304".includes(String.fromCodePoint(c))
  );
}

export { forEachCodePoint, isCodePointProhibited, isCodePointIdeographic };

import {
  forEachCodePoint,
  isCodePointIdeographic,
  isCodePointProhibited,
} from "./codepoint";
import { translate } from "./google-translate";

const HIRAGANA_START = 0x3041;
const HIRAGANA_END = 0x3094;
const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f4;
const HIRA_KATA_OFFSET = KATAKANA_START - HIRAGANA_START;
const ROMAJI = [
  "~a",
  "a",
  "~i",
  "i",
  "~u",
  "u",
  "~e",
  "e",
  "~o",
  "o",
  "ka",
  "ga",
  "ki",
  "gi",
  "ku",
  "gu",
  "ke",
  "ge",
  "ko",
  "go",
  "sa",
  "za",
  "shi",
  "ji",
  "su",
  "zu",
  "se",
  "ze",
  "so",
  "zo",
  "ta",
  "da",
  "chi",
  "dji",
  "~tsu",
  "tsu",
  "dzu",
  "te",
  "de",
  "to",
  "do",
  "na",
  "ni",
  "nu",
  "ne",
  "no",
  "ha",
  "ba",
  "pa",
  "hi",
  "bi",
  "pi",
  "fu",
  "bu",
  "pu",
  "he",
  "be",
  "pe",
  "ho",
  "bo",
  "po",
  "ma",
  "mi",
  "mu",
  "me",
  "mo",
  "~ya",
  "ya",
  "~yu",
  "yu",
  "~yo",
  "yo",
  "ra",
  "ri",
  "ru",
  "re",
  "ro",
  "~wa",
  "wa",
  "wi",
  "we",
  "wo",
  "n",
  "vu",
];
const VA_LINE_START = 0x30f7;
const VA_LINE_END = 0x30fa;
const VA_LINE = ["va", "vi", "ve", "vo"];
const ROMAJI_TO_KANA = new Map<string, string>();

ROMAJI.forEach((v, i) => {
  ROMAJI_TO_KANA.set(v, String.fromCharCode(HIRAGANA_START + i));
});
VA_LINE.forEach((v, i) => {
  ROMAJI_TO_KANA.set(v, String.fromCharCode(VA_LINE_START + i));
});

function notateKana(
  line: string,
  kana: string,
  regex: string,
  indexes: number[]
): string | null {
  let len = indexes.length;
  if (len == 0) return line;

  let values = kana.match(regex);
  if (values == null) return null;
  let out = "";
  let last = 0;
  for (let i = 0; i < len; i++) {
    let cur = indexes[i];
    let res = values[i + 1].trim();
    out += line.substring(last, cur);
    if (res.length != 0) {
      if (res.indexOf("/") >= 0) res = '<span style="color: red">ERROR<span>';
      out += `(<b>${res}</b>)`;
    }
    last = cur;
  }
  out += line.substring(last, line.length);
  return out;
}

function romajiToKana(romaji: string): string {
  const re_syllable =
    /n(?![yaiueoāīūēō])|[wrtypsdfghjkzcvbnm~]*[aiueoāīūēō]|\b \b| ?\u0304/g;

  let out = "";
  let lastEnd = 0;
  let arr;
  while ((arr = re_syllable.exec(romaji)) != null) {
    let diff = re_syllable.lastIndex - arr[0].length - lastEnd;
    let c = romaji[lastEnd];
    if (diff == 1 && c == " ") {
      out += " ";
    } else if (
      diff != 0 &&
      !(lastEnd != 0 && diff == 1 && (c == "'" || c == "-"))
    ) {
      out += "/";
    }
    lastEnd = re_syllable.lastIndex;
    let syllable = arr[0];
    let len = syllable.length;
    if (syllable == " ") {
      out += " ";
      continue;
    } else if (syllable[len - 1] == "\u0304") {
      out += "ー";
      continue;
    }
    if (len > 2) {
      let c0 = syllable[0];
      let c1 = syllable[1];
      if (c0 == c1 || (c0 == "t" && c1 == "c")) {
        syllable = syllable.substring(1);
        len--;
        out += "っ";
      }
    }
    let last = syllable[len - 1];
    let i = "āīūēō".indexOf(last);
    if (i >= 0) {
      syllable = syllable.substring(0, len - 1) + "aiueo"[i];
      out += romajiSyllableToKana(syllable);
      out += "あいうえう"[i];
    } else {
      out += romajiSyllableToKana(syllable);
    }
  }
  if (lastEnd != romaji.length) out += "/";
  return out;
}

const YOUON_1 = /^[kgnhbpmr]y[aueo]$/;
const YOUON_2 = /^(?:sh|j|ch|dj)[aueo]$/;
const YOUON_3 = /^f[aieo]$/;

function romajiSyllableToKana(s: string): string {
  let out = "";
  let kana = ROMAJI_TO_KANA.get(s);
  if (kana != undefined) {
    out += kana;
  } else if (YOUON_1.test(s)) {
    out += ROMAJI_TO_KANA.get(s[0] + "i");
    let c = s[2];
    out += c == "e" ? "ぇ" : ROMAJI_TO_KANA.get("~y" + c);
  } else if (YOUON_2.test(s)) {
    out += ROMAJI_TO_KANA.get(s.substring(0, s.length - 1) + "i");
    let c = s[s.length - 1];
    out += c == "e" ? "ぇ" : ROMAJI_TO_KANA.get("~y" + c);
  } else if (YOUON_3.test(s)) {
    out += "ふ";
    out += ROMAJI_TO_KANA.get("~" + s[1]);
  } else if (s == "ti") {
    out += "てぃ";
  } else if (s == "di") {
    out += "でぃ";
  } else {
    console.error("No such kana: " + s);
  }
  return out;
}

function jaToRegex(s: string, indexes: number[]): string {
  let out = "^";
  let len = s.length;
  let last = 0;
  let flag = -1; // -2 for dummy, -1 for kana, >=0 for kanji
  forEachCodePoint(s, (i, clen, c) => {
    let cs = String.fromCodePoint(c);
    let vaLine = isInVaLine(c);
    let kata = vaLine || isKatakana(c);
    let hira = isHiragana(c);
    if (!kata && !hira && cs != "ー") {
      if (!isCodePointIdeographic(c)) {
        if (flag > 0) {
          out += kanjiGroup(flag);
          indexes.push(i);
        }
        if (flag != -2) {
          out += "/ ?";
          flag = -2;
        }
      } else {
        if (flag < 0) flag = 0;
        if (cs != "・") flag++;
      }
    } else {
      if (flag > 0) {
        out += kanjiGroup(flag);
        indexes.push(i);
      }
      if (kata) {
        switch (cs) {
          case "オ":
            out += "[おう]";
            break;
          case "ァ":
          case "ィ":
          case "ゥ":
          case "ェ":
          case "ォ":
            let ck = c - HIRA_KATA_OFFSET;
            out += String.fromCharCode(0x5b /* [ */, ck, ck + 1, 0x5d /* ] */);
            break;
          default:
            out += String.fromCharCode(vaLine ? c : c - HIRA_KATA_OFFSET);
        }
      } else if (cs == "ー") {
        if (isKatakana(last)) {
          let r = ROMAJI[last - KATAKANA_START];
          out += "あいうえう"["aiueo".indexOf(r[r.length - 1])];
        } else if (isInVaLine(last)) {
          out += "あいえう"[last - VA_LINE_START];
        } else {
          out += "ー";
        }
      } else {
        switch (cs) {
          case "お":
            out += "[おう]";
            break;
          case "は":
            out += "[はわ]";
            break;
          case "へ":
            out += "[へえ]";
            break;
          case "を":
            out += "[をお]";
            break;
          case "ぁ":
          case "ぃ":
          case "ぅ":
          case "ぇ":
          case "ぉ":
            out += String.fromCharCode(0x5b /* [ */, c, c + 1, 0x5d /* ] */);
            break;
          default:
            out += s.substring(i, i + clen);
        }
      }

      last = c;
      flag = -1;
      out += " ?";
    }
  });
  if (flag > 0) {
    out += kanjiGroup(flag);
    indexes.push(len);
  }
  return out + "$";
}

function kanjiGroup(count: number): string {
  let max = count * 6;
  return `(.{${count},${max}}? |.{${count},${max}}?)`;
}

function isHiragana(c: number): boolean {
  return c >= HIRAGANA_START && c <= HIRAGANA_END;
}

function isKatakana(c: number): boolean {
  return c >= KATAKANA_START && c <= KATAKANA_END;
}

function isInVaLine(c: number): boolean {
  return c >= VA_LINE_START && c <= VA_LINE_END;
}

function merge(s: string, lines: string[]): string {
  let out = "";
  let last = 0;
  for (let i = 0; i <= s.length; i++) {
    if (i == s.length || s[i] == "\n") {
      if (last == i) {
        last = i + 1;
        continue;
      }
      let line = s.substring(last, i).trim();
      if (line.length == 0) {
        last = i + 1;
        continue;
      }
      lines.push(line);
      out += mergeLine(line);
      if (i != s.length) out += "\\";
      last = i + 1;
    }
  }
  return out;
}

function mergeLine(s: string): string {
  let out: string | null = null;
  let lastPermitted = true;
  forEachCodePoint(s, (i, len, c) => {
    if (!isCodePointProhibited(c)) {
      if (out != null) {
        if (!lastPermitted) out += "/";
        out += s.substring(i, i + len);
        lastPermitted = true;
      }
    } else {
      if (out == null) out = s.substring(0, i);
      lastPermitted = false;
    }
  });
  // FIXME: Figure out why type inference goes wrong here.
  if (!lastPermitted) (out as any) += "/";
  if (out != null) {
    return out;
  } else {
    return s;
  }
}

export async function notate(
  text: string,
  signal: AbortController
): Promise<NotatedLine[]> {
  let lines: string[] = [];
  let merged = merge(text, lines);
  if (merged.length == 0) {
    throw "Empty text";
  }
  if (merged.length > 5000) {
    throw "Merged text length > 5000";
  }
  return translate(merged, signal).then((res) => {
    let resLines = res.split("\\");
    let notatedLines = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      let romaji = trimAny(resLines[i], " -").toLowerCase();
      let kana = romajiToKana(romaji);
      let indexes: number[] = [];
      let regex = jaToRegex(line, indexes);
      let kanaNotated: string | null;
      try {
        kanaNotated = notateKana(line, kana, regex, indexes);
      } catch (e) {
        throw "Stack overflow due to massive line, consider splitting it";
      }
      notatedLines.push(new NotatedLine(line, romaji, kanaNotated));
    }
    return notatedLines;
  });
}

function trimAny(str: string, chars: string) {
  let start = 0,
    end = str.length;

  while (start < end && chars.indexOf(str[start]) >= 0) ++start;

  while (end > start && chars.indexOf(str[end - 1]) >= 0) --end;

  return start > 0 || end < str.length ? str.substring(start, end) : str;
}

export function lineToHtml(line: NotatedLine): string {
  let kanaNotated =
    line.kanaNotated != null
      ? line.kanaNotated
      : `<span style=\"color: red\">${line.origin}</span>`;
  return `<p>${kanaNotated}<br/>${line.romaji}</p>`;
}

class NotatedLine {
  origin: string;
  romaji: string;
  kanaNotated: string | null;

  constructor(origin: string, romaji: string, kanaNotated: string | null) {
    this.origin = origin;
    this.romaji = romaji;
    this.kanaNotated = kanaNotated;
  }
}

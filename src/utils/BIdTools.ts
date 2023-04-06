const table = [..."fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF"];
const s = [11, 10, 3, 8, 4, 6];
const xor = 177451812;
const add = 8728348608;

export const av2bv = (av: string | number) => {
  let num: string | number = NaN;
  if (Object.prototype.toString.call(av) === "[object Number]") {
    num = av;
  } else if (Object.prototype.toString.call(av) === "[object String]") {
    // eslint-disable-next-line radix
    num = parseInt((av as string).replace(/[^0-9]/gu, ""));
  }

  num = ((num as number) ^ xor) + add;
  const result = [..."BV1  4 1 7  "];
  let i = 0;
  while (i < 6) {
    result[s[i]] = table[Math.floor(num / 58 ** i) % 58];
    i += 1;
  }
  return result.join("");
};

export const bv2av = (bv: string) => {
  const str = bv;

  let result = 0;
  let i = 0;
  while (i < 6) {
    result += table.indexOf(str[s[i]]) * 58 ** i;
    i += 1;
  }
  const re = (result - add) ^ xor;
  if (re > 0) {
    return `av${(result - add) ^ xor}`;
  }
  return "av0";
};

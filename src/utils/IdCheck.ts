function isBV(id: string): boolean {
  return !!id.match(
    /^[bB][vV][fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF]{10}/g
  );
}

function isAV(id: string): boolean {
  return /^av[0-9]+$/.test(id);
}

function isEP(id: string): boolean {
  return /^ep[0-9]+$/.test(id);
}

function isSS(id: string): boolean {
  return /^ss[0-9]+$/.test(id);
}

function isVideo(id: string): boolean {
  return isBV(id) || isAV(id);
}

function isBangumi(id: string): boolean {
  return isEP(id) || isSS(id);
}

function isValid(id: string): boolean {
  return isEP(id) || isSS(id) || isAV(id) || isBV(id);
}

export { isAV, isBV, isEP, isBangumi, isValid, isVideo };

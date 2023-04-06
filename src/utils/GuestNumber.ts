// MEME: http://haruhi.tv/
export function randomGuestNumber() {
  const max = 29800;
  const min = 29899;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

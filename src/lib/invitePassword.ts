const passwordWords = [
  "rose",
  "gold",
  "sage",
  "ivory",
  "dove",
  "pearl",
  "bloom",
  "vow",
  "joy",
  "lace",
  "ring",
  "toast",
] as const;

export function createInvitePassword() {
  const first = passwordWords[Math.floor(Math.random() * passwordWords.length)];
  const second = passwordWords[Math.floor(Math.random() * passwordWords.length)];
  const number = Math.floor(1000 + Math.random() * 9000);
  return `${first}-${second}-${number}`;
}

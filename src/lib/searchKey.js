// Lowercase, accent-free form for unit search: "Nøkken" -> "nokken". NFD
// splits most accents off as combining marks; letters like ø and æ don't
// decompose, so map them by hand.
const LETTER_FOLDS = {ø: 'o', æ: 'ae', œ: 'oe', ß: 'ss', đ: 'd', ł: 'l', þ: 'th'};
export function searchKey(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[øæœßđłþ]/g, (c) => LETTER_FOLDS[c]);
}

export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "") // 모든 언어의 문자·숫자·공백·하이픈만 유지
    .replace(/[\s-]+/g, "-") // 공백/하이픈 연속 → 단일 하이픈
    .replace(/^-+|-+$/g, ""); // 양쪽 하이픈 제거
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

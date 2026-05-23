// 휴대폰 번호 자동 포맷 — 입력 도중 부분 포맷도 지원 (controlled input용)
// "01012345678"  → "010-1234-5678"
// "0101234"      → "010-1234"
// "010"          → "010"
// 11자리 초과는 잘라내고, 숫자 외 문자는 제거
export function formatPhone(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 11);

  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

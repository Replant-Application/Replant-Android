/**
 * 레벨별 경험치 테이블 (백엔드 Reant.java와 동일)
 * L1→2: 10, L2→3: 50, L3→4: 100, L4→5: 200, L5→6: 500, L6+: 500
 */
const NEXT_LEVEL_EXP: Record<number, number> = {
  1: 10,
  2: 50,
  3: 100,
  4: 200,
  5: 500,
};

/** 해당 레벨에서 다음 레벨로 올라가는데 필요한 경험치 */
export function getNextLevelExp(level: number): number {
  return NEXT_LEVEL_EXP[level] ?? 500;
}

/** 해당 레벨에 도달하기 위해 필요한 총 누적 경험치 (레벨 1 시작 기준) */
export function getTotalExpToReachLevel(level: number): number {
  if (level <= 1) return 0;
  let total = 0;
  for (let i = 1; i < level; i++) {
    total += getNextLevelExp(i);
  }
  return total;
}

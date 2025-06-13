// js/index/modules/utils.js

export function fmtTime(minutes, suffix) {
  if (minutes < 60) return `${minutes}분 ${suffix}`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}시간 ${suffix}` : `${h}시간 ${m}분 ${suffix}`;
}

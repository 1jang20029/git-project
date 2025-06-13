// js/index/modules/api.js

export async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} fetch failed`);
  return res.json();
}

export function loadStats(renderFn) {
  getJSON('/api/stats')
    .then(renderFn)
    .catch(() => renderFn({ totalBuildings:0, totalStudents:0, activeServices:0, todayEvents:0 }));
}

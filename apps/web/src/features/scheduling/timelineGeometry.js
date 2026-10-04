export const TIMELINE_START = 360;
export const TIMELINE_END = 1440;
export const COLLAPSED_HOUR_HEIGHT = 72;
export const EXPANDED_HOUR_HEIGHT = 240;
export const hourHeight = (hour, expanded) => hour === expanded ? EXPANDED_HOUR_HEIGHT : COLLAPSED_HOUR_HEIGHT;
export function minuteToY(minute, expanded) {
  const value = Math.max(TIMELINE_START, Math.min(TIMELINE_END, minute)) - TIMELINE_START;
  const hour = Math.min(17, Math.floor(value / 60));
  let top = 0;
  for (let i = 0; i < hour; i++) top += hourHeight(i, expanded);
  return top + (value - hour * 60) / 60 * hourHeight(hour, expanded);
}
export function yToMinute(y, expanded) {
  let top = 0;
  for (let i = 0; i < 18; i++) {
    const height = hourHeight(i, expanded);
    if (y <= top + height) return TIMELINE_START + i * 60 + Math.max(0, (y - top) / height) * 60;
    top += height;
  }
  return TIMELINE_END;
}
export const minuteSnap = (minute, expanded) => Math.round(minute / (Math.floor((minute - TIMELINE_START) / 60) === expanded ? 5 : 10)) * (Math.floor((minute - TIMELINE_START) / 60) === expanded ? 5 : 10);

// Separate rendered collisions, including the minimum height of short ranges.
// Times and records are preserved; lanes are presentation metadata only.
export function layoutDayBlocks(blocks, expanded) {
  const result = [...blocks].sort((a, b) => a.start - b.start || a.end - b.end || a.id.localeCompare(b.id))
    .map((block) => ({ ...block, layout: { top: minuteToY(block.start, expanded),
      height: Math.max(28, minuteToY(block.end, expanded) - minuteToY(block.start, expanded)) } }));
  let group = [];
  let laneEnds = [];
  let groupEnd = -Infinity;
  const finishGroup = () => group.forEach((block) => { block.layout.laneCount = laneEnds.length; });
  for (const block of result) {
    if (block.layout.top >= groupEnd) {
      finishGroup();
      group = [];
      laneEnds = [];
    }
    let lane = laneEnds.findIndex((end) => end <= block.layout.top);
    if (lane === -1) lane = laneEnds.length;
    block.layout.lane = lane;
    laneEnds[lane] = block.layout.top + block.layout.height;
    group.push(block);
    groupEnd = Math.max(...laneEnds);
  }
  finishGroup();
  return result;
}

// ============================================================
// 社区分享码：把计划 + 完成进度压缩成一段可粘贴的码
// 本地编码/解码，不联网；广场由 GitHub Discussions 承载
// ============================================================

import LZString from 'lz-string';
import type { Plan, CheckMap } from './store';

export interface ShareStats {
  daysElapsed: number;     // 已进行天数
  totalChecks: number;     // 累计打卡数
  currentDay: number;      // 当前第几天
  currentWeekTheme?: string;
  currentPhase?: string;
  pct: number;             // 已打卡占应打卡比例（近似）
}

export interface SharePayload {
  v: 1;
  author: string;
  sharedAt: number;
  plan: Plan;
  stats: ShareStats;
}

/** 计算计划进度快照 */
export function computeStats(plan: Plan, checks: CheckMap): ShareStats {
  const start = new Date(plan.startDate + 'T00:00:00');
  const now = new Date();
  const currentDay = Math.max(1, Math.min(plan.totalDays, Math.floor((now.getTime() - start.getTime()) / 86400000) + 1));
  const planChecks = checks[plan.id] ?? {};
  let totalChecks = 0;
  Object.values(planChecks).forEach((day) => {
    Object.values(day).forEach((v) => { if (v) totalChecks += 1; });
  });
  const daysElapsed = Math.min(plan.totalDays, currentDay);
  const expected = daysElapsed * 12; // 每天约 12 个任务
  const week = plan.framework.weeks?.find((w) => currentDay >= w.startDay && currentDay <= w.endDay);
  const phase = plan.framework.phases.find((p) => currentDay >= p.startDay && currentDay <= p.endDay);
  return {
    daysElapsed,
    totalChecks,
    currentDay,
    currentWeekTheme: week?.theme,
    currentPhase: phase?.name,
    pct: Math.min(100, Math.round((totalChecks / Math.max(1, expected)) * 100)),
  };
}

export function encodeShare(author: string, plan: Plan, stats: ShareStats): string {
  const payload: SharePayload = { v: 1, author: author.trim() || '匿名实践者', sharedAt: Date.now(), plan, stats };
  return 'PM1.' + LZString.compressToEncodedURIComponent(JSON.stringify(payload));
}

export function decodeShare(code: string): SharePayload | null {
  try {
    const trimmed = code.trim();
    if (!trimmed.startsWith('PM1.')) return null;
    const json = LZString.decompressFromEncodedURIComponent(trimmed.slice(4));
    if (!json) return null;
    const payload = JSON.parse(json) as SharePayload;
    if (payload.v !== 1 || !payload.plan?.framework) return null;
    return payload;
  } catch {
    return null;
  }
}

// 社区墙（本地存储）
export interface CommunityEntry {
  id: string;
  importedAt: number;
  payload: SharePayload;
}

const WALL_KEY = 'pm.community.v1';

export function loadWall(): CommunityEntry[] {
  try {
    return JSON.parse(localStorage.getItem(WALL_KEY) ?? '[]') as CommunityEntry[];
  } catch {
    return [];
  }
}

export function saveWall(entries: CommunityEntry[]): void {
  localStorage.setItem(WALL_KEY, JSON.stringify(entries));
}

/** 分享文案模板：发 GitHub Discussions / 群聊 */
export function shareText(payload: SharePayload, code: string): string {
  const p = payload.plan;
  const name = p.customLabel ?? p.domainKey;
  return [
    `【模式-模型行动系统 · 计划分享】`,
    `领域：${name} · ${p.totalDays} 天计划`,
    p.goal ? `目标：${p.goal}` : '',
    `进度：第 ${payload.stats.currentDay}/${p.totalDays} 天 · 打卡率约 ${payload.stats.pct}%`,
    payload.stats.currentWeekTheme ? `当前周主题：${payload.stats.currentWeekTheme}` : '',
    ``,
    `分享码（在应用的「社区」页粘贴即可查看/克隆）：`,
    code,
  ].filter(Boolean).join('\n');
}

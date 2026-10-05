// ============================================================
// Pattern-Model Theory (模式-模型理论) v1.0 — 领域迁移编译引擎
// 将理论原语编译到任意用户输入的领域，生成按时间/周期的行动框架
// v2: 每个领域内置 12 周详细行动纲领，按周期长度自动缩放；
//     支持"当前基础"与"每日可投入时间"个性化参数
// ============================================================

export type Level = 'beginner' | 'intermediate' | 'advanced';

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: '零基础入门',
  intermediate: '有一定基础',
  advanced: '进阶突破',
};

export interface WeekEntry {
  theme: string;        // 本周主题
  tasks: string[];      // 本周具体行动（3 条，可执行、可检验）
  milestone: string;    // 本周末里程碑（可验收的产出）
}

export interface DomainProfile {
  key: string;
  label: string;
  predictionUnit: string;   // 预测单元
  exposure: string;         // 暴露方式
  errorSignal: string;      // 误差信号
  holdHours: [number, number]; // 误差持有期（小时）
  holdLabel: string;
  experiment: string;       // 实验方式
  forbidden: string;        // 禁忌动作
  immersion: string;        // 浸泡/重复方式
  templates: string;        // 模板化演练
  envOffload: string;       // 环境/认知卸载
  weeks: WeekEntry[];       // 12 周标准行动纲领
  beginnerTip: string;      // 零基础额外提示
  advancedTip: string;      // 进阶额外提示
  criteria?: string[];      // 可选验收标准（用于把模糊目标具体化）
}

/** 检测目标是否模糊：无数字且含"学完/掌握/了解"等不可测量的词，或过短 */
export function isVagueGoal(goal: string): boolean {
  const g = goal.trim();
  if (!g) return false;
  if (/\d/.test(g)) return false;
  if (g.length <= 6) return true;
  return /学会|学完|掌握|学好|了解|提升|提高|搞懂|入门|精通|熟悉|搞明白|弄懂/.test(g);
}

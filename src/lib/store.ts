import { useCallback, useEffect, useState } from 'react';
import type { Framework, Level } from './theory';

export interface Plan {
  id: string;
  domainKey: string;
  customLabel?: string;
  goal: string;
  totalDays: number;
  startDate: string; // YYYY-MM-DD
  createdAt: number;
  framework: Framework;
  level?: Level;
  hoursPerDay?: number;
  materials?: string[];
  materialVerb?: string;
}

// checks[planId][dateStr][taskId] = true
export type CheckMap = Record<string, Record<string, Record<string, boolean>>>;

const PLANS_KEY = 'pm.plans.v1';
const CHECKS_KEY = 'pm.checks.v1';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>(() => load(PLANS_KEY, []));
  const [checks, setChecks] = useState<CheckMap>(() => load(CHECKS_KEY, {}));

  useEffect(() => { localStorage.setItem(PLANS_KEY, JSON.stringify(plans)); }, [plans]);
  useEffect(() => { localStorage.setItem(CHECKS_KEY, JSON.stringify(checks)); }, [checks]);

  const addPlan = useCallback((plan: Plan) => setPlans((ps) => [...ps, plan]), []);
  const removePlan = useCallback((id: string) => {
    setPlans((ps) => ps.filter((p) => p.id !== id));
    setChecks((c) => { const n = { ...c }; delete n[id]; return n; });
  }, []);

  const toggleCheck = useCallback((planId: string, date: string, taskId: string) => {
    setChecks((c) => {
      const plan = { ...(c[planId] ?? {}) };
      const day = { ...(plan[date] ?? {}) };
      day[taskId] = !day[taskId];
      plan[date] = day;
      return { ...c, [planId]: plan };
    });
  }, []);

  return { plans, checks, addPlan, removePlan, toggleCheck };
}

export function todayStr(d = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Users, Share2, ClipboardCopy, Import, Trash2, GitBranch, Rocket, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { getProfile } from '@/lib/theory';
import type { Plan, CheckMap } from '@/lib/store';
import { todayStr, uid } from '@/lib/store';
import { computeStats, encodeShare, decodeShare, shareText, loadWall, saveWall } from '@/lib/share';
import type { SharePayload, CommunityEntry } from '@/lib/share';

const DISCUSSIONS_URL = 'https://github.com/jyqfklr/pattern-model-app/discussions';

interface Props {
  plans: Plan[];
  checks: CheckMap;
  addPlan: (p: Plan) => void;
}

export default function CommunityView({ plans, checks, addPlan }: Props) {
  const [nickname, setNickname] = useState(() => localStorage.getItem('pm.nickname') ?? '');
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? '');
  const [codeOut, setCodeOut] = useState('');
  const [codeIn, setCodeIn] = useState('');
  const [wall, setWall] = useState<CommunityEntry[]>(() => loadWall());

  const selectedPlan = plans.find((p) => p.id === selectedPlanId) ?? plans[0];
  const decoded: SharePayload | null = useMemo(() => (codeIn.trim() ? decodeShare(codeIn) : null), [codeIn]);
  const codeInvalid = codeIn.trim().length > 0 && !decoded;

  const copy = async (text: string, what: string) => {
    await navigator.clipboard.writeText(text);
    toast.success(`${what}已复制到剪贴板`);
  };

  const generate = () => {
    if (!selectedPlan) return;
    localStorage.setItem('pm.nickname', nickname);
    const stats = computeStats(selectedPlan, checks);
    setCodeOut(encodeShare(nickname, selectedPlan, stats));
  };

  const importToWall = () => {
    if (!decoded) return;
    const entry: CommunityEntry = { id: uid(), importedAt: Date.now(), payload: decoded };
    const next = [entry, ...wall];
    setWall(next);
    saveWall(next);
    setCodeIn('');
    toast.success('已保存到社区墙');
  };

  const clonePlan = (payload: SharePayload) => {
    const cloned: Plan = {
      ...payload.plan,
      id: uid(),
      startDate: todayStr(),
      createdAt: Date.now(),
    };
    addPlan(cloned);
    toast.success('已克隆为我的计划', { description: '从今天开始计算第 1 天，可在「每日日程」中打卡。' });
  };

  const removeEntry = (id: string) => {
    const next = wall.filter((e) => e.id !== id);
    setWall(next);
    saveWall(next);
  };

  return (
    <div className="space-y-6">
      {/* 说明 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> 社区 · 分享计划与进度</CardTitle>
          <CardDescription>
            分享码包含你的完整计划框架与当前进度快照，全程本地编码、不上传任何服务器。
            把分享码发到 <a href={DISCUSSIONS_URL} target="_blank" rel="noreferrer" className="text-primary underline">GitHub Discussions 社区广场</a> 或任何群聊，他人粘贴即可查看并克隆。
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* 分享我的计划 */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Share2 className="h-4 w-4" /> 分享我的计划</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nick">我的昵称</Label>
              <Input id="nick" placeholder="匿名实践者" value={nickname} onChange={(e) => setNickname(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>选择要分享的计划</Label>
              {plans.length === 0 ? (
                <p className="text-sm text-muted-foreground">还没有计划，请先在「领域迁移」界面创建。</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {plans.map((p) => {
                    const name = p.customLabel || getProfile(p.domainKey).label;
                    return (
                      <Button key={p.id} size="sm" variant={(selectedPlan?.id === p.id) ? 'default' : 'outline'}
                        onClick={() => setSelectedPlanId(p.id)}>
                        {name} · {p.totalDays} 天
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
            {selectedPlan && (
              <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-1">
                {(() => {
                  const s = computeStats(selectedPlan, checks);
                  return (<>
                    <div>进度快照：第 {s.currentDay}/{selectedPlan.totalDays} 天 · 累计打卡 {s.totalChecks} 次 · 打卡率约 {s.pct}%</div>
                    {s.currentPhase && <div className="text-muted-foreground">当前阶段：{s.currentPhase}{s.currentWeekTheme ? ` · 本周：${s.currentWeekTheme}` : ''}</div>}
                  </>);
                })()}
              </div>
            )}
            <Button onClick={generate} disabled={!selectedPlan} className="w-full sm:w-auto">
              <Share2 className="mr-2 h-4 w-4" /> 生成分享码
            </Button>
            {codeOut && (
              <div className="space-y-2">
                <Textarea readOnly rows={4} value={codeOut} className="font-mono text-xs" />
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => copy(codeOut, '分享码')}>
                    <ClipboardCopy className="mr-2 h-4 w-4" /> 复制分享码
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => {
                    const payload = decodeShare(codeOut);
                    if (payload) copy(shareText(payload, codeOut), '分享文案');
                  }}>
                    <ClipboardCopy className="mr-2 h-4 w-4" /> 复制完整分享文案
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => window.open(DISCUSSIONS_URL, '_blank')}>
                    <GitBranch className="mr-2 h-4 w-4" /> 去社区广场发布
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 导入他人分享 */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Import className="h-4 w-4" /> 导入他人的分享</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea rows={4} placeholder="粘贴以 PM1. 开头的分享码…" value={codeIn}
              onChange={(e) => setCodeIn(e.target.value)} className="font-mono text-xs" />
            {codeInvalid && <p className="text-sm text-destructive">分享码无效或已损坏，请检查后重试。</p>}
            {decoded && (
              <ShareCard payload={decoded}>
                <Button size="sm" onClick={importToWall}><Import className="mr-2 h-4 w-4" /> 保存到社区墙</Button>
                <Button size="sm" variant="secondary" onClick={() => clonePlan(decoded)}><RotateCcw className="mr-2 h-4 w-4" /> 克隆为我的计划</Button>
              </ShareCard>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 社区墙 */}
      {wall.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">社区墙（{wall.length}）—— 我收藏的分享</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {wall.map((e) => (
              <div key={e.id} className="relative">
                <ShareCard payload={e.payload}>
                  <Button size="sm" variant="secondary" onClick={() => clonePlan(e.payload)}>
                    <Rocket className="mr-2 h-4 w-4" /> 克隆为我的计划
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => removeEntry(e.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </ShareCard>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ShareCard({ payload, children }: { payload: SharePayload; children?: React.ReactNode }) {
  const p = payload.plan;
  const name = p.customLabel || getProfile(p.domainKey).label;
  const s = payload.stats;
  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="font-medium">{name} · {p.totalDays} 天计划</div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{payload.author}</Badge>
          <Badge variant="outline">{new Date(payload.sharedAt).toLocaleDateString()}</Badge>
        </div>
      </div>
      {p.goal && <div className="text-sm text-muted-foreground">目标：{p.goal}</div>}
      <div className="flex items-center gap-3">
        <Progress value={s.pct} className="flex-1" />
        <span className="text-sm text-muted-foreground shrink-0">第 {s.currentDay}/{p.totalDays} 天 · {s.pct}%</span>
      </div>
      <div className="text-xs text-muted-foreground">
        累计打卡 {s.totalChecks} 次
        {s.currentPhase && ` · 阶段：${s.currentPhase}`}
        {s.currentWeekTheme && ` · 本周：${s.currentWeekTheme}`}
      </div>
      {children && <div className="flex gap-2 pt-1">{children}</div>}
    </div>
  );
}

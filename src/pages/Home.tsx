import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrainCircuit, Compass, CalendarCheck2, Users } from 'lucide-react';
import FrameworkView from '@/sections/FrameworkView';
import ScheduleView from '@/sections/ScheduleView';
import TheoryIntro from '@/sections/TheoryIntro';
import CommunityView from '@/sections/CommunityView';
import { usePlans } from '@/lib/store';

export default function Home() {
  const { plans, checks, addPlan, removePlan, toggleCheck } = usePlans();
  const [tab, setTab] = useState('framework');

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <header className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <BrainCircuit className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">模式-模型行动系统</h1>
            <p className="text-sm text-muted-foreground">
              Pattern-Model Theory v1.0 — 预测误差驱动学习 · 双缓冲流水线 · 三波节律
            </p>
          </div>
        </header>

        <TheoryIntro />

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-6">
            <TabsTrigger value="framework" className="gap-2">
              <Compass className="h-4 w-4" /> ① 领域迁移 · 行动框架
            </TabsTrigger>
            <TabsTrigger value="schedule" className="gap-2">
              <CalendarCheck2 className="h-4 w-4" /> ② 每日日程 · 提醒
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <Users className="h-4 w-4" /> ③ 社区 · 分享
            </TabsTrigger>
          </TabsList>

          <TabsContent value="framework">
            <FrameworkView plans={plans} addPlan={addPlan} removePlan={removePlan} goSchedule={() => setTab('schedule')} />
          </TabsContent>
          <TabsContent value="schedule">
            <ScheduleView plans={plans} checks={checks} toggleCheck={toggleCheck} removePlan={removePlan} goFramework={() => setTab('framework')} />
          </TabsContent>
          <TabsContent value="community">
            <CommunityView plans={plans} checks={checks} addPlan={addPlan} />
          </TabsContent>
        </Tabs>

        <footer className="mt-12 border-t pt-4 text-center text-xs text-muted-foreground">
          五层认知架构：具身无意识 → 前意识 → 自我-世界模型 → 意识（元模式仲裁）＋ 扩展环境
        </footer>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

const LAYERS = [
  { name: '意识（元模式）', desc: '冲突仲裁、危机切换、自上而下否决——加载/卸载身份模块' },
  { name: '自我-世界模型', desc: '整合叙事、一致性维护、社会模拟——维护平行宇宙，检测确认偏误' },
  { name: '前意识', desc: '模式连接、远距离联想、生成式重组——睡眠与发散模式孵化' },
  { name: '具身无意识', desc: '模式提取、自动执行、肌肉记忆——浸泡重复、模板演练' },
  { name: '扩展环境', desc: '外部记忆、分布式处理、工具耦合——把一切可卸载的卸载出去' },
];

const PRIMITIVES = [
  { name: '双缓冲流水线', desc: 'Buffer A 前台执行时，Buffer B 后台必须预载下一周期，永不同停' },
  { name: '预测误差飞轮', desc: '预测→暴露→误差→持有(24–72h)→实验→反馈→更新；最有价值的误差是违反你最自信预测的那个' },
  { name: '模式真空协议', desc: '没有模式时：宣言真空→物理切换→粗粒度定位→72h 不做大决定→最小实验回归' },
  { name: '身份容器化', desc: '身份模块化、可加载可卸载、可迭代版本；模块失败迭代模块，不否定自我' },
  { name: '三波节律', desc: '晨（B→A）预载预测 → 日（A）深度执行 → 晚（A→B）原始记录误差并预载明天' },
];

export default function TheoryIntro() {
  const [open, setOpen] = useState(() => localStorage.getItem('pm.theory.open') !== '0');

  const toggle = () => {
    setOpen((o) => {
      localStorage.setItem('pm.theory.open', o ? '0' : '1');
      return !o;
    });
  };

  return (
    <Card className="mb-6">
      <button onClick={toggle} className="w-full flex items-center justify-between px-6 py-4 text-left">
        <span className="flex items-center gap-2 font-medium">
          <BookOpen className="h-4 w-4 text-primary" />
          基础理论：模式-模型理论（Pattern-Model Theory v1.0）
        </span>
        <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
          {open ? <>隐藏 <ChevronUp className="h-4 w-4" /></> : <>展开 <ChevronDown className="h-4 w-4" /></>}
        </Button>
      </button>

      {open && (
        <CardContent className="pt-0 space-y-5">
          <p className="text-sm text-muted-foreground leading-relaxed">
            核心主张：人的认知是分层的；<span className="text-foreground font-medium">一切学习都是预测误差的缩减</span>——没有误差就没有更新；
            大脑+身体+环境+工具+社会网络是一个统一的认知系统。本应用把这个理论编译成可执行的计划与每日日程。
          </p>

          <div>
            <div className="text-xs text-muted-foreground mb-2">五层认知架构（自上而下）</div>
            <div className="space-y-1">
              {LAYERS.map((l, i) => (
                <div key={l.name} className="flex items-start gap-3 text-sm">
                  <Badge variant="outline" className="shrink-0 font-mono">{5 - i}</Badge>
                  <span className="font-medium shrink-0 w-32">{l.name}</span>
                  <span className="text-muted-foreground">{l.desc}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2">五个核心操作原语（本应用的生成引擎）</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {PRIMITIVES.map((p) => (
                <div key={p.name} className="rounded-md border p-2.5 text-sm">
                  <div className="font-medium mb-0.5">{p.name}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{p.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground border-t pt-3">
            通用禁忌：抹平过快（误差未满持有期就整合）· 意识微管理 · 身份泄漏 · 工具傲慢 · 真空否认
          </p>
        </CardContent>
      )}
    </Card>
  );
}

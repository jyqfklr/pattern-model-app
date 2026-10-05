// ============================================================
// 文件材料提取：txt / md / csv / pdf / docx → 条目列表
// 全部在浏览器本地解析，不联网、不上传
// ============================================================

/** 从文件中提取纯文本 */
export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'pdf') {
    const pdfjs = await import('pdfjs-dist');
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url,
    ).toString();
    const buf = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: buf }).promise;
    const pages: string[] = [];
    const maxPages = Math.min(pdf.numPages, 100); // 安全上限
    for (let i = 1; i <= maxPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // 按 y 坐标聚合文本块为行，尽量还原目录/列表结构
      const rows = new Map<number, string[]>();
      for (const item of content.items) {
        if (!('str' in item)) continue;
        const y = Math.round((item.transform?.[5] ?? 0) / 3);
        const arr = rows.get(y) ?? [];
        arr.push(item.str);
        rows.set(y, arr);
      }
      const sorted = [...rows.entries()].sort((a, b) => b[0] - a[0]).map(([, v]) => v.join(' '));
      pages.push(sorted.join('\n'));
    }
    return pages.join('\n');
  }

  if (ext === 'docx' || ext === 'doc') {
    const mammoth = await import('mammoth');
    const buf = await file.arrayBuffer();
    const res = await mammoth.extractRawText({ arrayBuffer: buf });
    return res.value;
  }

  // txt / md / csv 及其他纯文本
  return file.text();
}

/** 清理单行：去掉 markdown 符号、序号、多余空白 */
function cleanLine(s: string): string {
  return s
    .replace(/^#{1,6}\s+/, '')                    // markdown 标题
    .replace(/^[\s\-*+•·◦▪◆►»|>]+/, '')           // 列表符号
    .replace(/^\(?\d{1,3}[)）.、:：]\s*/, '')      // 行首序号 1. / (1) / 1、
    .replace(/\s+/g, ' ')
    .trim();
}

/** 判断一行是否像"目录条目/材料项"而不是正文句子 */
function looksLikeItem(line: string): boolean {
  if (line.length < 2 || line.length > 60) return false;
  if (!/[一-鿿A-Za-z]/.test(line)) return false;       // 必须含文字
  if (/^(https?|www\.)/i.test(line)) return false;
  if (/^\d+$/.test(line)) return false;                // 纯页码
  if (/^[.·•…_\s-]+$/.test(line)) return false;        // 目录点线
  if ((line.match(/[。！？!?,，;；]/g) ?? []).length >= 2) return false; // 多个句读 → 正文段落
  return true;
}

/**
 * 从文本中提取条目：
 * - 优先取带"第X章/节/课/讲/单元"等结构的行
 * - 其次取短行（目录式列表）
 * - 过滤重复行（页眉页脚）、页码、URL
 */
export function extractItems(text: string, cap = 200): string[] {
  const rawLines = text.split(/[\n\r]+/).map(cleanLine).filter(Boolean);

  // 统计频率：重复出现 3 次以上的行视为页眉/页脚
  const freq = new Map<string, number>();
  rawLines.forEach((l) => freq.set(l, (freq.get(l) ?? 0) + 1));

  const out: string[] = [];
  const push = (l: string) => {
    const cleaned = l.replace(/[.·•…_\s]+\d{1,4}$/, '').trim(); // 去掉目录尾部点线+页码
    if (!cleaned || out.includes(cleaned)) return;
    if (!looksLikeItem(cleaned)) return;
    out.push(cleaned);
  };

  // 第一遍：结构化标题行（第1章 / Chapter 3 / 1.2 xxx）
  for (const l of rawLines) {
    if (out.length >= cap) break;
    if ((freq.get(l) ?? 0) > 3) continue;
    if (/^(第\s*\d+\s*[章节节课讲单元部卷]|chapter\s+\d+|lesson\s+\d+|\d+(\.\d+){0,2}\s+\S)/i.test(l)) push(l);
  }
  // 第二遍：其余短行（若结构化结果太少）
  if (out.length < 5) {
    for (const l of rawLines) {
      if (out.length >= cap) break;
      if ((freq.get(l) ?? 0) > 3) continue;
      push(l);
    }
  }
  return out.slice(0, cap);
}

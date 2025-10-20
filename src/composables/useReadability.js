// 中文常用停用词（精简版）
const STOP_WORDS = new Set([
  '的', '了', '是', '在', '有', '我', '他', '她', '它', '我们', '你们', '他们',
  '这', '那', '哪', '什么', '怎么', '为什么', '和', '与', '及', '或', '因为', '所以',
  '就', '都', '还', '也', '只', '但', '而', '如果', '虽然', '不过', '对于', '关于'
]);

/**
 * 分析核心关键词的合理性（集中度+分布均匀度+主题关联度）
 * @param {string} text - 纯文本
 * @param {string[]} [userKeywords] - 用户指定的核心关键词（可选）
 * @param {string} [title] - 文档标题（用于主题关联度计算）
 * @returns {{ concentration: number, distribution: number, relevance: number }} 
 */
function analyzeKeywords(text, userKeywords = [], title = '') {
  // 1. 改进分词：支持多字词识别（简单双字词组合）
  const chars = text.replace(/[\s\n\r\t\p{P}]/gu, '').split('');
  const validChars = chars.filter(char => !STOP_WORDS.has(char) && /[\u4e00-\u9fff]/.test(char));
  if (validChars.length === 0) return { concentration: 0, distribution: 0, relevance: 0 };

  // 2. 确定核心关键词（优先用户指定，否则自动提取Top3高频词）
  let coreKeywords;
  if (userKeywords.length > 0) {
    coreKeywords = userKeywords.filter(word => word.length > 0);
  } else {
    // 改进：同时统计单字和双字词频
    const wordCount = {};
    
    // 单字词频
    validChars.forEach(char => {
      wordCount[char] = (wordCount[char] || 0) + 1;
    });
    
    // 双字词频（相邻字符组合）
    for (let i = 0; i < validChars.length - 1; i++) {
      const bigram = validChars[i] + validChars[i + 1];
      if (!STOP_WORDS.has(bigram)) {
        wordCount[bigram] = (wordCount[bigram] || 0) + 1;
      }
    }
    
    // 提取Top3高频词作为核心关键词
    coreKeywords = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(item => item[0]);
  }
  if (coreKeywords.length === 0) return { concentration: 0, distribution: 0, relevance: 0 };

  // 3. 计算关键词集中度（关键词总出现次数 / 有效字符总数）
  let keywordTotalCount = 0;
  const keywordPositions = [];
  
  // 改进：支持多字关键词匹配
  coreKeywords.forEach(keyword => {
    const regex = new RegExp(keyword, 'g');
    let match;
    while ((match = regex.exec(text)) !== null) {
      keywordTotalCount += keyword.length;
      keywordPositions.push(match.index);
    }
  });
  
  const concentration = keywordTotalCount / validChars.length;

  // 4. 计算关键词分布均匀度（基于方差，值越接近1说明分布越均匀）
  if (keywordPositions.length < 2) return { 
    concentration, 
    distribution: keywordPositions.length > 0 ? 1 : 0, 
    relevance: 0 
  };
  const avgPos = keywordPositions.reduce((sum, pos) => sum + pos, 0) / keywordPositions.length;
  const variance = keywordPositions.reduce((sum, pos) => sum + Math.pow(pos - avgPos, 2), 0) / keywordPositions.length;
  const maxVariance = Math.pow(validChars.length - 1, 2) / 4;
  const distribution = 1 - Math.min(1, variance / maxVariance);

  // 5. 计算主题关联度（关键词与标题的匹配度，无标题时跳过此检查）
  let relevance = 1; // 默认高关联度，避免无标题时的误判
  if (title && title.trim()) {
    const titleChars = title.replace(/[\s\n\r\t\p{P}]/gu, '').split('');
    const titleValidChars = titleChars.filter(char => /[\u4e00-\u9fff]/.test(char));
    
    if (titleValidChars.length > 0) {
      let matchedKeywords = 0;
      coreKeywords.forEach(keyword => {
        if (title.includes(keyword)) {
          matchedKeywords += 1;
        }
      });
      relevance = matchedKeywords / coreKeywords.length;
    }
  }

  return { concentration, distribution, relevance };
}

/**
 * 分析文本熵值状态（权重聚合 + 逻辑词/标题层级加权 + 关键词评估）
 * @param {string} text - 纯文本
 * @param {{ headingLevels?: number[], userKeywords?: string[], title?: string }} [options]
 * @returns {{ status: 'warning'|'normal', progress: number, message: string }}
 */
export function analyzeEntropy(text, options = {}) {
  const { userKeywords = [], title = '' } = options;
  const baseState = { status: 'normal', progress: 0, message: '文本结构清晰' }
  const raw = (text || '').replace(/[\s\n\r\t]+/g, '')
  const totalChars = raw.length
  if (!totalChars) return { ...baseState, message: '输入内容以分析', progress: 0 }

  // 动态阈值调整：根据文本长度调整判断标准
  const isShortText = totalChars < 200;
  const longSentenceThreshold = isShortText ? 20 : 30; // 短文本长句阈值降低
  const noPunctThreshold = isShortText ? 20 : 25; // 无标点阈值：短文本20字，长文本25字

  // 新增：关键词评估
  const { concentration, distribution, relevance } = analyzeKeywords(text, userKeywords, title);
  const lowConcentration = concentration < 0.02; // 关键词集中度低于2%
  const poorDistribution = distribution < 0.3; // 分布均匀度低于0.3
  const lowRelevance = relevance < 0.3; // 主题关联度低于0.3

  // 标点
  const PUNCT = /[。．．。？！?!；;，,、]/g

  // 1) 长句比例（动态阈值，以字数计）→ 22%
  const sentenceSplitter = /[。？！?!；;]+/g
  const sentenceParts = (text || '').split(sentenceSplitter).map(s => s.trim()).filter(Boolean)
  let longSentenceChars = 0
  sentenceParts.forEach(s => {
    const len = s.replace(/[\s\n\r\t]/g, '').length
    if (len > longSentenceThreshold) longSentenceChars += len
  })
  const longSentenceRatio = longSentenceChars / totalChars

  // 2) 无标点比例（连续≥动态阈值字且无标点的字数占比）→ 20%
  // 按标点分割得到片段，统计每个片段去空白长度≥动态阈值 的字符数总和
  // 只识别基础标点，避免过度分割
  const noPunctSegments = (text || '').split(/[。．．。？！?!；;，,、]/).map(s => s.replace(/[\s\n\r\t]/g, ''))
  let noPunctChars = 0
  noPunctSegments.forEach(seg => {
    if (seg.length >= noPunctThreshold) noPunctChars += seg.length
  })
  const noPunctRatio = totalChars ? Math.min(1, noPunctChars / totalChars) : 0

  // 3) 逻辑词比例（>1% 则总熵值 × 75%）
  const LOGIC_WORDS = ['首先', '其次', '然后', '因此', '总之', '另外', '但是', '所以', '同时', '最后']
  let logicChars = 0
  LOGIC_WORDS.forEach(w => {
    const re = new RegExp(w, 'g')
    const matches = (text || '').match(re)
    if (matches && matches.length) logicChars += w.length * matches.length
  })
  const logicRatio = logicChars / totalChars

  // 4) 重复汉字比例（连续相同汉字≥3，按重复字数）→ 20%
  let repeatChars = 0
  const CJK_REPEAT = /([\u4e00-\u9fff])\1{2,}/g
  const repeats = raw.match(CJK_REPEAT) || []
  repeats.forEach(seq => { repeatChars += (seq.length - 1) })
  const repeatRatio = repeatChars / totalChars

  // 5) 最长段落在全文中的占比（按字数）→ 12%
  // 段落按换行切分，如果没有换行则按句号等自然分割
  let paraParts;
  if ((text || '').includes('\n')) {
    // 有换行符：按换行分割
    paraParts = (text || '').split(/\n+/).map(s => s.replace(/[\s\n\r\t]/g, '')).filter(Boolean)
        } else {
    // 无换行符：按句号等自然分割，避免误判连续文本
    paraParts = (text || '').split(/[。？！?!；;]+/).map(s => s.replace(/[\s\n\r\t]/g, '')).filter(Boolean)
  }
  const longestParaLen = paraParts.length ? Math.max(...paraParts.map(s => s.length)) : 0
  const longestParaRatio = totalChars ? longestParaLen / totalChars : 0

  // 6) 连续标点在文中的占比（按字数）→ 10%
  const punctRuns = raw.match(/[。．．。？！?!；;，,、]{2,}/g) || []
  const punctRunChars = punctRuns.reduce((sum, seg) => sum + seg.length, 0)
  const punctRunRatio = totalChars ? punctRunChars / totalChars : 0

  // 7) 无意义特殊符号占比（按字数）→ 7%
  // 特殊符号：表情符号、箭头/图标/数学等特殊 Unicode 区段（不包含常见全角标点）
  const specialSymbols = raw.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{2190}-\u{21FF}]|[\u{2200}-\u{22FF}]|[\u{2300}-\u{23FF}]|[\u{25A0}-\u{25FF}]|[\u{2B00}-\u{2BFF}]/gu) || []
  // 连续重复的 ASCII 符号（如***、===、---等），不把中文字符计入
  const repeatSymbols = raw.match(/[\-\=\*\_~#@\^\$%\+\|\\\/<>{}\[\]\(\)\.,:;!?]{3,}/g) || []
  const specialSymbolChars = specialSymbols.reduce((sum, sym) => sum + sym.length, 0) + 
                            repeatSymbols.reduce((sum, sym) => sum + sym.length, 0)
  const specialSymbolRatio = totalChars ? specialSymbolChars / totalChars : 0

  // 基础汇总（进一步优化权重，确保能达到100%）
  let entropy = 0
  entropy += longSentenceRatio * 35  // 长句比例：35%
  entropy += noPunctRatio * 30       // 无标点比例：30%
  entropy += repeatRatio * 15        // 重复汉字比例：15%
  entropy += longestParaRatio * 10   // 最长段落占比：10%
  entropy += punctRunRatio * 5       // 连续标点占比：5%
  entropy += specialSymbolRatio * 5  // 特殊符号占比：5%

  // 关键词指标权重（进一步提高惩罚）
  if (lowConcentration) entropy += 12;  // 集中度低，加12分熵值
  if (poorDistribution) entropy += 10;  // 分布不均，加10分熵值
  if (lowRelevance) entropy += 8;       // 主题关联度低，加8分熵值

  // 逻辑词奖励
  if (logicRatio > 0.08) {
    const reduction = 0.03;
    entropy *= (1 - reduction);
  }

  // 标题层级加权（适度奖励）
  const levels = Array.isArray(options.headingLevels) ? Array.from(new Set(options.headingLevels)) : []
  const hasH1 = levels.includes(1)
  const hasH2 = levels.includes(2)
  const hasH3 = levels.includes(3)
  if (hasH1 && hasH2 && hasH3) entropy *= 0.80  // 适度奖励：20%降幅
  else if (hasH1 && hasH2) entropy *= 0.85      // 适度奖励：15%降幅
  else if (hasH1) entropy *= 0.90               // 适度奖励：10%降幅

  entropy = Math.max(0, Math.min(100, Math.round(entropy)))

  // 提示文案优先级优化：优先显示影响阅读的核心问题
  let message = ''
  if (noPunctRatio > 0.4) message = '缺少标点分隔，建议添加标点'
  else if (longSentenceRatio > 0.35) message = '句子过长，建议拆分短句'
  else if (repeatRatio > 0.12) message = '重复文字较多，建议精简表达'
  else if (longestParaRatio > 0.35) message = '单个段落过长，建议分段'
  else if (punctRunRatio > 0.05) message = '连续标点较多，建议减少冗余标点'
  else if (specialSymbolRatio > 0.12) message = '特殊符号过多'
  else if (lowConcentration) message = '核心关键词占比过低'
  else if (poorDistribution) message = '核心关键词分布不均'
  else if (lowRelevance) message = '关键词与主题关联度低'
  else if (logicRatio <= 0.005) message = '逻辑词偏少'
  else message = `文本结构清晰（熵值：${entropy}）`

  const status = entropy > 50 ? 'warning' : 'normal'
  return { status, progress: entropy, message }
}
/* Shared legend for the reader and its standalone help page. */
'use strict';
function symbolGuideHTML(){return `<div class="symbol-guide">
<p class="symbol-intro">读懂正文里的线条与小字。以下示例使用默认的“线条”样式。</p>
<div class="symbol-row"><div class="symbol-example"><span class="legend-person">鄧禹</span></div><div><h3>人名 · 下方实线</h3><p>实线标出人物姓名。可以点击的人名会打开人物介绍及相关段落；身份待辨认时，人物卡片会提示同名线索。</p></div></div>
<div class="symbol-row"><div class="symbol-example"><span class="legend-place">洛陽</span></div><div><h3>地名 · 实线圆角框</h3><p>实线圆角框标出城邑、郡国、山川等地点。点击地名，左侧查看相关上下文，右侧查看历史地图与地名定位。</p></div></div>
<div class="symbol-row"><div class="symbol-example"><span class="legend-official">車騎將軍</span></div><div><h3>官职 · 虚线框</h3><p>虚线框标出将军、刺史等官职，点击查看官职类别、品阶与释义。</p></div></div><div class="symbol-row"><div class="symbol-example"><span class="legend-day">甲子</span></div><div><h3>时间 · 干支纪日下方点线</h3><p>“甲子”“乙丑”等干支纪日下方有点线，点击可查看六十甲子的顺序。年号、年份和月份不统一加下划线；本段纪年显示在阅读标题中，例如“建武三年”。</p></div></div>
<div class="symbol-row"><div class="symbol-example"><span class="legend-book">史記</span></div><div><h3>书名 · 下方波浪线</h3><p>波浪线标出底本中的书籍名称，和人名、地名的线条区分开。</p></div></div>
<div class="symbol-row"><div class="symbol-example"><span class="legend-sentence">不利</span></div><div><h3>蓝色横线 · 当前选中的文白对应句</h3><p>点击原文句子，上方显示对应译文，原文与右侧对应译文下方同时显示蓝色横线；点击其他位置或按 Esc 清除。分句按文字与顺序自动匹配，显示“对应译文参考”时可结合整段阅读。</p></div></div><div class="symbol-row"><div class="symbol-example"><span class="legend-selected">周建</span></div><div><h3>黄色底色 · 悬停的人名或地名</h3><p>鼠标悬停在人名或地名上，使用浅黄色小圆角底色标记，紧贴文字，保留原有名称线条。同一人物的已确认出现一起标记，身份待辨认时只标记当前一处；同名地点一起标记。移开鼠标后恢复；点击人名仍可打开人物介绍。</p></div></div><h3 class="symbol-section">文字上方与旁边的小标记</h3>
<div class="symbol-row"><div class="symbol-example"><ruby class="legend-age"><span class="legend-person">鄧禹</span><rt>25岁</rt></ruby></div><div><h3>人名上方的数字 · 当时年龄</h3><p>按本段纪年与出生年计算，未按生日细分。人物身份或出生年不明时不显示；可在“阅读配置 → 人物年龄”关闭。</p></div></div>
<div class="symbol-row"><div class="symbol-example"><ruby>讖<rt>chèn</rt></ruby></div><div><h3>文字上方的字母 · 拼音</h3><p>常见生僻字的读音提示。多音字请结合上下文和胡注；可在阅读配置中关闭“拼音”。</p></div></div>
<div class="symbol-row"><div class="symbol-example"><span class="legend-note">〔注〕</span></div><div><h3>〔注〕 · 胡三省注与校注</h3><p>点击查看对应注释。在阅读配置中开启“胡三省注与校注”，可直接展开在正文中。</p></div></div>
<p class="symbol-tip">这些标记只用于已经识别或底本已标出的文字。你可以在“阅读配置 → 语义强调”切换为颜色、仅加粗或无；切换后，人名、地名和书名不一定继续显示上述线条。自己保存的选文批注使用另设的颜色与样式。</p>
</div>`}

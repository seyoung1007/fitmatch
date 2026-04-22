/* ═══════════════════════════════════
   FITMATCH — ai.js  v2
═══════════════════════════════════ */
async function runAI() {
  const goal   = document.querySelector('.chip.on[data-g="goal"]')?.textContent   || '다이어트';
  const level  = document.querySelector('.chip.on[data-g="level"]')?.textContent  || '초보';
  const budget = document.getElementById('bslider').value;
  const gender = document.querySelector('.chip.on[data-g="gender"]')?.textContent || '상관없음';

  const box  = document.getElementById('ai-box');
  const body = document.getElementById('ai-body');
  const btns = document.getElementById('ai-btns');

  box.className = 'ai-result-box show';
  body.innerHTML = '<span class="spinner"></span> AI가 분석 중...';
  btns.innerHTML = '';

  const matched = TRAINERS
    .filter(t => t.price <= budget * 10000 + 10000)
    .sort((a,b) => b.rating - a.rating)
    .slice(0, 2);

  const prompt = `당신은 PT 플랫폼 AI 어시스턴트입니다.

사용자 정보:
- 운동 목표: ${goal}
- 경험 수준: ${level}
- 1회 예산: ${budget}만원 이하
- 성별 선호: ${gender}

추천 트레이너:
${matched.map(t=>`- ${t.name} (${t.spec}, ${Math.round(t.price/10000)}만원/회, ★${t.rating})`).join('\n')}

위 정보를 바탕으로 2~3문장으로 왜 이 트레이너들이 사용자에게 적합한지 친근하고 간결하게 설명해주세요. 마지막에 첫 PT 시작 전 유용한 팁 한 가지를 알려주세요.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, messages:[{role:'user',content:prompt}] }),
    });
    const data = await res.json();
    body.innerHTML = (data.content?.map(i=>i.text||'').join('')||'').replace(/\n/g,'<br>');
  } catch {
    body.innerHTML = `<b>${goal}</b> 목표와 <b>${budget}만원</b> 예산에 맞는 트레이너를 찾았어요!<br>
      ${matched.map(t=>t.name).join(', ')} 트레이너를 추천드립니다.<br><br>
      💡 <b>Tip:</b> 첫 PT 전에 현재 체력 수준과 목표를 구체적으로 전달하면 더 효과적인 프로그램을 받을 수 있어요.`;
  }

  btns.innerHTML = matched.map(t =>
    `<button class="ai-r-btn" onclick="openSheet(${t.id})">${t.name} 예약 →</button>`
  ).join('');
}

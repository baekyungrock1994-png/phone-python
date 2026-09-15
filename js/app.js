// PyPocket 메인 애플리케이션 진입점

import { interpreter } from './interpreter.js';
import { initQuickToolbar } from './quick-toolbar.js';
import { initBlueprint } from './blueprint.js';
import { translatePythonError } from './error-translator.js';
import { QUESTS } from './templates.js';

// DOM 요소 참조
const codeTextarea = document.getElementById('codeTextarea');
const lineNumbers = document.getElementById('lineNumbers');
const btnRun = document.getElementById('btnRun');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const consoleBody = document.getElementById('consoleBody');
const btnClearConsole = document.getElementById('btnClearConsole');
const btnExportPy = document.getElementById('btnExportPy');
const questList = document.getElementById('questList');
const toast = document.getElementById('toast');

// REPL 관련 DOM 요소
const btnModeScript = document.getElementById('btnModeScript');
const btnModeRepl = document.getElementById('btnModeRepl');
const replView = document.getElementById('replView');
const replBody = document.getElementById('replBody');
const replInput = document.getElementById('replInput');
const btnReplSend = document.getElementById('btnReplSend');
const btnReplPrev = document.getElementById('btnReplPrev');
const btnReplNext = document.getElementById('btnReplNext');

let currentConsoleMode = 'script'; // 'script' | 'repl'
const replHistory = [];
let replHistoryIndex = -1;

// input() 모달 요소
const inputModal = document.getElementById('inputModal');
const inputPromptText = document.getElementById('inputPromptText');
const inputModalInput = document.getElementById('inputModalInput');
const btnInputSubmit = document.getElementById('btnInputSubmit');

let currentInputResolve = null;

// 토스트 메시지 표시
function showToast(msg) {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2400);
}

// 에디터 줄 번호 갱신
function updateLineNumbers() {
  if (!codeTextarea || !lineNumbers) return;
  const lines = codeTextarea.value.split('\n');
  const count = lines.length || 1;
  let numsHtml = '';
  for (let i = 1; i <= count; i++) {
    numsHtml += `<div>${i}</div>`;
  }
  lineNumbers.innerHTML = numsHtml;
}

// 탭 전환 처리
function switchTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach((pane) => {
    pane.classList.toggle('active', pane.id === tabId);
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.tab === tabId);
  });

  if (tabId === 'tabEditor') {
    codeTextarea.focus();
    updateLineNumbers();
  } else if (tabId === 'tabConsole' && currentConsoleMode === 'repl') {
    setTimeout(() => replInput.focus(), 150);
  }
}

const replLogs = document.getElementById('replLogs');
const replCurrentLine = document.getElementById('replCurrentLine');

// 콘솔 모드 전환 (스크립트 vs REPL)
function switchConsoleMode(mode) {
  currentConsoleMode = mode;
  if (mode === 'script') {
    btnModeScript.classList.add('active');
    btnModeRepl.classList.remove('active');
    consoleBody.style.display = 'flex';
    replView.classList.remove('active');
  } else {
    btnModeScript.classList.remove('active');
    btnModeRepl.classList.add('active');
    consoleBody.style.display = 'none';
    replView.classList.add('active');
    setTimeout(() => {
      replInput.focus();
      scrollReplToBottom();
    }, 100);
  }
}

function scrollReplToBottom() {
  if (replCurrentLine) {
    replCurrentLine.scrollIntoView({ behavior: 'smooth', block: 'end' });
  } else if (replBody) {
    replBody.scrollTop = replBody.scrollHeight;
  }
}

// REPL에 명령 및 결과 라인 출력
function appendReplOutput(text, type = 'result') {
  if (!replLogs) return;
  const line = document.createElement('div');
  if (type === 'cmd') {
    line.className = 'repl-cmd-line';
    line.innerHTML = `<span class="repl-prompt-symbol">&gt;&gt;&gt;</span><span>${text}</span>`;
  } else {
    line.className = 'repl-result-line';
    line.textContent = text;
  }
  replLogs.appendChild(line);
  scrollReplToBottom();
}

// REPL 명령어 전송 및 평가
async function handleReplSubmit() {
  const cmd = replInput.value.trim();
  if (!cmd) return;

  // 히스토리에 기록
  replHistory.push(cmd);
  replHistoryIndex = replHistory.length;

  appendReplOutput(cmd, 'cmd');
  replInput.value = '';

  const result = await interpreter.evaluateInteractive(cmd);
  if (!result.success && result.error) {
    appendReplOutput(`오류: ${result.error}`, 'error');
  }
  replInput.focus();
  scrollReplToBottom();
}

// 콘솔에 텍스트 로그 출력
function appendConsole(text, type = 'stdout') {
  if (currentConsoleMode === 'repl') {
    appendReplOutput(text, 'result');
    return;
  }

  if (!consoleBody) return;

  // placeholder 제거
  const placeholder = consoleBody.querySelector('.console-placeholder');
  if (placeholder) placeholder.remove();

  const line = document.createElement('div');
  line.className = `log-line log-${type}`;
  line.textContent = text;
  consoleBody.appendChild(line);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

// 콘솔에 초보자 친화적 에러 카드 출력
function appendErrorCard(rawError) {
  if (!consoleBody) return;
  const info = translatePythonError(rawError);

  const card = document.createElement('div');
  card.className = 'error-helper-card';
  card.innerHTML = `
    <div class="error-helper-header">
      <span class="error-badge">⚠️ 에러 발생</span>
      <span class="error-type-title">${info.type} ${info.line ? `(줄 ${info.line})` : ''}</span>
    </div>
    <div class="error-friendly-msg">${info.message}</div>
    <div class="error-tip-box">
      <span class="tip-icon">💡</span>
      <span><strong>해결 힌트:</strong> ${info.tip}</span>
    </div>
    <details class="error-raw-details">
      <summary>컴퓨터 원본 에러(Traceback) 보기</summary>
      <pre class="error-raw-content">${info.raw}</pre>
    </details>
  `;
  consoleBody.appendChild(card);
  consoleBody.scrollTop = consoleBody.scrollHeight;
}

// input() 프롬프트 모달 처리 (window.pyInputPrompt 등록)
window.pyInputPrompt = function (promptText) {
  return new Promise((resolve) => {
    currentInputResolve = resolve;
    inputPromptText.textContent = promptText || '값을 입력해주세요:';
    inputModalInput.value = '';
    inputModal.classList.add('show');
    setTimeout(() => inputModalInput.focus(), 100);
  });
};

function submitInput() {
  const val = inputModalInput.value;
  inputModal.classList.remove('show');
  appendConsole(val, 'stdin'); // 입력한 값을 콘솔에 파란색으로 표시
  if (currentInputResolve) {
    currentInputResolve(val);
    currentInputResolve = null;
  }
}

// 퀘스트 목록 렌더링
function renderQuests(blueprintApi) {
  if (!questList) return;
  questList.innerHTML = QUESTS.map((q) => `
    <div class="quest-card" data-id="${q.id}">
      <div class="quest-card-top">
        <span class="quest-badge badge-level-${q.level}">${q.levelText}</span>
        <div class="quest-concepts">
          ${q.concepts.map((c) => `<span class="concept-pill">${c}</span>`).join('')}
        </div>
      </div>
      <div class="quest-title">${q.title}</div>
      <div class="quest-desc">${q.desc}</div>
      <div class="quest-footer">
        <span>터치하여 불러오기</span>
        <span class="btn-load-quest">불러오기 →</span>
      </div>
    </div>
  `).join('');

  questList.addEventListener('click', (e) => {
    const card = e.target.closest('.quest-card');
    if (!card) return;
    const qId = card.dataset.id;
    const quest = QUESTS.find((q) => q.id === qId);
    if (!quest) return;

    // 코드 및 블루프린트 로드
    codeTextarea.value = quest.code;
    updateLineNumbers();
    if (blueprintApi) {
      blueprintApi.setBlueprintData(quest.blueprint);
    }

    showToast(`'${quest.title}' 퀘스트를 불러왔습니다!`);
    switchTab('tabEditor');
  });
}

// .py 파일 다운로드 (스마트폰 -> PC 연동용)
function exportPythonFile() {
  const code = codeTextarea.value;
  const blob = new Blob([code], { type: 'text/x-python;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `pypocket_${Date.now().toString().slice(-4)}.py`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast('파이썬 파일(.py)이 다운로드되었습니다!');
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 1. 하단 탭 버튼 이벤트
  document.querySelectorAll('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      switchTab(item.dataset.tab);
    });
  });

  // 2. 에디터 퀵 툴바 초기화
  initQuickToolbar(codeTextarea, updateLineNumbers);

  // 3. 에디터 입력 시 줄 번호 자동 갱신 및 로컬 저장
  codeTextarea.addEventListener('input', () => {
    updateLineNumbers();
    localStorage.setItem('pypocket_code', codeTextarea.value);
  });

  // 저장된 이전 코드 복원 또는 기본 예제 로드
  const savedCode = localStorage.getItem('pypocket_code');
  if (savedCode) {
    codeTextarea.value = savedCode;
  } else {
    codeTextarea.value = QUESTS[0].code;
  }
  updateLineNumbers();

  // 4. 구상실(Blueprint) 초기화
  const blueprintApi = initBlueprint((generatedCode) => {
    codeTextarea.value = generatedCode;
    updateLineNumbers();
    localStorage.setItem('pypocket_code', generatedCode);
    showToast('✨ 구상 내용이 코드로 변환되었습니다!');
    switchTab('tabEditor');
  });

  // 5. 퀘스트 렌더링
  renderQuests(blueprintApi);

  // 6. Pyodide 인터프리터 이벤트 연결
  interpreter.onOutput = (text, type) => {
    appendConsole(text, type);
  };

  interpreter.onStatusChange = (status) => {
    if (status === 'loading') {
      statusDot.className = 'status-dot';
      statusText.textContent = '엔진 준비 중...';
      btnRun.disabled = true;
    } else if (status === 'ready') {
      statusDot.className = 'status-dot ready';
      statusText.textContent = '파이썬 3.11 준비됨';
      btnRun.disabled = false;
      btnRun.innerHTML = '▶ 실행';
    } else if (status === 'running') {
      statusDot.className = 'status-dot';
      statusText.textContent = '코드 실행 중...';
      btnRun.disabled = true;
      btnRun.innerHTML = '⏳ 실행 중';
    } else if (status === 'error') {
      statusDot.className = 'status-dot';
      statusText.textContent = '엔진 오류';
    }
  };

  // 백그라운드에서 Pyodide 미리 로드 시작 (사용자가 첫 코드를 짤 동안 준비)
  interpreter.init();

  // 7. 실행 버튼 클릭
  btnRun.addEventListener('click', async () => {
    const code = codeTextarea.value;
    if (!code.trim()) {
      showToast('실행할 코드를 입력해주세요!');
      return;
    }

    // 실행 탭(콘솔)으로 화면 자동 전환 및 스크립트 모드로 표시
    switchTab('tabConsole');
    switchConsoleMode('script');

    appendConsole(`🚀 [${new Date().toLocaleTimeString()}] 실행을 시작합니다...`, 'system');
    const startTime = performance.now();

    const result = await interpreter.runCode(code);
    const duration = ((performance.now() - startTime) / 1000).toFixed(2);

    if (result.success) {
      appendConsole(`✅ 실행 완료 (${duration}초 소요)`, 'success');
    } else {
      appendErrorCard(result.error);
    }
  });

  // 8. 콘솔 모드 전환 버튼 바인딩
  btnModeScript.addEventListener('click', () => switchConsoleMode('script'));
  btnModeRepl.addEventListener('click', () => switchConsoleMode('repl'));

  // 9. REPL 명령어 전송 및 엔터키 바인딩
  btnReplSend.addEventListener('click', handleReplSubmit);
  replInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      handleReplSubmit();
    } else if (e.key === 'ArrowUp') {
      // 이전 명령어
      e.preventDefault();
      if (replHistoryIndex > 0) {
        replHistoryIndex--;
        replInput.value = replHistory[replHistoryIndex] || '';
      }
    } else if (e.key === 'ArrowDown') {
      // 다음 명령어
      e.preventDefault();
      if (replHistoryIndex < replHistory.length - 1) {
        replHistoryIndex++;
        replInput.value = replHistory[replHistoryIndex] || '';
      } else {
        replHistoryIndex = replHistory.length;
        replInput.value = '';
      }
    }
  });

  // REPL 모바일용 이전/다음 버튼
  btnReplPrev.addEventListener('click', () => {
    if (replHistoryIndex > 0) {
      replHistoryIndex--;
      replInput.value = replHistory[replHistoryIndex] || '';
    }
  });

  btnReplNext.addEventListener('click', () => {
    if (replHistoryIndex < replHistory.length - 1) {
      replHistoryIndex++;
      replInput.value = replHistory[replHistoryIndex] || '';
    } else {
      replHistoryIndex = replHistory.length;
      replInput.value = '';
    }
  });

  // 10. 콘솔 지우기 (모드에 따라 동작)
  if (btnClearConsole) {
    btnClearConsole.addEventListener('click', () => {
      if (currentConsoleMode === 'repl') {
        if (replLogs) replLogs.innerHTML = '';
        replInput.value = '';
        replInput.focus();
        showToast('REPL 콘솔이 초기화되었습니다.');
      } else {
        consoleBody.innerHTML = `
          <div class="console-placeholder">
            <span class="icon">📟</span>
            <p>상단의 <strong>[▶ 실행]</strong> 버튼을 누르면<br>파이썬 실행 결과가 여기에 나타납니다.</p>
          </div>
        `;
        showToast('콘솔이 초기화되었습니다.');
      }
    });
  }

  // 터미널 본문 터치 시 인라인 인풋에 자동 포커스
  if (replBody) {
    replBody.addEventListener('click', (e) => {
      if (!e.target.closest('button')) {
        replInput.focus();
      }
    });
  }

  // 11. 파일 내보내기 버튼
  if (btnExportPy) {
    btnExportPy.addEventListener('click', exportPythonFile);
  }

  // 12. input 모달 제출
  btnInputSubmit.addEventListener('click', submitInput);
  inputModalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitInput();
    }
  });
});

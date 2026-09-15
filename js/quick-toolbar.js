// 모바일 전용 퀵 툴바 제어 모듈

export function initQuickToolbar(textarea, onUpdateLineNumbers) {
  const toolbar = document.getElementById('quickToolbar');
  if (!toolbar || !textarea) return;

  // 텍스트 영역 내 특정 위치에 문자열 삽입 및 커서 재배치
  function insertText(textToInsert, cursorOffset = null) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    const before = value.substring(0, start);
    const after = value.substring(end);

    textarea.value = before + textToInsert + after;

    // 커서 위치 설정
    const newPos = (cursorOffset !== null) ? start + cursorOffset : start + textToInsert.length;
    textarea.selectionStart = newPos;
    textarea.selectionEnd = newPos;

    textarea.focus();
    if (onUpdateLineNumbers) onUpdateLineNumbers();
  }

  // 툴바 버튼 클릭 이벤트 리스너 등록
  toolbar.addEventListener('click', (e) => {
    const btn = e.target.closest('.toolbar-btn');
    if (!btn) return;

    e.preventDefault();
    const action = btn.dataset.action;
    const insert = btn.dataset.insert;
    const offset = btn.dataset.offset ? parseInt(btn.dataset.offset, 10) : null;

    if (action === 'tab') {
      // 4칸 공백 삽입
      insertText('    ');
    } else if (action === 'untab') {
      // 현재 줄 앞의 공백 제거 (Shift-Tab 유사)
      handleUntab();
    } else if (insert) {
      insertText(insert, offset);
    }
  });

  // 줄 내어쓰기 (공백 제거) 로직
  function handleUntab() {
    const start = textarea.selectionStart;
    const value = textarea.value;
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const currentLinePrefix = value.substring(lineStart, lineStart + 4);

    if (currentLinePrefix === '    ') {
      textarea.value = value.substring(0, lineStart) + value.substring(lineStart + 4);
      const newPos = Math.max(lineStart, start - 4);
      textarea.selectionStart = newPos;
      textarea.selectionEnd = newPos;
      textarea.focus();
      if (onUpdateLineNumbers) onUpdateLineNumbers();
    }
  }

  // 에디터 내 Tab 키 처리 (PC 환경에서도 정상 작동하도록)
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        handleUntab();
      } else {
        insertText('    ');
      }
    }
  });
}

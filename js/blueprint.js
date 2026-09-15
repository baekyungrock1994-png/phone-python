// 프로그램 구상실 (Blueprint Studio) 모듈

export function initBlueprint(onConvertToCode) {
  const goalInput = document.getElementById('bpGoal');
  const inputInput = document.getElementById('bpInput');
  const logicInput = document.getElementById('bpLogic');
  const outputInput = document.getElementById('bpOutput');
  const btnConvert = document.getElementById('btnConvertCode');
  const btnReset = document.getElementById('btnResetBlueprint');
  const quickTags = document.querySelectorAll('.tag-btn');

  // 추천 태그 클릭 시 해당 입력창에 텍스트 덧붙이기
  quickTags.forEach((tag) => {
    tag.addEventListener('click', () => {
      const targetId = tag.dataset.target;
      const text = tag.dataset.text;
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        const current = targetEl.value.trim();
        targetEl.value = current ? `${current}, ${text}` : text;
        targetEl.focus();
      }
    });
  });

  // 초기화 버튼
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      if (confirm('구상 카드 내용을 모두 비우시겠습니까?')) {
        goalInput.value = '';
        inputInput.value = '';
        logicInput.value = '';
        outputInput.value = '';
      }
    });
  }

  // 코드로 변환하기
  if (btnConvert) {
    btnConvert.addEventListener('click', () => {
      const goal = goalInput.value.trim() || '나만의 파이썬 프로그램';
      const inputs = inputInput.value.trim();
      const logic = logicInput.value.trim();
      const output = outputInput.value.trim();

      const pythonCode = generateSkeletonCode(goal, inputs, logic, output);
      if (onConvertToCode) {
        onConvertToCode(pythonCode);
      }
    });
  }

  // 블루프린트 폼 값 설정 (퀘스트 불러오기 등에서 사용)
  function setBlueprintData(data) {
    if (!data) return;
    if (goalInput) goalInput.value = data.goal || '';
    if (inputInput) inputInput.value = data.inputs || '';
    if (logicInput) logicInput.value = data.logic || '';
    if (outputInput) outputInput.value = data.output || '';
  }

  return { setBlueprintData };
}

// 구상 내용을 기반으로 한 입문자용 파이썬 스켈레톤 코드 생성 함수
function generateSkeletonCode(goal, inputs, logic, output) {
  return `# ========================================================
# 💡 [프로그램 구상]
# 목표: ${goal}
# ========================================================

print("🚀 [${goal}] 실행 시작!\\n")

# 1. 입력 데이터 준비
# 구상 내용: ${inputs || '필요한 입력을 정의해주세요'}
${inputs ? '# 예시: 사용자로부터 입력을 받거나 변수를 선언합니다.' : '# user_data = input("입력: ")'}
# user_input = input("데이터를 입력하세요: ")


# 2. 로직 및 처리 과정
# 구상 내용: ${logic || '조건이나 반복문을 작성해주세요'}
# TODO: 여기에 핵심 알고리즘을 작성해보세요!
# if 조건:
#     처리 내용
# else:
#     다른 처리


# 3. 결과 출력
# 구상 내용: ${output || '최종 결과를 출력합니다'}
print("\\n✨ 프로그램이 성공적으로 완료되었습니다!")
`;
}

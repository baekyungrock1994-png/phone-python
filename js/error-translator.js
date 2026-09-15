// 초보자 친화적 파이썬 에러 통역기 (Friendly Error Translator)

export function translatePythonError(rawError) {
  const errorText = String(rawError || '');

  // 라인 번호 추출 (e.g., File "<exec>", line 4)
  const lineMatch = errorText.match(/line (\d+)/);
  const lineNum = lineMatch ? lineMatch[1] : null;

  // 1. IndentationError (들여쓰기 오류)
  if (errorText.includes('IndentationError')) {
    let detail = '들여쓰기(칸수)가 맞지 않습니다.';
    if (errorText.includes('expected an indented block')) {
      detail = 'if, for, def 문장 다음 줄에는 반드시 Tab이나 4칸 들여쓰기가 필요해요!';
    } else if (errorText.includes('unindent does not match')) {
      detail = '앞선 줄의 들여쓰기 칸수와 일치하지 않아요.';
    }

    return {
      type: 'IndentationError (들여쓰기 오류)',
      line: lineNum,
      message: detail,
      tip: '퀵 툴바의 [Tab] 버튼을 눌러 정확하게 들여쓰기 칸수를 맞춰보세요.',
      raw: errorText
    };
  }

  // 2. SyntaxError (문법 오류)
  if (errorText.includes('SyntaxError')) {
    let detail = '파이썬 문법 규칙에 어긋난 부분이 있어요.';
    let tip = '줄 끝에 콜론(:)을 빠뜨렸거나, 괄호 ( ) 또는 따옴표 " "의 짝이 맞는지 확인하세요.';

    if (errorText.includes('expected \':\'')) {
      detail = 'if, else, for, def 등의 문장 끝에 콜론(:)이 빠졌습니다.';
      tip = '해당 줄 맨 뒤에 퀵 툴바의 [ : ] 버튼을 눌러 콜론을 붙여주세요.';
    } else if (errorText.includes('was never closed')) {
      detail = '열려있는 괄호 ( ), [ ] 또는 따옴표가 닫히지 않았어요.';
      tip = '짝이 맞지 않는 괄호나 따옴표를 찾아 닫아주세요.';
    } else if (errorText.includes('invalid syntax')) {
      detail = '철자가 틀렸거나 기호가 잘못 쓰였습니다.';
    }

    return {
      type: 'SyntaxError (문법 오타/규칙 오류)',
      line: lineNum,
      message: detail,
      tip: tip,
      raw: errorText
    };
  }

  // 3. NameError (이름/변수 오류)
  if (errorText.includes('NameError')) {
    const varMatch = errorText.match(/name '(\w+)' is not defined/);
    const varName = varMatch ? varMatch[1] : '변수나 함수';
    return {
      type: 'NameError (정의되지 않은 이름)',
      line: lineNum,
      message: `'${varName}'라는 이름의 변수나 함수를 파이썬이 찾지 못했습니다.`,
      tip: `철자 오타(대소문자 구별)가 났거나, 윗줄에서 아직 '${varName}'를 만들지 않았는지 확인하세요.`,
      raw: errorText
    };
  }

  // 4. TypeError (자료형/타입 오류)
  if (errorText.includes('TypeError')) {
    let detail = '서로 어울리지 않는 종류(타입)끼리 계산하려 했습니다.';
    let tip = '글자(str)와 숫자(int)를 직접 더할 수 없습니다. int()나 str()로 타입을 맞춰주세요.';
    
    if (errorText.includes('can only concatenate str')) {
      detail = '문자열(글자)에는 문자열만 더할 수 있는데, 숫자를 직접 더하려 했습니다.';
      tip = '숫자 변수 앞에 str(숫자)를 감싸거나, f"{변수}" 형태의 f-string을 써보세요!';
    }

    return {
      type: 'TypeError (데이터 타입 오류)',
      line: lineNum,
      message: detail,
      tip: tip,
      raw: errorText
    };
  }

  // 5. ValueError (값 오류)
  if (errorText.includes('ValueError')) {
    return {
      type: 'ValueError (올바르지 않은 값)',
      line: lineNum,
      message: '전달된 값이 함수가 기대하는 형식과 다릅니다.',
      tip: 'int("안녕") 처럼 숫자가 아닌 글자를 정수로 바꾸려 했을 수 있습니다.',
      raw: errorText
    };
  }

  // 6. ZeroDivisionError
  if (errorText.includes('ZeroDivisionError')) {
    return {
      type: 'ZeroDivisionError (0으로 나누기 오류)',
      line: lineNum,
      message: '수학에서는 어떤 수도 0으로 나눌 수 없습니다!',
      tip: '나누는 수(분모)가 0이 되지 않도록 값을 확인해보세요.',
      raw: errorText
    };
  }

  // 기본 fallback
  return {
    type: '코드 실행 중 오류 발생',
    line: lineNum,
    message: '코드를 실행하는 도중 예기치 않은 오류가 발생했습니다.',
    tip: '에러 줄 번호 근처의 코드와 변수 철자를 차근차근 살펴보세요.',
    raw: errorText
  };
}

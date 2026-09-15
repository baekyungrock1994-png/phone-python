// Pyodide WebAssembly 인터프리터 런타임 래퍼

class PythonInterpreter {
  constructor() {
    this.pyodide = null;
    this.isLoading = false;
    this.isReady = false;
    this.onOutput = null;     // (text, type: 'stdout'|'stderr'|'system') => void
    this.onStatusChange = null; // (status: 'loading'|'ready'|'running'|'error') => void
    this.inputResolver = null; // input() 대기용 Promise resolver
  }

  // Pyodide 초기화 로드
  async init() {
    if (this.isReady || this.isLoading) return;
    this.isLoading = true;
    if (this.onStatusChange) this.onStatusChange('loading');

    try {
      // CDN에서 Pyodide 로드 (글로벌 loadPyodide 사용)
      if (typeof window.loadPyodide === 'undefined') {
        await this._loadScript('https://cdn.jsdelivr.net/pyodide/v0.26.2/full/pyodide.js');
      }

      this.pyodide = await window.loadPyodide({
        stdout: (text) => {
          if (this.onOutput) this.onOutput(text, 'stdout');
        },
        stderr: (text) => {
          if (this.onOutput) this.onOutput(text, 'stderr');
        }
      });

      // 파이썬 환경 설정: JS 프롬프트 콜백을 input()과 연결
      await this.pyodide.runPythonAsync(`
import sys
from js import window

def _custom_input(prompt_text=""):
    # JS에 프롬프트 메시지를 전달하고 값을 동기/비동기로 수신
    if prompt_text:
        print(prompt_text, end="")
    val = window.pyInputPrompt(str(prompt_text))
    return str(val)

# builtins.input 교체
import builtins
builtins.input = _custom_input
`);

      this.isReady = true;
      this.isLoading = false;
      if (this.onStatusChange) this.onStatusChange('ready');
      if (this.onOutput) this.onOutput('🐍 파이썬 3.11 엔진이 성공적으로 준비되었습니다!', 'system');
    } catch (err) {
      this.isLoading = false;
      if (this.onStatusChange) this.onStatusChange('error');
      if (this.onOutput) this.onOutput(`엔진 로딩 실패: ${err.message}`, 'stderr');
      console.error('Pyodide 로드 실패:', err);
    }
  }

  _loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = (e) => reject(new Error(`스크립트 로드 오류: ${src}`));
      document.head.appendChild(script);
    });
  }

  // 파이썬 코드 실행
  async runCode(code) {
    if (!this.isReady) {
      if (this.isLoading) {
        if (this.onOutput) this.onOutput('파이썬 엔진을 로딩 중입니다. 잠시만 기다려주세요...', 'system');
        return { success: false, error: '엔진 로딩 중' };
      }
      await this.init();
    }

    if (this.onStatusChange) this.onStatusChange('running');

    try {
      // async 실행을 통해 JS 이벤트 루프와 비동기 input 처리 가능
      await this.pyodide.runPythonAsync(code);
      if (this.onStatusChange) this.onStatusChange('ready');
      return { success: true };
    } catch (err) {
      if (this.onStatusChange) this.onStatusChange('ready');
      return { success: false, error: err.message || String(err) };
    }
  }

  // 실시간 REPL 한 줄/명령어 대화형 평가 (>>> 프롬프트용)
  async evaluateInteractive(command) {
    if (!this.isReady) {
      await this.init();
    }

    try {
      // 파이썬 code.InteractiveConsole 방식:
      // 단일 식(Expression)이면 결과를 자동으로 repr() 출력하고, 문(Statement)이면 조용히 실행
      const pyScript = `
import sys
import code
import traceback

def _repl_eval(cmd):
    try:
        # 먼저 eval 시도 (결과값을 즉시 리턴)
        val = eval(cmd, globals())
        if val is not None:
            print(repr(val))
    except SyntaxError:
        # 문장(할당, import, if 등)이면 exec 실행
        try:
            exec(cmd, globals())
        except Exception as e:
            traceback.print_exc(limit=0)
    except Exception as e:
        traceback.print_exc(limit=0)

_repl_eval(${JSON.stringify(command)})
`;
      await this.pyodide.runPythonAsync(pyScript);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || String(err) };
    }
  }
}

export const interpreter = new PythonInterpreter();

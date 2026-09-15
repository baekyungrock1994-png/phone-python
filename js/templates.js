// 입문자를 위한 실습 퀘스트 & 템플릿 데이터

export const QUESTS = [
  {
    id: 'hello-world',
    level: 1,
    levelText: '입문 1단계',
    title: '자기소개 출력하기',
    desc: '변수를 만들고 print() 함수로 나의 이름과 취미를 멋지게 출력해봅시다.',
    concepts: ['print', '변수', '문자열'],
    blueprint: {
      goal: '스마트폰에서 실행되는 첫 번째 자기소개 프로그램 만들기',
      inputs: '이름(name = "홍길동"), 나이(age = 20), 취미(hobby = "코딩")',
      logic: '변수들에 값을 담고 f-string(포맷팅)으로 문장을 조립하기',
      output: '안녕하세요! 저는 홍길동이고 20살입니다. 취미는 코딩이에요.'
    },
    code: `# 🌟 [퀘스트 1] 나만의 자기소개 프로그램
# 변수에 내 정보를 저장해봐요!

name = "파이포켓"
age = 1
hobby = "스마트폰으로 파이썬 배우기"

# f-string을 활용하여 깔끔하게 출력합니다
print("=" * 30)
print(f"👋 안녕하세요! 제 이름은 {name}입니다.")
print(f"🎂 나이는 {age}살이고,")
print(f"❤️ 취미는 [{hobby}] 입니다!")
print("=" * 30)
print("성공적으로 실행되었습니다! 축하해요 🎉")
`
  },
  {
    id: 'simple-calc',
    level: 1,
    levelText: '입문 1단계',
    title: '두 수의 덧셈 계산기',
    desc: '사용자에게 숫자 2개를 input()으로 입력받아 합을 계산해주는 미니 계산기입니다.',
    concepts: ['input', 'int()변환', '사칙연산'],
    blueprint: {
      goal: '두 숫자를 입력받아 더한 결과를 알려주는 계산기',
      inputs: '첫 번째 숫자 a, 두 번째 숫자 b (input으로 받기)',
      logic: 'input()으로 받은 글자를 int()로 정수 숫자로 바꾼 뒤 더하기',
      output: '두 수의 합 출력'
    },
    code: `# 🌟 [퀘스트 2] 두 수 덧셈 계산기
print("=== ➕ 스마트 미니 덧셈기 ===")

# input() 함수는 스마트폰 화면에 입력창을 띄워줍니다!
num1_str = input("첫 번째 숫자를 입력하세요: ")
num2_str = input("두 번째 숫자를 입력하세요: ")

# input으로 받은 값은 문자이므로 int()를 통해 정수로 변환해야 계산돼요
num1 = int(num1_str)
num2 = int(num2_str)

result = num1 + num2

print(f"👉 {num1} + {num2} = {result} 입니다!")
`
  },
  {
    id: 'even-odd',
    level: 2,
    levelText: '입문 2단계',
    title: '홀수? 짝수? 판별기',
    desc: '조건문 if-else와 나머지 연산자(%)를 사용하여 숫자가 짝수인지 홀수인지 판단합니다.',
    concepts: ['if-else', '나머지(%)', '조건문'],
    blueprint: {
      goal: '입력된 수가 짝수인지 홀수인지 구별하기',
      inputs: '판별할 자연수 1개 (number)',
      logic: '만약 2로 나눈 나머지(number % 2)가 0이면 짝수, 아니면 홀수',
      output: '판별 결과 출력'
    },
    code: `# 🌟 [퀘스트 3] 홀짝 판별기
print("=== 🎯 홀수/짝수 판별기 ===")

val = int(input("숫자를 하나 입력하세요: "))

# 2로 나눈 나머지가 0이면 짝수입니다
if val % 2 == 0:
    print(f"💡 {val}은(는) [짝수] 입니다!")
else:
    print(f"💡 {val}은(는) [홀수] 입니다!")
`
  },
  {
    id: 'up-down-game',
    level: 3,
    levelText: '입문 3단계',
    title: '업다운(Up-Down) 숫자 맞추기',
    desc: '컴퓨터가 1~30 사이 비밀 숫자를 정하고, 사용자가 맞출 때까지 힌트를 주는 게임입니다.',
    concepts: ['random', 'while반복문', 'break'],
    blueprint: {
      goal: '1부터 30까지의 비밀 숫자를 맞추는 게임',
      inputs: '사용자의 추측 숫자 (guess)',
      logic: '맞출 때까지 while 반복! 컴퓨터 수보다 작으면 UP, 크면 DOWN, 같으면 승리',
      output: '시도 횟수 및 축하 메시지'
    },
    code: `# 🌟 [퀘스트 4] 업다운(Up-Down) 숫자 맞추기
import random

# 1부터 30 사이의 무작위 비밀 번호 생성
secret = random.randint(1, 30)
tries = 0

print("🎮 1부터 30 사이의 숫자를 맞춰보세요!")

while True:
    guess = int(input("숫자를 입력하세요: "))
    tries += 1
    
    if guess < secret:
        print("⬆️ UP! 더 큰 숫자입니다.")
    elif guess > secret:
        print("⬇️ DOWN! 더 작은 숫자입니다.")
    else:
        print(f"🎉 정답입니다! {tries}번 만에 맞추셨어요!")
        break
`
  },
  {
    id: 'multiplication-table',
    level: 2,
    levelText: '입문 2단계',
    title: '스마트 구구단 출력기',
    desc: 'for 반복문과 range() 함수를 연습하여 원하는 단수의 구구단을 깔끔하게 출력합니다.',
    concepts: ['for', 'range', '반복문'],
    blueprint: {
      goal: '원하는 구구단 단수를 입력받아 1부터 9까지 곱셈표 출력',
      inputs: '출력하고 싶은 단수 (dan)',
      logic: 'for i in range(1, 10): 을 돌며 dan * i 계산하기',
      output: 'dan x i = 결과 9줄 출력'
    },
    code: `# 🌟 [퀘스트 5] 스마트 구구단 출력기
dan = int(input("몇 단을 출력할까요? (예: 3): "))

print(f"=== 📖 [구구단 {dan}단] ===")

for i in range(1, 10):
    print(f"  {dan} x {i} = {dan * i}")

print("=========================")
`
  }
];

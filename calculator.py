def calculator():
    print("간단한 계산기 프로그램입니다.")
    print("1. 덧셈")
    print("2. 뺄셈")
    print("3. 곱셈")
    print("4. 나눗셈")
    
    choice = input("원하는 연산을 선택하세요 (1-4): ")
    
    if choice in ['1', '2', '3', '4']:
        num1 = float(input("첫 번째 숫자를 입력하세요: "))
        num2 = float(input("두 번째 숫자를 입력하세요: "))
        
        if choice == '1':
            print(f"결과: {num1} + {num2} = {num1 + num2}")
        elif choice == '2':
            print(f"결과: {num1} - {num2} = {num1 - num2}")
        elif choice == '3':
            print(f"결과: {num1} * {num2} = {num1 * num2}")
        elif choice == '4':
            if num2 != 0:
                print(f"결과: {num1} / {num2} = {num1 / num2}")
            else:
                print("0으로 나눌 수 없습니다!")
    else:
        print("잘못된 선택입니다.")

if __name__ == "__main__":
    calculator() 
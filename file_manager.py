def write_to_file():
    filename = input("저장할 파일 이름을 입력하세요: ")
    content = input("파일에 저장할 내용을 입력하세요: ")
    
    try:
        with open(filename, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"'{filename}' 파일에 내용이 저장되었습니다.")
    except Exception as e:
        print(f"파일 저장 중 오류가 발생했습니다: {e}")

def read_from_file():
    filename = input("읽을 파일 이름을 입력하세요: ")
    
    try:
        with open(filename, 'r', encoding='utf-8') as file:
            content = file.read()
            print("\n=== 파일 내용 ===")
            print(content)
    except FileNotFoundError:
        print(f"'{filename}' 파일을 찾을 수 없습니다.")
    except Exception as e:
        print(f"파일 읽기 중 오류가 발생했습니다: {e}")

def append_to_file():
    filename = input("추가할 파일 이름을 입력하세요: ")
    content = input("추가할 내용을 입력하세요: ")
    
    try:
        with open(filename, 'a', encoding='utf-8') as file:
            file.write('\n' + content)
        print(f"'{filename}' 파일에 내용이 추가되었습니다.")
    except Exception as e:
        print(f"파일 추가 중 오류가 발생했습니다: {e}")

def main():
    while True:
        print("\n1. 파일에 내용 쓰기")
        print("2. 파일 내용 읽기")
        print("3. 파일에 내용 추가")
        print("4. 종료")
        
        choice = input("원하는 작업을 선택하세요 (1-4): ")
        
        if choice == '1':
            write_to_file()
        elif choice == '2':
            read_from_file()
        elif choice == '3':
            append_to_file()
        elif choice == '4':
            print("프로그램을 종료합니다.")
            break
        else:
            print("잘못된 선택입니다.")

if __name__ == "__main__":
    main() 
class StudentManager:
    def __init__(self):
        self.students = {}
    
    def add_student(self):
        name = input("학생 이름을 입력하세요: ")
        age = int(input("학생 나이를 입력하세요: "))
        grade = int(input("학생 학년을 입력하세요: "))
        
        self.students[name] = {
            'age': age,
            'grade': grade
        }
        print(f"{name} 학생이 추가되었습니다.")
    
    def show_students(self):
        if not self.students:
            print("등록된 학생이 없습니다.")
            return
        
        print("\n=== 학생 목록 ===")
        for name, info in self.students.items():
            print(f"이름: {name}, 나이: {info['age']}, 학년: {info['grade']}")
    
    def find_student(self):
        name = input("찾을 학생의 이름을 입력하세요: ")
        if name in self.students:
            info = self.students[name]
            print(f"이름: {name}, 나이: {info['age']}, 학년: {info['grade']}")
        else:
            print("해당 학생을 찾을 수 없습니다.")

def main():
    manager = StudentManager()
    
    while True:
        print("\n1. 학생 추가")
        print("2. 학생 목록 보기")
        print("3. 학생 찾기")
        print("4. 종료")
        
        choice = input("원하는 작업을 선택하세요 (1-4): ")
        
        if choice == '1':
            manager.add_student()
        elif choice == '2':
            manager.show_students()
        elif choice == '3':
            manager.find_student()
        elif choice == '4':
            print("프로그램을 종료합니다.")
            break
        else:
            print("잘못된 선택입니다.")

if __name__ == "__main__":
    main() 
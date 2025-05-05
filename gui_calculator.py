import tkinter as tk
from tkinter import messagebox

class Calculator:
    def __init__(self, root):
        self.root = root
        self.root.title("간단한 계산기")
        
        # 입력 필드
        self.entry = tk.Entry(root, width=20, font=('Arial', 14))
        self.entry.grid(row=0, column=0, columnspan=4, padx=5, pady=5)
        
        # 버튼 생성
        buttons = [
            '7', '8', '9', '/',
            '4', '5', '6', '*',
            '1', '2', '3', '-',
            '0', '.', '=', '+'
        ]
        
        # 버튼 배치
        row = 1
        col = 0
        for button in buttons:
            cmd = lambda x=button: self.click(x)
            tk.Button(root, text=button, width=5, height=2, command=cmd).grid(row=row, column=col)
            col += 1
            if col > 3:
                col = 0
                row += 1
    
    def click(self, key):
        if key == '=':
            try:
                result = eval(self.entry.get())
                self.entry.delete(0, tk.END)
                self.entry.insert(tk.END, str(result))
            except:
                messagebox.showerror("오류", "계산할 수 없는 식입니다.")
        else:
            self.entry.insert(tk.END, key)

if __name__ == "__main__":
    root = tk.Tk()
    calculator = Calculator(root)
    root.mainloop() 
# 구구단 출력
n = int(input("몇 단까지 출력할까요? "))
for i in range(2, n + 1):
    print(f"\n{i}단")
    for j in range(1, 10):
        print(f"{i} x {j} = {i*j}")

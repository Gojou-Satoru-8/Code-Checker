num = int(input("Enter the number: "))
if num < 1:
    print(f"{num} is not a prime number")
elif num == 1:
    print(f"1 is neither prime nor composite")
else:
    count_divisors = 0
    for i in range(2, num // 2):
        count_divisors += 1 if num % i == 0 else 0
    print(f"{num} is a prime number") if count_divisors == 0 else print(
        f"{num} is not a prime number")

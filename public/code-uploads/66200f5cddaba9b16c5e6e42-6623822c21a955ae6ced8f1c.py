# Python program to check Armstrong number:
def is_armstrong(number):
    sum_of_digits_cubed = 0
    for digit in number:
        sum_of_digits_cubed += int(digit) ** 3
    # return sum_of_digits_cubed == int(number)
    return f"{number} is an Armstrong number." if sum_of_digits_cubed == int(number) else f"{number} is not an Armstrong number."


num = input("Enter the number to check Armstrong: ")
# print(f"{num} is an Armstrong number." if is_armstrong(
#     num) else f"{num} is not an Armstrong number.")

print(is_armstrong(num))

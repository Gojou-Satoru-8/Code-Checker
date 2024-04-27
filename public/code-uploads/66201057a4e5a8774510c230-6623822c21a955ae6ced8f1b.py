def gcd(num1, num2):
    # rem = num1 % num2
    # while (rem != 0):
    #     num1 = num2
    #     num2 = rem
    #     rem = num1 % num2
    # return num2
    while num2 != 0:
        num1, num2 = num2, num1 % num2
    return num1


def gcd_recur(num1, num2):
    if num2 == 0:
        return num1
    else:
        return gcd_recur(num2, num1 % num2)


print(gcd(12, 9), gcd(9, 12))
print(gcd(10, 8), gcd(5, 10))
print(gcd_recur(12, 9), gcd_recur(9, 12))
print(gcd_recur(10, 8), gcd_recur(5, 10))

# Python program to find sum of array:

from functools import reduce
size = int(input(f"Enter the size of the array: "))
print(f"Enter elements into the array: ")
array = [int(input(f"Enter the {i+1}th element: ")) for i in range(size)]

# Using sum() function:
print(f"Sum of the array (using sum() function): {sum(array)}")

# Manually looping and adding:
sum_of_elements = 0
for num in array:
    sum_of_elements += num
print(f"Sum of the array (using manual iteration): {sum_of_elements}")

# Using reduce function:
total = reduce(lambda x, y: x + y, array)
print(f"Sum of the array (using functools.reduce()) function: {total}")

# Python program to extract unique values from a dictionary:
# Remember: PHP had an inbuilt array_unique() function to return a new array of unique values only.

size = int(input("Enter the size of the dictionary: "))
my_dict = {
    input(f"Enter {i + 1}th key: "): input(f"Enter {i + 1}th value: ") for i in range(size)}

unique_values1 = []
# Method 1:
for key in my_dict:
    if my_dict[key] not in unique_values1:
        unique_values1.append(my_dict[key])

unique_values2 = []
for value in my_dict.values():
    if value not in unique_values2:
        unique_values2 += [value]

print(unique_values1)
print(unique_values2)

# Note: The above differs from a list of values only occuring once.
count_values = {}
for value in my_dict.values():
    if value in count_values:
        count_values[value] += 1
    else:
        count_values.update({value: 1})

single_frequency_values = [
    value for value in count_values if count_values.get(value) == 1]

print(f"Values only occuring once: {single_frequency_values}")

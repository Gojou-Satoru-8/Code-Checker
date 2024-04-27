my_list = [num for num in range(11)]
evens = [num for num in my_list if num % 2 == 0]
odd = [num for num in my_list if num % 2 != 0]
squares = [num ** 2 for num in my_list]
even_or_odd = [{num : "even"} if num % 2 == 0 else {num: "odd"} for num in my_list]
print("My List: ", my_list)
print("Evens: ", evens)
print("Odd: ", odd)
print("Squares: ", squares)
print("Even or odd", even_or_odd)
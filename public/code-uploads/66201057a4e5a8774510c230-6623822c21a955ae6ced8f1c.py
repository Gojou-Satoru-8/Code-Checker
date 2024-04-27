def add(num1, num2):
    return num1 + num2

def subtract(num1, num2):
    return num1 - num2

def multiply(num1, num2):
    return num1 * num2

def divide(num1, num2):
    return num1 / num2

def quotient(num1, num2):
    return num1 // num2

def power(num1, num2):
    return num1 ** num2

def remainder(num1, num2):
    return num1 % num2


# Let's overengineer stuff:
def calc(num1, func, num2):
    return func(num1, num2)


def program():
    operations = {
        "+": add,
        "-": subtract,
        "*": multiply,
        "/": divide,
        "//": quotient,
        "exp": power,
        "rem": remainder, 
    }

    a = float(input("What's the first number:\t"))
    should_continue = "y"
    
    while should_continue == "y":
        
        operation_symbol = input("Choose your operation:\nType + for addition, - for subtraction,\n* for multiplication,/ for division,// for quotient,\nexp for exponent, or rem for remainder:\n")

        if operations.get(operation_symbol):
            operation = operations[operation_symbol]
        else: 
            print("Invalid input")
            return
    
        b = float(input("What's the second number:\t"))
        result = calc(a, operation, b)
        print(f"{a} {operation_symbol} {b} = {result}")
        should_continue = input(f"Continue calculating with {result}? Type 'y' or 'n':\t")
        
        if should_continue == "n":
            begin_newcalc = input("Begin new calculation or stop calculator? Type 'new' or 'stop':\t")
            if  begin_newcalc == "new":
                print("Starting new calculation:\n")
                program()
            elif begin_newcalc == "stop":
                return
            else:
                print("Invalid option")
                return

        elif should_continue == "y":
            a = result        
        else:
            print("Invalid option")
            return

program()

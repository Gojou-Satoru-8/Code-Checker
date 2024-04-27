# Python progam to find area of a circle

import math

r = float(input("Enter radius of circle: "))
# area = math.pi * r ** 2
area = math.pi * pow(r, 2)
print(f"Area of circle: {round(area,2)} sq. units")

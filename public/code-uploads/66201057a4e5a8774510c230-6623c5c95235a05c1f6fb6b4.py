# Python program to see if a string can be made from the letters of another string:

def build_string(str1, str2):
    characters_count1 = {}
    characters_count2 = {}
    for c in str1:
        if c in characters_count1:
            characters_count1[c] += 1
        else:
            characters_count1[c] = 1
    for c in str2:
        count = characters_count2.get(c)
        if count:   # i.e, character c is present in characters_count2
            characters_count2.update([(c, count + 1)])
        # If c is not present, characters_count2.get(c) will return None, ie count = None
        else:
            characters_count2.update([(c, 1)])

    is_adundant = {}
    for c in characters_count1:
        if c not in characters_count2:
            is_adundant.update([(c, False)])
        else:
            # if characters_count2.get(c) >= characters_count1.get(c):
            #     is_adundant.update([(c, True)])
            # else:
            #     is_adundant.update([(c, False)])
            # Above logic is the classical "If True -> True, else False" case, so we can simplify"
            is_adundant.update(
                [(c, characters_count2.get(c) >= characters_count2.get(c))])
    return all(is_adundant.values())


string1 = input("Enter the first string: ")
string2 = input(f"Enter the second string: ")
print(f"{string1} can be built using letters from {string2}") if build_string(
    string1, string2) else print(f"{string1} can't be built using letters from {string2}")

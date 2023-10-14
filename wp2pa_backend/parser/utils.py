def obj_to_dict(obj):
    classes = [int, float, str]
    new_dict = {}

    if type(obj) == list:
        new_dict = []
        for e in obj:
            if type(e) in classes:
                new_dict.append(e)
            else:
                new_dict.append(obj_to_dict(e))

    elif type(obj) is None:
        new_dict = None

    else:
        for key in obj.__dict__:
            if type(obj.__dict__[key]) in classes:
                new_dict[key] = obj.__dict__[key]

            elif obj.__dict__[key] is None:
                new_dict[key] = None

            else:
                new_dict[key] = obj_to_dict(obj.__dict__[key])

    return new_dict

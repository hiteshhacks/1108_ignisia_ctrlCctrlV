import numpy as np

def detect_outliers(values):
    arr = np.array(values)
    mean = np.mean(arr)
    std = np.std(arr)

    outliers = []

    for v in values:
        if abs(v - mean) > 3 * std:
            outliers.append(v)

    return outliers
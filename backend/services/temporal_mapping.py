def temporal_mapper(tests):
    timeline = {}

    for test_name, test_value, unit, refrence_range, test_date in tests:
        if test_name not in timeline:
            timeline[test_name] = []

        timeline[test_name].append({
            "time": test_date,
            "value": test_value,
            "unit": unit,
            "range": refrence_range
        })

    return timeline
import json
import os

def appendEntry(entry):
    logPath = f"{entry['account']}.json"
    if not os.path.exists(logPath):
        with open(logPath, "w") as file:
            json.dump([], file)
    with open(logPath, "r") as file:
        data = json.load(file)
        data.append(entry)
    with open(logPath, "w") as file:
        json.dump(data, file)

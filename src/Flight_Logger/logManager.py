import json
import os

def appendEntry(entry):
    print(entry)
    logPath = f"{entry['account']}.json"
        
    with open(logPath, "a+") as file:
        file.write(json.dumps(entry) + "\n")
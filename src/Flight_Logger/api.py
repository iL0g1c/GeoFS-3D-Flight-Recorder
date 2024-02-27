import requests
import json

def getMapUsers():
    response = requests.post(
        "https://mps.geo-fs.com/map",
        json = {}
    )
    response_body = json.loads(response.text)
    userList = response_body["users"]
    return userList
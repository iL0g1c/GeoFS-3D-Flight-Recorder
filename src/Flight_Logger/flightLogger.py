import click
import time
from api import getMapUsers
from logManager import appendEntry

# logPath <callsign>
# co
# [1] latitude
# [2] longitude
# [3] altitude
# [4] east/west angle (negative is west)
# [5] up/down angle (negative is up)
# [6] north/south angle (negative is north)
# st
# [2] (as) air speed


@click.command()
@click.option("--acid", type=int)
def logPath(acid):
    while True:
        users = getMapUsers()
        targetUser = None
        for user in users:
            if user != None:
                if user["acid"] == acid:
                    targetUser = user
                    break
        if targetUser is None:
            print(f"User {acid} not found")
        else:
            appendEntry({
                "account": targetUser["acid"],
                "latitude": targetUser["co"][0],
                "longitude": targetUser["co"][1],
                "altitude": targetUser["co"][2],
                "rotation": [targetUser["co"][3], targetUser["co"][4], targetUser["co"][5]],
                "speed": targetUser["st"]["as"]
            })
        time.sleep(0.2)

if __name__ in "__main__":
    logPath()
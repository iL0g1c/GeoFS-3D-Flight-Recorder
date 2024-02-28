import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
import pygame
from pygame.locals import *
import json
import math

points = []
rawData = []
FILE_PATH = "400813.json"
EARTH_RADIUS = 6371000

# Load the data
with open(FILE_PATH, "r") as f:
    rawData = json.load(f)

# Convert the data to 3D coordinates
for point in rawData:
    x = (EARTH_RADIUS + point["altitude"]) * math.cos(math.radians(point["latitude"])) * math.cos(math.radians(point["longitude"]))
    y = (EARTH_RADIUS + point["altitude"]) * math.cos(math.radians(point["latitude"])) * math.sin(math.radians(point["longitude"]))                                                 
    z = (EARTH_RADIUS + point["altitude"]) * math.sin(math.radians(point["latitude"]) - EARTH_RADIUS)
    points.append((x, y, z))

# Initialize pygame
pygame.init()
screen = pygame.display.set_mode((400, 400))
fig = plt.figure()
ax = fig.add_subplot(111, projection="3d")

# Plot the points
x, y, z = zip(*points)
ax.plot(x, y, z, marker="o", linestyle="-")

# Initial camera position
elevation = 30
azimuth = 30
ax.view_init(elevation, azimuth)

# Display the plot
plt.show(block=False)

running = True
while running:
    for event in pygame.event.get():
        if event.type == QUIT:
            running = False
        elif event.type == KEYDOWN:
            if event.key == K_UP:
                elevation += 10
            elif event.key == K_DOWN:
                elevation -= 10
            elif event.key == K_LEFT:
                azimuth -= 10
            elif event.key == K_RIGHT:
                azimuth += 10

            # Update the camera view
            ax.view_init(elevation, azimuth)
            plt.draw()

    pygame.time.delay(50)

# Quit pygame
pygame.quit()

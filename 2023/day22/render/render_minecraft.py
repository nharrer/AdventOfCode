import sys
import json
import numpy as np
import os

sys.path.append('..')
from solve_day22 import Sandbox, INPUT_FILE  # noqa: E402


def dumpMinecraft(sandbox, filename):
    objects = []
    xmin = min(map(lambda b: min(b.pos1[0], b.pos2[0]), sandbox.bricks))
    xmax = max(map(lambda b: max(b.pos1[0], b.pos2[0]), sandbox.bricks)) + 1
    ymin = min(map(lambda b: min(b.pos1[1], b.pos2[1]), sandbox.bricks))
    ymax = max(map(lambda b: max(b.pos1[1], b.pos2[1]), sandbox.bricks)) + 1
    xoffs = (xmax - xmin) / 2
    yoffs = (ymax - ymin) / 2
    for brick in sandbox.bricks:
        pos = brick.pos1
        end = brick.pos2
        xdir = int(np.sign(brick.pos2[0] - brick.pos1[0]))
        ydir = int(np.sign(brick.pos2[1] - brick.pos1[1]))
        zdir = int(np.sign(brick.pos2[2] - brick.pos1[2]))
        while True:
            coords = ((pos[0] - xoffs) * 16, pos[2] * 16, (pos[1] - yoffs) * 16)
            model = 'purple_stained_glass'
            if xdir != 0:
                model = 'lime_stained_glass'
            elif ydir != 0:
                model = 'red_stained_glass'

            objects.append({'type': 'block', 'model': model, 'offset': coords})
            if pos == end:
                break
            pos = (pos[0] + xdir, pos[1] + ydir, pos[2] + zdir)
    for x in range(xmin - 10, xmax + 10):
        for y in range(ymin - 10, ymax + 10):
            coords = ((x - xoffs) * 16, 0, (y - yoffs) * 16)
            objects.append({'type': 'block', 'model': 'grass_block', 'offset': coords})

    with open(filename, 'w') as outfile:
        outfile.write('var objects = ')
        json.dump(objects, outfile)

    print(f'Wrote to {filename}')


if __name__ == '__main__':
    sandbox = Sandbox(os.path.join('..', INPUT_FILE))
    dumpMinecraft(sandbox, './minecraft.js')

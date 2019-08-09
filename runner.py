import compiler
import sqlite3
from time import sleep, time
from datetime import datetime
import numpy as np
from PIL import Image


class Runner(object):
    def __init__(self):
        self.reg = [0, 0]
        self.idata = np.zeros([100, 100, 3], dtype=np.uint8)
        self.idata.fill(255)
        self.width = 100
        self.height = 100
        self.playerData = []

    def setPlayerData(self, playerData):
        comp = compiler.PmoToPython()
        self.playerData = [
            list(data[:8]) + ["\n".join(comp.parse_text(data[8]))] for data in playerData
        ]

    def movePlayer(self, index, dir, amount):
        dir = dir % 4
        if dir == 0:
            self.playerData[index][1] += amount
        elif dir == 1:
            self.playerData[index][2] += amount
        elif dir == 2:
            self.playerData[index][1] -= amount
        elif dir == 3:
            self.playerData[index][2] -= amount

        if (self.playerData[index][1] < 0):
            self.playerData[index][1] = 0
        if (self.playerData[index][1] >= self.width):
            self.playerData[index][1] = self.width - 1
        if (self.playerData[index][2] < 0):
            self.playerData[index][2] = 0
        if (self.playerData[index][2] >= self.height):
            self.playerData[index][2] = self.height - 1

    def swapReg(self):
        _tmp = self.reg[0]
        self.reg[0] = self.reg[1]
        self.reg[1] = _tmp

    def checkColor(self, index):
        color = self.idata[self.playerData[index][2]][self.playerData[index][1]]
        if (color[0] == 0 and color[1] == 0 and color[2] == 0):
            self.reg[0] = 2
        elif (color[0] == self.playerData[index][3] and
              color[1] == self.playerData[index][4] and
              color[2] == self.playerData[index][5]):
            self.reg[0] = 0
        else:
            self.reg[0] = 1

    def setReg(self, value):
        self.reg[0] = value

    def drawPlayer(self, index):
        self.idata[self.playerData[index][2]][self.playerData[index][1]] = (
            [self.playerData[index][3], self.playerData[index][4], self.playerData[index][5]]
        )

    def addReg(self, value):
        self.reg[0] += value
        if self.reg[0] < 0:
            self.reg[0] += 256 * 8
        if self.reg[0] > 255:
            self.reg[0] = self.reg[0] % 256

    def getReg(self):
        return self.reg[0]

    def run(self):
        for i in range(len(self.playerData)):
            self.reg[0] = self.playerData[i][6]
            self.reg[1] = self.playerData[i][7]
            code = self.playerData[i][8]
            exec(code)
            self.playerData[i][6] = self.reg[0]
            self.playerData[i][7] = self.reg[1]
        print([data[1:3] + data[6:8] for data in self.playerData])


class Synchronizer(object):
    def __init__(self):
        self.runner = Runner()
        self.tps = 10
        self.fetch_from_database()

    def loop(self):
        fetched = False
        while True:
            second = datetime.now().second
            if not fetched and second == 30:
                self.fetch_from_database()
                fetched = True
            elif second < 30:
                fetched = False
            frame_start = time()
            self.runner.run()
            to_sleep = (1.0 / self.tps) - (time() - frame_start)
            if to_sleep < 0:
                print("FRAME TOOK TOO LONG")
            else:
                sleep(to_sleep)

    def fetch_from_database(self):
        with sqlite3.connect('database.db') as conn:
            c = conn.cursor()
            # Store positions & registers
            regdata = []
            for data in self.runner.playerData:
                regdata.append([data[1], data[2], data[6], data[7], data[0]])
            c.executemany(
                'UPDATE users SET posx = ? , posy = ? , reg0 = ? , reg1 = ? WHERE name = ? ',
                regdata
            )
            all_data = c.execute('SELECT * FROM users').fetchall()
            self.runner.setPlayerData(all_data)
            jsCompiler = compiler.PmoToJAvascript()

            jsHeader = "playerData = [\n"
            for data in all_data:
                jsHeader += "['{}', {}, {}, {}, {}, {}, {}, {}, '{}'],\n".format(
                    *data[:8], "".join(jsCompiler.parse_text(data[8]))
                )
            jsHeader += "]\n"
            jsHeader += "timestamp = new Date('{}')\n".format(datetime.now().isoformat())

            with open("jsout.js", "w") as fw:
                fw.write(jsHeader)

            print("Updated data")
            print(self.runner.playerData[0][8])
            im = Image.fromarray(self.runner.idata)
            im.save("image.png")


if __name__ == "__main__":
    s = Synchronizer()
    try:
        s.loop()
    except KeyboardInterrupt:
        s.fetch_from_database()
        pass

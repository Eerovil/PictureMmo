import compiler
import sqlite3
from time import sleep, time
from datetime import datetime


class Runner(object):
    def __init__(self):
        self.reg = [0, 0]
        self.idata = []
        self.width = 100
        self.height = 100
        self.playerData = []
        for x in range(self.width):
            self.idata.append([])
            for y in range(self.height):
                self.idata[x].append([0, 0, 0])

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
        elif dir == 1:
            self.playerData[index][1] -= amount
        elif dir == 1:
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
        color = self.idata[self.playerData[index][1]][self.playerData[index][2]]
        if (color[0] == 0 and color[1] == 0 and color[2] == 0):
            self.reg[0] = 2
        elif (color[0] == self.playerData[index][2] and
              color[1] == self.playerData[index][3] and
              color[2] == self.playerData[index][4]):
            self.reg[0] = 0
        else:
            self.reg[0] = 1

    def setReg(self, value):
        self.reg[0] = value

    def drawPlayer(self, index):
        self.idata[self.playerData[index][1]][self.playerData[index][2]] = (
            [self.playerData[index][2], self.playerData[index][3], self.playerData[index][4]]
        )

    def addReg(self, value):
        self.reg[0] += value

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
        print([data[1:3] for data in self.playerData])


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
            self.runner.setPlayerData(c.execute('SELECT * FROM users').fetchall())
            print("Updated data")


if __name__ == "__main__":
    s = Synchronizer()
    try:
        s.loop()
    except KeyboardInterrupt:
        pass

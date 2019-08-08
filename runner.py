class Runner(object):
    def __init__(self, playerData):
        self.reg = [0, 0]
        self.idata = []
        self.width = 100
        self.height = 100
        self.playerPos = [[data[1], data[2]] for data in playerData]
        self.playerData = playerData
        for x in range(self.width):
            self.idata.append([])
            for y in range(self.height):
                self.idata[x].append([0, 0, 0])

    def movePlayer(self, index, dir, amount):
        dir = dir % 4
        if dir == 0:
            self.playerPos[index][0] += amount
        elif dir == 1:
            self.playerPos[index][1] += amount
        elif dir == 1:
            self.playerPos[index][0] -= amount
        elif dir == 1:
            self.playerPos[index][1] -= amount

        if (self.playerPos[index][0] < 0):
            self.playerPos[index][0] = 0
        if (self.playerPos[index][0] >= self.width):
            self.playerPos[index][0] = self.width - 1
        if (self.playerPos[index][1] < 0):
            self.playerPos[index][1] = 0
        if (self.playerPos[index][1] >= self.height):
            self.playerPos[index][1] = self.height - 1

    def swapReg(self):
        _tmp = self.reg[0]
        self.reg[0] = self.reg[1]
        self.reg[1] = _tmp

    def checkColor(self, index):
        color = self.idata[self.playerPos[index][0]][self.playerPos[index][1]]
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
        self.idata[self.playerPos[index][0]][self.playerPos[index][1]] = (
            [self.playerData[index][2], self.playerData[index][3], self.playerData[index][4]]
        )

    def addReg(self, value):
        self.reg[0] += value

    def getReg(self):
        return self.reg[0]

    def run(self):
        for i in range(len(self.playerData)):
            code = self.playerData[i][8]
            exec(code)
        print(self.playerPos)


if __name__ == "__main__":
    import sqlite3
    conn = sqlite3.connect('database.db')
    import compiler

    comp = compiler.PmoToPython()

    c = conn.cursor()
    playerData = []
    for data in c.execute('''SELECT * FROM users''').fetchall():
        playerData.append(list(data[:-1] + ("\n".join(comp.parse_text(data[-1])), )))
    r = Runner(playerData)
    r.run()

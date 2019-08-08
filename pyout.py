self.movePlayer(i, self.getReg(), 1)
self.swapReg()
self.checkColor(i)
self.setReg(self.getReg() | 2)
self.swapReg()
self.drawPlayer(i)
self.addReg(1)
self.movePlayer(i, self.getReg(), 1)
self.swapReg()
if self.getReg() == 2:
    self.swapReg()
    self.addReg(1)
else:
    self.swapReg()
    self.addReg(3)


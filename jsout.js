movePlayer(i, getReg(), 1)
swapReg()
checkColor(i, idata)
setReg(getReg() | 2)
swapReg()
idata = drawPlayer(i, idata)
addReg(1)
movePlayer(i, getReg(), 1)
swapReg()
if (getReg() == 2) {
swapReg()
addReg(1)
} else {
swapReg()
addReg(3)
}

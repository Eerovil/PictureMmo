//^^^HEADER$$$

reg = [null, null]

var width = 100,
    height = 100;

window.onload = function() {
    var canvas = document.getElementById("mainCanvas");
    var ctx = canvas.getContext("2d");
    var img = document.getElementById("baseImage");
    
    ctx.drawImage(img,0,0);
    idata = ctx.getImageData(0, 0, width, height);
    setInterval(() => {
        let new_idata = nextImageState(idata);
        ctx.putImageData(new_idata, 0, 0);
        ctx.scale(4,4);
    }, 100)

};

function movePlayer(index, dir, amount) {
    switch (dir % 4) {
        case 0:
            playerData[index][1] += amount
        break;
        case 1:
            playerData[index][2] += amount
        break;
        case 2:
            playerData[index][1] -= amount
        break;
        case 3:
            playerData[index][2] -= amount
        break;
    }
    if (playerData[index][1] < 0) {
        playerData[index][1] = 0
    }
    if (playerData[index][1] >= width) {
        playerData[index][1] = width - 1
    }
    if (playerData[index][2] < 0) {
        playerData[index][2] = 0
    }
    if (playerData[index][2] >= height) {
        playerData[index][2] = height - 1
    }
}
function drawPlayer(index, idata) {
    let pos = (playerData[index][2] * width + playerData[index][1]) * 4;
    idata.data[pos  ] = playerData[index][3]
    idata.data[pos+1] = playerData[index][4]
    idata.data[pos+2] = playerData[index][5]
    return idata;
}
function getReg() {
    return reg[0]
}
function setReg(value) {
    reg[0] = value;
}
function swapReg() {
    const _tmp = reg[0];
    reg[0] = reg[1];
    reg[1] = _tmp;
}
function checkColor(index, idata) {
    let pos = (playerData[index][2] * width + playerData[index][1]) * 4;
    color = [
        idata.data[pos  ],
        idata.data[pos+1],
        idata.data[pos+2],
    ];
    console.log(color)
    if (color[0] == 0 && color[1] == 0 && color[2] == 0) {
        reg[0] = 2;
    } else if (color[0] == playerData[index][3] && color[1] == playerData[index][4] && color[2] == playerData[index][5]) {
        reg[0] = 0;
    } else {
        reg[0] = 1;
    }
}

function addReg(num) {
    reg[0] += num;
    if (reg[0] > 255) {
        reg[0] = reg[0] % 256
    }
}

function subReg(num) {
    reg[0] -= num;
    if (reg[0] < 0) {
        reg[0] = (reg[0] + 256) % 256
    }
}


function nextImageState(idata) {
    for (let i=0; i<playerData.length; i++) {
        reg[0] = playerData[i][6];
        reg[1] = playerData[i][7];
        eval(playerData[i][8]);
        playerData[i][6] = reg[0];
        playerData[i][7] = reg[1];
        
    }
    document.getElementsByClassName('posx')[0].innerHTML = playerData[0][1];
    document.getElementsByClassName('posy')[0].innerHTML = playerData[0][2];
    document.getElementsByClassName('reg0')[0].innerHTML = reg[0];
    document.getElementsByClassName('reg1')[0].innerHTML = reg[1];
    return idata
}
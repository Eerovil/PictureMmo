playerPos = [
    [50, 50, 255, 0, 0]
]
reg = [null, null]

var width = 100,
    height = 100;

window.onload = function() {
    var canvas = document.getElementById("mainCanvas");
    var ctx = canvas.getContext("2d");
    var buffer = new Uint8ClampedArray(width * height * 4); // have enough bytes
    for(var y = 0; y < height; y++) {
        for(var x = 0; x < width; x++) {
            var pos = (y * width + x) * 4; // position in buffer based on x and y
            buffer[pos  ] = 150;           // some R value [0, 255]
            buffer[pos+1] = 150;           // some G value
            buffer[pos+2] = 150;           // some B value
            buffer[pos+3] = 255;           // set alpha channel
        }
    }

    canvas.width = width;
    canvas.height = height;

    // create imageData object
    var idata = ctx.createImageData(width, height);

    // set our buffer as source
    idata.data.set(buffer);

    // update canvas with new data
    ctx.putImageData(idata, 0, 0);

    setInterval(() => {
        let new_idata = nextImageState(idata);
        ctx.putImageData(new_idata, 0, 0);
        ctx.scale(4,4);
    }, 100)
};

function movePlayer(index, dir, amount) {
    switch (dir % 4) {
        case 0:
            playerPos[index][0] += amount
        break;
        case 1:
            playerPos[index][1] += amount
        break;
        case 2:
            playerPos[index][0] -= amount
        break;
        case 3:
            playerPos[index][1] -= amount
        break;
    }
    if (playerPos[index][0] < 0) {
        playerPos[index][0] = 0
    }
    if (playerPos[index][0] >= width) {
        playerPos[index][0] = width - 1
    }
    if (playerPos[index][1] < 0) {
        playerPos[index][1] = 0
    }
    if (playerPos[index][1] >= height) {
        playerPos[index][1] = height - 1
    }
}
function drawPlayer(index, idata) {
    let pos = (playerPos[index][1] * width + playerPos[index][0]) * 4;
    idata.data[pos  ] = playerPos[index][2]
    idata.data[pos+1] = playerPos[index][3]
    idata.data[pos+2] = playerPos[index][4]
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
    let pos = (playerPos[index][1] * width + playerPos[index][0]) * 4;
    color = [
        idata.data[pos  ],
        idata.data[pos+1],
        idata.data[pos+2],
    ];
    console.log(color)
    if (color[0] == 0 && color[1] == 0 && color[2] == 0) {
        reg[0] = 2;
    } else if (color[0] == playerPos[index][2] && color[1] == playerPos[index][3] && color[2] == playerPos[index][3]) {
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
    for (let i=0; i<playerPos.length; i++) {
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
        
    }
    document.getElementsByClassName('posx')[0].innerHTML = playerPos[0][0];
    document.getElementsByClassName('posy')[0].innerHTML = playerPos[0][1];
    document.getElementsByClassName('reg0')[0].innerHTML = reg[0];
    document.getElementsByClassName('reg1')[0].innerHTML = reg[1];
    return idata
}
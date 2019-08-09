var timestamp = new Date(),
    playerData = [];

reg = [null, null]

var width = 100,
    height = 100,
    ctx,
    canvas,
    loop,
    ticksSinceUpdate = 0;

var tps = 10,
    maxtps = 10; 

window.addEventListener('load', onLoad);

function onLoad() {
    reloadAll();
    canvas = document.getElementById("mainCanvas");
    ctx = canvas.getContext("2d");

    let tmpcanvas = document.createElement('canvas');
    tmpctx = tmpcanvas.getContext("2d");

    var img = new Image();
    img.onload = () => {
        tmpctx.imageSmoothingEnabled = false;
        tmpctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);
        tmpctx.scale(5,5);
        idata = tmpctx.getImageData(0, 0, width, height);
        ctx.clearRect(0, 0, width, height);
        ctx.putImageData(idata, 0, 0);

        tickLooper(idata);
    }
    img.src = 'image.png?cachebuster=' + new Date().getTime();

};

function reloadAll() {
    ticksSinceUpdate = 0;
    for (oldScript of document.querySelectorAll('head script')) {
        console.log(oldScript)
        oldScript.remove();
    }
    var head= document.getElementsByTagName('head')[0];
    var script= document.createElement('script');
    script.src= 'jsout.js?cachebuster=' + new Date().getTime();
    head.appendChild(script);
}


function tickLooper(idata) {
    let lastTick = new Date();
    let new_idata = nextImageState(idata);
    ticksSinceUpdate++;
    ctx.imageSmoothingEnabled = false;
    ctx.putImageData(new_idata, 0, 0);

    const currTime = new Date()
    // Ususally on first load we have "too fresh" data. Need to run slower/faster
    servertick = (((currTime - timestamp) / 1000) * maxtps) - 30 * maxtps;
    console.log("servertick", servertick, "late", ticksSinceUpdate - servertick)
    if (ticksSinceUpdate - servertick < -2) {
        tps = 2 * maxtps;
    } else if (ticksSinceUpdate - servertick > 2) {
        tps = 0.5 * maxtps;
    } else {
        tps = maxtps;
    }

    // Reload once we have run all ticks
    console.log(tps)
    if (ticksSinceUpdate >= maxtps * 60) {
        reloadAll();
    }

    let sleepTime = (1000.0 / tps) - (currTime - lastTick);

    loop = setTimeout(() => {
        tickLooper(new_idata)
    }, sleepTime)
}

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
    return idata
}
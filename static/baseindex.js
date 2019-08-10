var timestamp = new Date(),
    playerData = [];

reg = [null, null]

var myIndex = 0,
    myData = {};

var width = 100,
    height = 100,
    ctx,
    canvas,
    loop,
    ticksSinceUpdate = 0,
    updateInterval = 10;

var tps = 10,
    maxtps = 10; 

window.addEventListener('load', onLoad);

function onLoad() {
    canvas = document.getElementById("mainCanvas");
    ctx = canvas.getContext("2d");

    reloadAll().then((idata) => {
        if (playerData.length > myIndex) {
            document.getElementById("code").innerHTML = playerData[myIndex][8];
        }
        tickLooper(idata);
    });
};

async function reloadAll() {
    ticksSinceUpdate = 0;
    timestamp = new Date();
    
    let promises = [];
    promises.push(new Promise((resolve, reject) => {
        for (oldScript of document.querySelectorAll('head script')) {
            console.log(oldScript)
            oldScript.remove();
        }
        var head= document.getElementsByTagName('head')[0];
        var script= document.createElement('script');
        script.src= 'jsout.js?cachebuster=' + new Date().getTime();
        head.appendChild(script);
        script.onload = function() {
            if (new Date() - timestamp > updateInterval * 1000) {
                alert("No data from server");
            }
            resolve();
        }
        script.onerror = reject;
    }));

    promises.push(new Promise((resolve, reject) => {
        let tmpcanvas = document.createElement('canvas');
        tmpctx = tmpcanvas.getContext("2d");
    
        var img = new Image();
        img.onload = () => {
            tmpctx.drawImage(img, 0, 0, width, height, 0, 0, width, height);
            let idata = tmpctx.getImageData(0, 0, width, height);
            ctx.clearRect(0, 0, width * 500, height * 500);
            ctx.imageSmoothingEnabled = false;
            for (let pos=0; pos<idata.data.length; pos+=4) {
                if (idata.data[pos  ] != 255 ||
                    idata.data[pos+1] != 255 ||
                    idata.data[pos+2]!= 255) {
                        ctx.fillStyle = `rgb(${idata.data[pos]}, ${idata.data[pos+1]}, ${idata.data[pos+2]})`;
                        ctx.fillRect(((pos / 4) % width) * 5, (Math.floor((pos / 4) / width)) * 5, 5, 5);
                    }
            }
            resolve(idata);
        }
        img.onerror = reject;
        img.src = 'image.png?cachebuster=' + new Date().getTime();
    }));

    let ret;

    await Promise.all(promises).then((values) => {
        ret = values[1];
    });
    return ret;  // idata

}


function tickLooper(idata) {
    let lastTick = new Date();
    let new_idata = nextImageState(idata);
    ticksSinceUpdate++;
    // ctx.putImageData(new_idata, 0, 0);

    const currTime = new Date()
    // Ususally on first load we have "too fresh" data. Need to run slower/faster
    servertick = Math.floor((((currTime - timestamp) / 1000) * maxtps) - (updateInterval / 2) * maxtps);
    //console.log("servertick", servertick, "clienttick", ticksSinceUpdate)
    if (ticksSinceUpdate - servertick < -1) {
        tps = 2 * maxtps;
    } else if (ticksSinceUpdate - servertick > 1) {
        tps = 0.5 * maxtps;
    } else {
        tps = maxtps;
    }

    let sleepTime = (1000.0 / tps) - (currTime - lastTick);

    // Reload once we have run all ticks
    let updateText = maxtps * updateInterval - ticksSinceUpdate;
    document.getElementsByClassName("updateCounter")[0].innerHTML = updateText;
    if (ticksSinceUpdate >= maxtps * updateInterval) {
        reloadAll().then((server_idata) => {
            loop = setTimeout(() => {
                tickLooper(server_idata)
            }, sleepTime)
        });
    } else {
        loop = setTimeout(() => {
            tickLooper(new_idata)
        }, sleepTime)
    }

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
    const xpos = playerData[index][1],
          ypos = playerData[index][2];

    ctx.fillStyle = `rgb(${playerData[index][3]}, ${playerData[index][4]}, ${playerData[index][5]})`;
    ctx.fillRect(xpos * 5, ypos * 5, 5, 5);

    let pos = (ypos * width + xpos) * 4;
    idata.data[pos  ] = playerData[index][3]
    idata.data[pos+1] = playerData[index][4]
    idata.data[pos+2] = playerData[index][5]
    return idata;
}

function removePosRect(xpos, ypos, idata) {
    let pos = (ypos * width + xpos) * 4;
    ctx.fillStyle = `rgb(${idata.data[pos]}, ${idata.data[pos+1]}, ${idata.data[pos+2]})`;
    ctx.fillRect(xpos * 5, ypos * 5, 5, 5);
}

function posRect(xpos, ypos, idata) {
    ctx.fillStyle = `rgb(0, 0, 0)`;
    ctx.fillRect(xpos * 5, ypos * 5, 5, 5);
    let pos = (ypos * width + xpos) * 4;
    ctx.fillStyle = `rgb(${idata.data[pos]}, ${idata.data[pos+1]}, ${idata.data[pos+2]})`;
    ctx.fillRect(xpos * 5 + 1, ypos * 5 + 1, 3, 3);
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
        const prevx = playerData[i][1],
              prevy = playerData[i][2];
        try {
            eval(playerData[i][8]);
        } catch (e) {
            console.log(e)
        }
        removePosRect(prevx, prevy, idata);
        posRect(playerData[i][1], playerData[i][2], idata)
        playerData[i][6] = reg[0];
        playerData[i][7] = reg[1];
        
    }

    if (playerData.length > myIndex) {
        document.getElementsByClassName("posx")[0].innerHTML = playerData[myIndex][1];
        document.getElementsByClassName("posy")[0].innerHTML = playerData[myIndex][2];
        document.getElementsByClassName("reg0")[0].innerHTML = playerData[myIndex][6];
        document.getElementsByClassName("reg1")[0].innerHTML = playerData[myIndex][7];
    }
    return idata
}

function login() {
    const name = document.getElementById("name").value;
    fetch('/login', {
        method: 'POST' ,headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"name": name})
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        myData = data;
        console.log(myData);
        log("Logged in as " + name + ".")
        document.getElementById('code').style['display'] = "inline";
        document.getElementById('code').innerHTML = myData[3];
        const color = rgbToHex(myData[0], myData[1], myData[2]);
        document.getElementById('mycolor').innerHTML = color;
        document.getElementById('mycolor').style['color'] = color;

        document.getElementById('loginBtn').style['display'] = "none";
        document.getElementById('saveBtn').style['display'] = "inline";

    })
}

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function saveCode() {
    const name = document.getElementById("name").value;
    const myCode = document.getElementById("code").value;

    fetch('/update', {
        method: 'POST' ,headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({"name": name, "code": myCode})
    }).then(function (response) {
        return response.json();
    }).then(function (data) {
        console.log(data)
        log("Code saved. " + (ticksSinceUpdate * 2 < maxtps * updateInterval ? "" : "Reloading in two updates"))
    });
}

function log(text) {
    const ul = document.querySelector('#log > ul');
    let li = document.createElement('li');
    li.innerHTML = text;
    ul.prepend(li);
}

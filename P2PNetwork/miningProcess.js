const {generateBlock} = require("./Functions");

process.on("message", (message) => {
    console.log(`Child Process PID: ${process.pid}`);
    let {oldBlock, data} = JSON.parse(message);
    let newBlock = generateBlock(oldBlock, data);
    process.send(JSON.stringify({newBlock: newBlock, processId: process.pid}));
    process.disconnect();
})
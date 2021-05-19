//NodeJs Imports
const net = require("net");
const cp = require('child_process');
const numChild  = require('os').cpus().length;
const {Block} = require("./Structs");
const {calculateHash, isBlockValid, isLongestChain} = require("./Functions");

//Global
//Blockchain - Series of Validated Blocks
let Blockchain = [];
let clientSockets = [];

//TCP Methods
const onClientConnection = (socket) => {
    socket.write("Client Connection Stablished. \r\n");
    console.log(`${socket.remoteAddress}:${socket.remotePort} Connected`);
    //Add Client to SocketList
    clientSockets.push(socket);

    //Listen for data from the connected client.
    socket.on('data', (data) => {
        //Log data from the client
        console.log(`${socket.remoteAddress}:${socket.remotePort} Says : ${data} `);
        //Write Block
        console.log(parseInt(data))
        if(parseInt(data) != NaN && parseInt(data) != null){
            console.log("Writing Block ...");
            writeBlock(data);
            //Send back the data to the client.
            socket.write("Request Sent.");
        }
    });
    //Handle Client Connection Termination.
    socket.on('close', () => {
        //Remove Client From Sockets List
        console.log(`${socket.remoteAddress}:${socket.remotePort} Terminated the connection`);
        clientSockets.splice(clientSockets.indexOf(socket), 1);
    });
    //Handle Client Connection Error.
    socket.on('error', (error) => {
        console.error(`${socket.remoteAddress}:${socket.remotePort} Connection Error ${error}`);
    });
}

const writeBlock = (data) => {
    //Creating Subprocesses
    console.log(numChild);
    for(let i = 0; i < numChild; i++){
        let subProcess = cp.fork(`${__dirname}/miningProcess.js`, {detached: true});
        subProcess.send(JSON.stringify({oldBlock: Blockchain[Blockchain.length-1], data: parseInt(data)}));
        subProcess.on("message", (message) => {
            let {newBlock, processId} = JSON.parse(message);
            if(isBlockValid(newBlock, Blockchain[Blockchain.length-1])){
                let newBlockchain = [...Blockchain, newBlock];
                if(isLongestChain(newBlockchain, Blockchain)){
                    Blockchain = newBlockchain;
                    console.log(processId);
                    console.log(JSON.stringify(Blockchain, null, 2));
                }
            }
        })
    }
}

//Main
//Creating Genesis Block
console.log("Creating Genesis Block");
let genesisBlock = new Block();
genesisBlock.index = 0;
genesisBlock.timestamp = Date.now();
genesisBlock.data = 0;
genesisBlock.prevHash = "";
genesisBlock.difficulty = 1;
genesisBlock.nonce = "";
genesisBlock.hash = calculateHash(genesisBlock);

//Appending to Blockchain
Blockchain.push(genesisBlock);
console.log(JSON.stringify(Blockchain, null, 2));

//TCP Server
let clientServer = net.createServer(onClientConnection);
clientServer.listen(1337, "127.0.0.1", () => {
    console.log("TCP Server Listening on Port: 1337");
});
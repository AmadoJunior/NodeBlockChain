const express = require("express");
const crypto = require("crypto");
const app = express();

//Structures ===========================================================
    //Difficulty Setting
    const Difficulty = 1;
    //Block Structure
    class Block{
        index;
        timestamp;
        data;
        hash;
        prevHash;
        difficulty;
        nonce;
        constructor(){}
    }
    //Server Message
    class Message{
        data;
        constructor(){}
    }
    //Blockchain
    let Blockchain = [];

//Methods ===========================================================
    //Check Validity of newBlock
    const isBlockValid = (newBlock, oldBlock) => {
        if(oldBlock.index+1 !== newBlock.index){
            return false;
        }

        if(oldBlock.hash !== newBlock.prevHash){
            return false;
        }

        if(calculateHash(newBlock) !== newBlock.hash){
            return false;
        }

        return true;
    }

    //Calculate Hash for a given Block
    const calculateHash = (block) => {
        let sha256 = crypto.createHash("sha256");
        let record = block.index.toString() + block.timestamp.toString() + block.data.toString() + block.prevHash + block.nonce;
        return sha256.update(record).digest("hex");
    }

    //Check Validity of Proof of Work Hash
    const isHashValid = (hash, difficulty) => {
        count = 0;
        for(char of hash){
            if(char === "0"){
                count++;
            } else {
                break;
            }
        }
        return (count === difficulty);
    }

    //Asynchonous Sleep Function
    const sleep = (ms) => {
        let dt = Date.now();
	    while ((Date.now()) - dt <= ms) { /* Do nothing */ }
    }

    //Proof of Work
    const generateBlock = (oldBlock, data) => {
        //Creating newBlock
        let newBlock = new Block();
        newBlock.index = oldBlock.index + 1;
        newBlock.timestamp = Date.now();
        newBlock.data = data;
        newBlock.prevHash = oldBlock.hash;
        newBlock.difficulty = Difficulty;

        //Temporary Variables
        let hex;
        let currentHash;

        //Finding Nonce
        for(let i = 0; ; i++){
            hex = i.toString(16);
            newBlock.nonce = hex;
            currentHash = calculateHash(newBlock);
            if(!isHashValid(currentHash, newBlock.difficulty)){
                console.log(`Invalid Hash: ${currentHash}`);
                sleep(1000);
            } else {
                console.log(`Valid Hash: ${currentHash} \n Work Done! \n`);
                newBlock.hash = currentHash;
                break;
            }
        }

        return newBlock;
    }

    //Temporary Startup Function
    const startUp = () => {
        //Creating Genesis Block
        console.log("Creating Genesis Block");
        let genesisBlock = new Block();
        genesisBlock.index = 0;
        genesisBlock.timestamp = Date.now();
        genesisBlock.data = 0;
        genesisBlock.prevHash = "";
        genesisBlock.difficulty = Difficulty;
        genesisBlock.nonce = "";
        genesisBlock.hash = calculateHash(genesisBlock);

        //Appending to Blockchain
        Blockchain.push(genesisBlock);
    }



//Midleware ===========================================================
app.use(express.json());

//Route Handlers ===========================================================
const handleGetBlockchain = (req, res) => {
    console.log("GET Request Recieved")
    res.status(200).json(Blockchain);
}
const handleWriteBlock = (req, res) => {
    let newMessage = new Message();
    newMessage.data = req.body.data;

    let newBlock = generateBlock(Blockchain[Blockchain.length-1], newMessage.data);

    if(isBlockValid(newBlock, Blockchain[Blockchain.length-1])){
        Blockchain.push(newBlock);
    }

    res.status(200).json(newBlock);
}

//Main ===========================================================

startUp();

app.get("/", handleGetBlockchain);

app.post("/", handleWriteBlock);

//Server ===========================================================
const PORT = 5000;
app.listen(PORT, () => console.log(`Started Server on Port: ${PORT}`));
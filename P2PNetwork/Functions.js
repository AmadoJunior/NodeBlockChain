//Imports
const crypto = require("crypto");
const {Block} = require("./Structs");

//Methods ===========================================================
    //Calculate Hash for a given Block
    const calculateHash = (block) => {
        let sha256 = crypto.createHash("sha256");
        let record = block.index.toString() + block.timestamp.toString() + block.data.toString() + block.prevHash + block.nonce;
        return sha256.update(record).digest("hex");
    }
    //Generate a block using previous block hash and Proof of Work
    const generateBlock = (oldBlock, data, processId) => {
        //Creating newBlock
        let newBlock = new Block();
        newBlock.index = oldBlock.index + 1;
        newBlock.timestamp = Date.now();
        newBlock.data = data;
        newBlock.prevHash = oldBlock.hash;
        newBlock.difficulty = 2;

        //Temporary Variables
        let hex;
        let currentHash;
        let initNonce = Date.now()+Math.floor(Math.random() * 1000);

        //Finding Nonce
        for(let i = initNonce; ; i++){
            hex = i.toString(16);
            newBlock.nonce = hex;
            currentHash = calculateHash(newBlock);
            if(!isHashValid(currentHash, newBlock.difficulty)){
                console.log(`Invalid Hash PID(${processId}): ${currentHash}`);
                sleep(500);
            } else {
                console.log(`Valid Hash PID(${processId}): ${currentHash} \n Work Done! \n`);
                newBlock.hash = currentHash;
                break;
            }
        }

        return newBlock;
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
    //Make sure the chain we're checking is longer than the current blockchain
    const isLongestChain = (newBlockchain, oldBlockchain) => {
        if(newBlockchain.length > oldBlockchain.length){
            return true;
        }
        return false;
    }
    //Asynchonous Sleep Function
    const sleep = (ms) => {
        let dt = Date.now();
	    while ((Date.now()) - dt <= ms) { /* Do nothing */ }
    }

//Exports
exports.calculateHash = calculateHash;
exports.isBlockValid = isBlockValid;
exports.isHashValid = isHashValid;
exports.generateBlock = generateBlock;
exports.isLongestChain = isLongestChain;
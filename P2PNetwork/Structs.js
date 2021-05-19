//Structures ===========================================================
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

//Exports
exports.Block = Block;
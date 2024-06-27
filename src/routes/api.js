const express = require('express');
const router = express.Router();
const Web3 = require("web3");
const commonAbi  = require('./Blockchain.json')
router.use(express.json()); 

const web3 = new Web3("https://data-seed-prebsc-1-s2.bnbchain.org:8545") //RPC of BNB

router.route('/generateAddress').post(async function(req,res,next){
    try {
        let wallet = await web3.eth.accounts.create();
        const address = wallet.address;
        console.log("Created Address",address)
        const privateKey = wallet.privateKey;
        console.log("Private Key of created account",privateKey);
        res.status(200).send("Account creation successful");
    } catch (error) {
        console.log("error creating account",error.message)
        res.status(500).send("Internal Server Error");
    }
});

router.route('/getbalanceNative').get(async function(req,res,next){
    try {
        let accAdd = req.body.address;
        let balance = await web3.eth.getBalance(accAdd)
        let bal = await web3.utils.fromWei(balance,"ether")
        console.log('balance of address is ',balance,'wei','or',bal,'ether');
        res.status(200).json({ 
            address: accAdd, 
            balanceInWei: balance, 
            balanceInEther: bal 
        });
    } catch (error) {
        console.log("Error reading balance from chain",error.message)
        res.status(500).send("Internal Server Error");
    }
})

router.route('/transferNative').post(async function(req,res,next){
        let accAdd = req.body.sender;
        let accPK = req.body.senderPrivateKey;
        let receiverAdd = req.body.receiver;
        let amount = req.body.amount;              // amount to transfer like 1,2,3...
        let ValueToTransfer = web3.utils.toWei(amount.toString(), 'ether');
        console.log("ValueToTransfer",ValueToTransfer)
        try {
            let balance = await web3.eth.getBalance(accAdd)
            let bal = await web3.utils.fromWei(balance,"ether")
            console.log('balance of address is ',balance,'wei','or',bal,'ether');
            if(amount> bal){
            res.status(403).send("Not enough balance");
                return
            }
            else{
                const nonce = await web3.eth.getTransactionCount(accAdd, 'latest'); 
                const transaction = {
                    'to': receiverAdd, 
                    'value': ValueToTransfer,
                    'gas': 21000, 
                    'nonce': nonce,
                    'gasPrice': await web3.eth.getGasPrice(),
                };
                const signedTransaction = await web3.eth.accounts.signTransaction(transaction, accPK);
                const receipt = await web3.eth.sendSignedTransaction(signedTransaction.rawTransaction);
                console.log('Transaction successful with hash:', receipt.transactionHash);
                res.status(200).json({ 
                    sender: accAdd, 
                    receiver: receiverAdd, 
                    AmountInWei: ValueToTransfer,
                    AmountInEther:amount
                });
            }

        } catch (error) {
            console.log("Error in transfer",error.message)
            res.status(500).send("Internal Server Error");
        }

})

router.route('/getBalanceToken').get(async function(req,res,next){
    let accAdd = req.body.address;
    let TOKEN_ADDRESS = req.body.tokenAddress;      // token address
    const tokenInstance = new web3.eth.Contract(commonAbi, TOKEN_ADDRESS); 
    try {
        const balance = await tokenInstance.methods.balanceOf(accAdd).call();
        let bal = await web3.utils.fromWei(balance,"ether")
        res.status(200).json({ 
            address: accAdd, 
            balanceInWei: balance, 
            balanceInEther: bal 
        });
    } catch (error) {
        console.log("Error reading token balance from chain",error.message);
        res.status(500).send("Internal Server Error");
    }
})

router.route('/transferToken').post(async function(req, res, next) {
    let TOKEN_ADDRESS = req.body.tokenAddress;      // token address
    const tokenInstance = new web3.eth.Contract(commonAbi, TOKEN_ADDRESS); 
        try {
            let receiversAddress = req.body.receiver;  // receiver address
            let amount = req.body.amount;              // amount to transfer like 1,2,3...
            let ValueToTransfer = web3.utils.toWei(amount.toString(), 'ether');
            console.log("ValueToTransfer",ValueToTransfer)
            const withdrawal_wallet = await tokenInstance.methods.balanceOf(sender_wallet_address).call();
            const withdrawal_wallet_balance = web3.utils.fromWei(withdrawal_wallet, "ether");
    
            console.log(withdrawal_wallet_balance, 'withdrawal_wallet_balance');
            if (withdrawal_wallet_balance > amount) {
                web3.eth.accounts.wallet.add(sender_wallet_privateKey);
                tokenInstance.methods.transfer(receiversAddress, ValueToTransfer).send(
                    { from: sender_wallet_address, gas: 100000 },
                    async function (error, result) {
                        if (!error) {
                            console.log(result, " : this is result/Transction hash");
                            res.status(200).json({ 
                                To: sender_wallet_address,
                                From:receiversAddress,
                                Amount:amount,
                                Hash:result
                            });
                        } else {
                            console.log("Error in withdrawal", error.message);
                             res.status(500).send("Error in withdrawal");
                        }
                    });
            } else {
                console.log("Not Enough Token Balance");
            }
        } catch (error) {
            console.error("Error in transfer token route:", error.message);
            res.status(500).send("Internal Server Error");
        }    
});


module.exports = router;

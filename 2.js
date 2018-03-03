const ElectrumCli = require('electrum-client')
const bitcoin = require('bitcoinjs-lib');
const Mnemonic = require('bitcore-mnemonic');
const bip39 = require('bip39');
const testnet = bitcoin.networks.testnet

// Generated from bip39
const mnemonic = new Mnemonic('wash indoor drip legend roof noodle unable item sausage equal nurse wood');
const seed = bip39.mnemonicToSeedHex(mnemonic)

const xpriv ='tprv8ZgxMBicQKsPfPBSN58S9sLnLsGJFSPChTmwcdLQwW2oKj4WSFiNULdeuE2wrf7hEwP7nRFytjm2DhyfVuQVas22SibmQzhfJbE8r3DecdE';

var root = bitcoin.HDNode.fromSeedHex(seed, testnet);

// // M - 44 - Bitcoin (testnet) - First account - External - First
const child1 = root.derivePath("m/44'/1'/0'/0/0");
const WIF = child1.keyPair.toWIF();
console.log(child1.getAddress())

const main = async () => {
    const ecl = new ElectrumCli(50001, '18.221.223.44', 'tcp')
    await ecl.connect() // connect(promise)
    ecl.subscribe.on('blockchain.headers.subscribe', (v) => console.log(v))
    try{
        const balance = await ecl.blockchainAddress_getBalance(child1.getAddress())
        console.log('balance', balance)

        // blockchainAddress_listunspent
        const list = await ecl.blockchainAddress_listunspent(child1.getAddress())
        const tx_hash = list[0].tx_hash;

        var SERGIO = bitcoin.ECPair.fromWIF(WIF, testnet);
        var tx = new bitcoin.TransactionBuilder(testnet);

        tx.addInput(tx_hash, 0)
        tx.addOutput('2N1eoNZQregurjsp3Kij2J9uZ5UQTPcMNtx', 120000000) // FAUCET ADDRESS
        tx.addOutput(child1.getAddress(), 500)

        tx.sign(0, SERGIO)

        console.log(tx.build().toHex());

        // blockchainTransaction_broadcast
        const broadcast = await ecl.blockchainTransaction_broadcast(tx.build().toHex())
        console.log('broadcast', broadcast)

    } catch(e){
      console.log('oopts')
        console.log(e)
    }
    await ecl.close()
}
main()

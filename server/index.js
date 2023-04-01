const secp = require('ethereum-cryptography/secp256k1');

const { toHex, utf8ToBytes } = require("ethereum-cryptography/utils");
const { keccak256 } = require("ethereum-cryptography/keccak");

const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0478183a3ec0841bb2391a7b4d9d95b0c0b81a7ede1da8634de40d917f91e2f35d58acc77e8fed285d806098c0e84bdcd3321c8341d5f2e100e5637dbd3a1abd83": 100,
  "0412c7c6659da0ec9876705784e380b85607ae8c68f7b96dcc52567634eb707af6a0763a6015e545406057f0ab9ebc7f8c91e5df9eadfcc0eed21a4cec3b4a99ca": 50,
  "04c8154e79c18bfd4a8c3bf0780163ce16dcd23233d05660e9c3cc0a778b4daee5939fa723e7cf067263b5fa946b0f522d7fb1d6af82fe069cfdf35f11a54586e1": 75,
};

const transactionCount = {
  "0478183a3ec0841bb2391a7b4d9d95b0c0b81a7ede1da8634de40d917f91e2f35d58acc77e8fed285d806098c0e84bdcd3321c8341d5f2e100e5637dbd3a1abd83": 0,
  "0412c7c6659da0ec9876705784e380b85607ae8c68f7b96dcc52567634eb707af6a0763a6015e545406057f0ab9ebc7f8c91e5df9eadfcc0eed21a4cec3b4a99ca": 0,
  "04c8154e79c18bfd4a8c3bf0780163ce16dcd23233d05660e9c3cc0a778b4daee5939fa723e7cf067263b5fa946b0f522d7fb1d6af82fe069cfdf35f11a54586e1": 0,
}

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.get("/transactionCount/:sender", (req, res) => {
  const { sender } = req.params;
  setInitialTransactionCount(sender);
  res.send({ transactionCount: transactionCount[sender] })
})

app.post("/send", (req, res) => {
  //TO-DO: get a signature from client-side app
  //recover public address from signature, that will be the sender

  try {
    const { transactionHash, transactionJSON, signature, recoveryBit } = req.body;
    const { ammount, recipient, intendedSender, nonce } = JSON.parse(transactionJSON);

    const message = isSignatureValid(
      intendedSender,
      transactionJSON,
      transactionHash,
      signature,
      recoveryBit,
      nonce
    );

    if (message !== 'transaction valid') {
      res.status(400).send({ error: message });
    } else {
      const sender = intendedSender;
      setInitialBalance(sender);
      setInitialBalance(recipient);
      setInitialTransactionCount(sender);

      if (balances[sender] < amount) {
        res.status(400).send({ message: 'Insufficient funds' });
      } else {
        balances[sender] -= amount;
        balances[recipient] += amount;
        transactionCount[sender]++
        res.send({ balance: balances[sender], address: sender });
      }
    }
  } catch (error) {
    console.log(error);
  }

  // const { sender, recipient, amount } = req.body;

  // setInitialBalance(sender);
  // setInitialBalance(recipient);

  // if (balances[sender] < amount) {
  //   res.status(400).send({ message: "Not enough funds!" });
  // } else {
  //   balances[sender] -= amount;
  //   balances[recipient] += amount;
  //   res.send({ balance: balances[sender] });
  // }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function setInitialTransactionCount(address) {
  if (!transactionCount[address]) {
    transactionCount[address] = 0;
  }
}

function isSignatureValid(
  intendedSender,
  transactionJSON,
  transactionHash,
  signature,
  recoveryBit,
  nonce) {
  const addressSigner = getAddressSigner(transactionHash, signature, parseInt(recoveryBit));

  const hashedTransactionJSON = toHex(keccak256(utf8ToBytes(transactionJSON)));

  if (addressSigner !== intendedSender) {
    return 'Invalid signature';
  }

  if (hashedTransactionJSON !== transactionHash) {
    return 'Transaction information does not match hash';
  }

  if (nonce !== transactionCount[intendedSender] + 1) {
    return 'Incorrect nonce';
  }

  return 'transaction valid';
}


function getAddressSigner(hash, signature, recovery) {
  const senderPublicKey = secp.recoverPublicKey(hash, signature, recovery);
  const addressSender = `0x${toHex(keccak256(senderPublicKey).slice(-20))}`;
  return addressSender;
}

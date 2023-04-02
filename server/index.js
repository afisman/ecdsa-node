const express = require("express");
const cors = require("cors");
const { Crypto } = require("./scripts/Crypto");

const app = express();
const port = 3042;

app.use(cors());
app.use(express.json());

const balances = {
  "0x55f8339b8efcd9846d149c6bf0bfb646f8516c75": 100, // priv:  385d2bb60fcbbd67a451241ba61d2db2eb89f23db72ac6ea94fe841de31e7097
  "0x0e38b649b40e3a9c3523ad5b240390be52db4250": 50, // priv: bb590cd1cac1cdd840a66fbcf5af4dc33fa1d5029e60e9fc5c36d87c8c630422
  "0xd2065f49f25461fffd88861d9a689ad35c7d27fe": 75, // priv: 37b930d78f1fb361c69b8a1747bcdc5052ca2ba56a4a09df12c6deeb22181423
};

const crypto = new Crypto();

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, signature, rBit } = req.body;

  const ethAddress = verifySignature(amount?.toString(), signature, rBit);

  if (ethAddress && ethAddress === sender) {
    setInitialBalance(sender);
    setInitialBalance(recipient);
    if (balances[sender] < amount) {
      res.status(400).send({ message: "Not enough funds!" });
    } else {
      balances[sender] -= amount;
      balances[recipient] += amount;
      return res.send({ balance: balances[sender] });
    }
  }

  res.status(401).send(new Error());
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function verifySignature(msg, signature, rBit) {


  const pubKey = crypto.recoverKey(msg, signature, rBit);
  const ethAddr = crypto.keyToAddress(pubKey);

  if (balances[ethAddr]) return ethAddr;

  return false;
}
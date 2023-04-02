import { useState } from "react";
import server from "./server";
import { Crypto } from "./utils/Crypto";

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const crypto = new Crypto();


  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    if (privateKey.length === 0) {
      window.alert("You need the private key to sign the transaction")
    }

    try {
      const [signature, rBit] = await crypto.signMessage(sendAmount, privateKey)

      if (signature) {
        const { data } = await server.post(`send`, {
          sender: address,
          amount: parseInt(sendAmount),
          recipient,
          signature,
          rBit
        });

        if (data.balance) setBalance(data.balance);
      }
    } catch ({ response }) {
      if (response.request.status === 401) window.alert("You are not authorized to execute the transaction")
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
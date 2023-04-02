import { useState, useEffect } from "react";

import server from "./server";


function Wallet(
  { address,
    setAddress,
    balance,
    setBalance,
    privateKey,
    setPrivateKey,
  }
) {
  const [canSign, setCanSign] = useState(false)
  async function getBalance() {
    try {
      const { data } = await server.get(`balance/${address}`);
      if (!data.balance) return console.error(data)
      setBalance(data.balance)
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  useEffect(() => {
    if (address.length === 0) {
      setBalance(0)
      setCanSign(false)
      return
    }
    getBalance()
    setCanSign(true)
  }, [address])


  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <div className="inputs-container">
        <label>
          Wallet address
          <input
            placeholder="Your wallet address..."
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          ></input>
        </label>
        {canSign ? (
          <label>
            Sign the transaction
            <input
              placeholder="Your private key"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              type="password"
            >
            </input>
          </label>
        ) : <></>}
      </div>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
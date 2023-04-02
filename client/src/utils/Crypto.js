import { sign } from "ethereum-cryptography/secp256k1";
import { keccak256 } from "ethereum-cryptography/keccak";
import { utf8ToBytes, bytesToHex } from "ethereum-cryptography/utils";

export class Crypto {
    hashString(str) {
        return keccak256(utf8ToBytes(str));
    }

    async signMessage(msg, privateKey) {
        const [signature, rBit] = await sign(this.hashString(msg), privateKey, {
            recovered: true,
        });

        return [bytesToHex(signature), rBit];
    }
}
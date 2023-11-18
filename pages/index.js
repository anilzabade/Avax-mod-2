import { useState, useEffect } from "react";
import { ethers } from "ethers";
import atm_abi from "../artifacts/contracts/Assessment.sol/Assessment.json";

export default function HomePage() {
  const [ethWallet, setEthWallet] = useState(undefined);
  const [account, setAccount] = useState(undefined);
  const [atm, setATM] = useState(undefined);
  const [balance, setBalance] = useState(undefined);
  const [inputAmount, setInputAmount] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState({ status: "", time: "", date: "" });

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const atmABI = atm_abi.abi;

  const getWallet = async () => {
    if (window.ethereum) {
      setEthWallet(window.ethereum);
    }

    if (ethWallet) {
      const accounts = await ethWallet.request({ method: "eth_accounts" });
      handleAccount(accounts);
    }
  };

  const handleAccount = (accounts) => {
    if (accounts.length > 0) {
      console.log("Account connected:", accounts[0]);
      setAccount(accounts[0]);
    } else {
      console.log("No account found");
    }
  };

  const connectAccount = async () => {
    if (!ethWallet) {
      alert("MetaMask wallet is required to connect");
      return;
    }

    const accounts = await ethWallet.request({ method: "eth_requestAccounts" });
    handleAccount(accounts);

    // once the wallet is set, we can get a reference to our deployed contract
    getATMContract();
  };

  const getATMContract = () => {
    const provider = new ethers.providers.Web3Provider(ethWallet);
    const signer = provider.getSigner();
    const atmContract = new ethers.Contract(contractAddress, atmABI, signer);

    setATM(atmContract);
  };

  const getBalance = async () => {
    if (atm) {
      setBalance((await atm.getBalance()).toNumber());
    }
  };

  const deposit = async () => {
    if (atm && inputAmount > 0) {
      try {
        let tx = await atm.deposit(inputAmount, { value: ethers.utils.parseEther(inputAmount.toString()) });
        await tx.wait();
        getBalance();
        updateTransactionStatus("Deposit success");
      } catch (error) {
        console.error("Error depositing:", error);
        updateTransactionStatus("Deposit failed");
      }
    }
  };

  const withdraw = async () => {
    if (atm && inputAmount > 0) {
      try {
        let tx = await atm.withdraw(inputAmount);
        await tx.wait();
        getBalance();
        updateTransactionStatus("Withdrawal success");
      } catch (error) {
        console.error("Error withdrawing:", error);
        updateTransactionStatus("Withdrawal failed");
      }
    }
  };

  const updateTransactionStatus = (status) => {
    const date = new Date();
    const transaction = {
      status,
      time: date.toLocaleTimeString(),
      date: date.toLocaleDateString(),
    };
    setTransactionStatus(transaction);
  };

  const initUser = () => {
    if (!ethWallet) {
      return <p>Please install Metamask to use this ATM.</p>;
    }

    if (!account) {
      return <button onClick={connectAccount}>Please connect your Metamask wallet</button>;
    }

    if (balance === undefined) {
      getBalance();
    }

    return (
      <div>
        <p>Your Account: {account}</p>
        <p>Account Holder: Anurag</p>
        <p>Your Balance: {balance} ETH</p>
        <div className="input-container">
          <input
            type="number"
            placeholder="Enter amount"
            value={inputAmount}
            onChange={(e) => setInputAmount(e.target.value)}
          />
          <button className="deposit-button" onClick={deposit}>
            Deposit
          </button>
          <button className="withdraw-button" onClick={withdraw}>
            Withdraw
          </button>
        </div>
        {transactionStatus.status && (
          <p>
            Transaction Status: {transactionStatus.status} | Time: {transactionStatus.time} | Date: {transactionStatus.date}
          </p>
        )}
      </div>
    );
  };

  useEffect(() => {
    getWallet();
  }, []);

  return (
    <main className="container">
      <style jsx>{`
        .container {
          text-align: center;
          background-color: yellow;
          color: black;
        }

        .input-container {
          margin-top: 10px;
        }

        input {
          margin-right: 10px;
          padding: 5px;
        }

        .deposit-button,
        .withdraw-button {
          padding: 5px;
          border: none;
          cursor: pointer;
        }
      `}</style>
      <header>
        <h1>Welcome to the Metacrafters ATM!</h1>
      </header>
      {initUser()}
    </main>
  );
}

export {};

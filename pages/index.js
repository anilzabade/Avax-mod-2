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
  const [transactionHistory, setTransactionHistory] = useState([]);

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
        updateTransactionHistory("Deposit", inputAmount, "Success");
      } catch (error) {
        console.error("Error depositing:", error);
        updateTransactionStatus("Deposit failed");
        updateTransactionHistory("Deposit", inputAmount, "Failed");
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
        updateTransactionHistory("Withdrawal", inputAmount, "Success");
      } catch (error) {
        console.error("Error withdrawing:", error);
        updateTransactionStatus("Withdrawal failed");
        updateTransactionHistory("Withdrawal", inputAmount, "Failed");
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

  const updateTransactionHistory = (type, amount, status) => {
    const date = new Date();
    const transaction = {
      type,
      amount,
      status,
      time: date.toLocaleTimeString(),
      date: date.toLocaleDateString(),
    };
    setTransactionHistory([transaction, ...transactionHistory]);
  };

  const clearTransactionHistory = () => {
    setTransactionHistory([]);
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

        {/* Transaction History */}
        <h2>Transaction History</h2>
        <table>
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount (ETH)</th>
              <th>Status</th>
              <th>Date</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {transactionHistory.map((transaction, index) => (
              <tr key={index}>
                <td>{transaction.type}</td>
                <td>{transaction.amount}</td>
                <td>{transaction.status}</td>
                <td>{transaction.date}</td>
                <td>{transaction.time}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Clear History Button */}
        <button className="clear-history-button" onClick={clearTransactionHistory}>
          Clear History
        </button>
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
        .withdraw-button,
        .clear-history-button {
          padding: 5px;
          margin-top: 10px;
          border: none;
          cursor: pointer;
        }

        table {
          margin-top: 20px;
          width: 100%;
          border-collapse: collapse;
        }

        th,
        td {
          border: 1px solid #ddd;
          padding: 8px;
          text-align: left;
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

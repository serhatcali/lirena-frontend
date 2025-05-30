import React, { useEffect, useState } from "react";
import TronWeb from 'tronweb/dist/TronWeb.js';
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import "./App.css";
import './i18n';
import { useTranslation } from 'react-i18next';

const CONTRACT_ADDRESS = "TF2wqjtXp3BBHUb4Vk35Zt2TRJiuMcLAh5";

const TRC20_ABI = [
  { constant: true, inputs: [], name: "name", outputs: [{ name: "", type: "string" }], type: "function" },
  { constant: true, inputs: [], name: "symbol", outputs: [{ name: "", type: "string" }], type: "function" },
  { constant: true, inputs: [], name: "decimals", outputs: [{ name: "", type: "uint8" }], type: "function" },
  { constant: true, inputs: [], name: "totalSupply", outputs: [{ name: "", type: "uint256" }], type: "function" },
  { constant: true, inputs: [{ name: "_owner", type: "address" }], name: "balanceOf", outputs: [{ name: "balance", type: "uint256" }], type: "function" },
  { constant: false, inputs: [{ name: "_to", type: "address" }, { name: "_value", type: "uint256" }], name: "transfer", outputs: [{ name: "", type: "bool" }], type: "function" }
];

function App() {
  const { t, i18n } = useTranslation();
  const [showQR, setShowQR] = useState(false);
  const [tronWeb, setTronWeb] = useState(null);
  const [account, setAccount] = useState("");
  const [tokenName, setTokenName] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [totalSupply, setTotalSupply] = useState("");
  const [decimals, setDecimals] = useState(6);
  const [balance, setBalance] = useState("0");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [txHistory, setTxHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [theme, setTheme] = useState("dark");
  const [network, setNetwork] = useState("shasta");

  useEffect(() => {
    const waitForTron = () => new Promise(resolve => {
      const check = () => {
        if (
          window.tronWeb &&
          window.tronWeb.ready &&
          window.tronWeb.defaultAddress &&
          window.tronWeb.defaultAddress.base58 &&
          window.tronWeb.defaultAddress.base58.startsWith("T")
        ) {
          resolve(window.tronWeb);
        } else {
          setTimeout(check, 400);
        }
      };
      check();
    });

    const init = async () => {
      const tw = await waitForTron();
      setTronWeb(tw);
      setAccount(tw.defaultAddress.base58);
      setIsLoading(false);
    };

    init();
  }, []);

  useEffect(() => {
    if (!tronWeb) return;
    (async () => {
      try {
        const contract = await tronWeb.contract(TRC20_ABI, CONTRACT_ADDRESS);
        const [name, symbol, decRaw, supplyRaw] = await Promise.all([
          contract.name().call(),
          contract.symbol().call(),
          contract.decimals().call(),
          contract.totalSupply().call()
        ]);
        setTokenName(name);
        setTokenSymbol(symbol);
        const dec = parseInt(decRaw.toString(), 10);
        setDecimals(dec);
        const supply = Number(BigInt(supplyRaw.toString())) / 10 ** dec;
        setTotalSupply(supply.toLocaleString());
      } catch (e) {
        toast.error(t("token_fetch_failed"));
      }
    })();
  }, [tronWeb]);

  useEffect(() => {
    if (!tronWeb || !account) return;
    const fetchData = async () => {
      try {
        const contract = await tronWeb.contract(TRC20_ABI, CONTRACT_ADDRESS);
        const rawBal = await contract.balanceOf(account).call();
        const bal = Number(BigInt(rawBal.toString())) / 10 ** decimals;
        setBalance(bal.toLocaleString());
        const endpoint = network === 'mainnet' ? 'https://api.trongrid.io' : 'https://api.shasta.trongrid.io';
        const res = await fetch(`${endpoint}/v1/accounts/${account}/transactions/trc20?limit=5&contract_address=${CONTRACT_ADDRESS}`);
        const json = await res.json();
        setTxHistory(json.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [tronWeb, account, decimals, network]);

  const handleTransfer = async () => {
    if (!recipient || !amount) return toast.warn(t("missing_fields"));
    if (!recipient.startsWith("T") || recipient.length !== 34) return toast.error(t("invalid_address"));
    const numericAmount = parseFloat(amount.replace(",", "."));
    if (isNaN(numericAmount) || numericAmount <= 0) return toast.error(t("invalid_amount"));
    setIsSending(true);
    try {
      const contract = await tronWeb.contract(TRC20_ABI, CONTRACT_ADDRESS);
      const amt = Math.floor(numericAmount * 10 ** decimals);
      const validRecipient = tronWeb.address.toHex(recipient.trim());
      const tx = await contract.transfer(validRecipient, amt).send();
      toast.success(t("transfer_success") + tx);
      setRecipient("");
      setAmount("");
    } catch (e) {
      toast.error(t("transfer_failed") + (e.message || "Hata"));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`container fade-container ${theme}`}>
      {isLoading ? (<p>🔄 TronLink bağlanıyor...</p>) : (<>
        <h1 className="title">
          <img src="/lirena-logo.png" alt="LIRENA Logo" className="logo-animated" style={{ width: 40, verticalAlign: "middle", marginRight: 10 }} />
          {t("token_viewer")}
        </h1>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.2rem' }}>🌐</span>
          <select value={network} onChange={e => setNetwork(e.target.value)} className="tiny-button">
            <option value="shasta">Shasta</option>
            <option value="mainnet">Mainnet</option>
          </select>
          <button className="tiny-button" onClick={() => i18n.changeLanguage('tr')}>TR</button>
          <button className="tiny-button" onClick={() => i18n.changeLanguage('en')}>EN</button>
          <button className="tiny-button" onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}>🎨</button>
        </div>

        <div className="card">
          <p><strong>{t("account")}:</strong> <code onClick={() => navigator.clipboard.writeText(account)}>{account}</code></p>
          <p><strong>{t("token")}:</strong> {tokenName} ({tokenSymbol})</p>
          <p><strong>{t("total_supply")}:</strong> {totalSupply} {tokenSymbol}</p>
          <p><strong>{t("balance")}:</strong> <span className="balance">{balance} {tokenSymbol}</span></p>
        </div>

        <div className="card">
          <input className="input" type="text" placeholder={t("recipient")} value={recipient} onChange={e => setRecipient(e.target.value)} />
          <input className="input" type="text" placeholder={t("amount")} value={amount} onChange={e => setAmount(e.target.value)} />
          <button className="button" onClick={handleTransfer} disabled={isSending}>{isSending ? t("sending") : t("send")}</button>
        </div>

        <div className="card">
          <h3>{t("tx_history")}</h3>
          <ul className="list">
            {txHistory.length === 0 ? <li>{t("no_tx")}</li> : txHistory.map((tx, i) => (
              <li key={i} className="list-item">
                <p><strong>{t("summary")}:</strong> {tx.from === account ? t("outgoing") : t("incoming")}</p>
                <p><strong>{t("amount")}:</strong> {Number(tx.value) / 10 ** decimals} {tokenSymbol}</p>
                <p><a className="tx-link" href={`https://${network === 'mainnet' ? 'tronscan.org' : 'shasta.tronscan.org'}/#/transaction/${tx.transaction_id}`} target="_blank" rel="noopener noreferrer">🔗 {t("details")}</a></p>
              </li>
            ))}
          </ul>
        </div>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </>)}
    </div>
  );
}

export default App;

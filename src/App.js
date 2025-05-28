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

  useEffect(() => { document.body.className = theme; }, [theme]);

  useEffect(() => {
    const init = async () => {
  const waitForTron = () => new Promise(resolve => {
    const check = () => {
      if (window.tronWeb && window.tronWeb.defaultAddress.base58) {
        resolve(window.tronWeb);
      } else {
        setTimeout(check, 250);
      }
    };
    check();
  });

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
          <select
            value={network}
            onChange={(e) => setNetwork(e.target.value)}
            className="tiny-button"
          >
            <option value="shasta">Shasta</option>
            <option value="mainnet">Mainnet</option>
          </select>
          <button className="tiny-button" onClick={() => i18n.changeLanguage('tr')}>TR</button>
          <button className="tiny-button" onClick={() => i18n.changeLanguage('en')}>EN</button>
          <button className="tiny-button" onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}>🎨</button>
        </div>

        <div className="card">
          <p><strong>{t("account")}:</strong> <code onClick={() => navigator.clipboard.writeText(account)}>{account}</code>
            <button style={{ marginLeft: '0.5rem', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowQR(true)}>
              <img src="/qr-icon.png" alt="QR Icon" style={{ width: '16px', height: '16px' }} />
            </button>
          </p>
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
  <button
    className="tiny-button"
    onClick={() => {
      const shareText = `${t("summary")}: ${tx.from === account ? t("outgoing") : t("incoming")}, ${t("amount")}: ${Number(tx.value) / 10 ** decimals} ${tokenSymbol}
${t("details")}: https://${network === 'mainnet' ? 'tronscan.org' : 'shasta.tronscan.org'}/#/transaction/${tx.transaction_id}`;
      if (navigator.share) {
        try {
        await navigator.share({ title: 'LIRENA Transaction', text: shareText });
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error(t("share_failed"));
          console.error(err);
        }
      }
      } else {
        navigator.clipboard.writeText(shareText);
        toast.success(t("copied"));
      }
    }}
  >📤 {t("share")}</button>
</li>
            ))}
          </ul>
        </div>

        {showQR && (
          <div className="qr-modal" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
            <div className="qr-content" style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '12px', textAlign: 'center', color: 'white', boxShadow: '0 0 20px rgba(0,0,0,0.3)' }}>
              <h4 style={{ marginBottom: '0.5rem' }}>{t("account")}</h4>
              <p style={{ fontSize: '0.85rem', wordBreak: 'break-all' }}>{account}</p>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?data=https://${network === 'mainnet' ? 'tronscan.org' : 'shasta.tronscan.org'}/#/address/${account}&size=160x160`} alt="QR Code" style={{ margin: '1rem auto', display: 'block' }} />
              <p style={{ color: 'red', marginTop: '0.5rem', fontSize: '0.8rem' }}>{t("qr_warning")}</p>
              <button onClick={() => setShowQR(false)} style={{ marginTop: '1rem', padding: '0.5rem 1rem', borderRadius: '6px', background: '#334155', color: 'white', border: 'none', cursor: 'pointer' }}>✖ {t("close")}</button>
            </div>
          </div>
        )}

        <footer style={{ marginTop: '2rem', padding: '1rem', textAlign: 'center', opacity: 0.5, fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} LIRENA. {t("footer")}
        </footer>

        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      </>)}
    </div>
  );
}

export default App;

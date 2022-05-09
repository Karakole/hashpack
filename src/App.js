import { HashConnect } from 'hashconnect';
import { useEffect, useState } from 'react';
import './App.css';
import ButtonAuthenticate from './components/ButtonAuthenticate';
import dAppMetadata from './components/dapp-metadata.json';
import InputPairing from './components/InputPairing';

const App = () => {

  const [hashconnect, setHashconnect] = useState(new HashConnect(true));

  const [saveDatas, setSaveDatas] = useState({
    privKey: null, // user's session id important
    topic: null, // node's id connection important
    pairedWalletData: null, // datas about wallet connected important
    pairingString: '', // string that will link dApp with Wallet
    pairedAccounts: [] // list of wallet connected
  });

  const [pairingEvent, setPairingEvent] = useState(false);



  /**
   * Check if there are datas in Local Storage
   * @returns boolean
   */
  const loadLocalData = () => {

    const foundData = localStorage.getItem("hashconnectData");

    if (foundData) {

      const localDatas = JSON.parse(foundData);

      console.log(localDatas);

      setSaveDatas({
        ...saveDatas,
        privKey: localDatas.privKey,
        topic: localDatas.topic,
        pairedWalletData: localDatas.pairedWalletData,
        pairingString: localDatas.pairingString,
        pairedAccounts: localDatas.pairedAccounts
      })
      return true;
    } else {
      return false;
    }
  }


  const initAndConnect = async () => {

    if (!loadLocalData()) {
      const initData = await hashconnect.init(dAppMetadata);
      const state = await hashconnect.connect();
      const pairingString = hashconnect.generatePairingString(state, "testnet", false);
      setSaveDatas({
        ...saveDatas,
        privKey: initData.privKey,
        topic: state.topic,
        pairingString
      })
      
    } else {
      await hashconnect.init(dAppMetadata, saveDatas.privKey);
      await hashconnect.connect(saveDatas.topic, saveDatas.pairingString);
    }


  }

  /**
   * Save connection's datas in localstorage
   */

  const saveDataInLocalstorage = () => {
    let data = JSON.stringify(saveDatas);

    localStorage.setItem("hashconnectData", data);
  }


  /**
   * Function to open Hashpack extension
   * Only works with HTTPS
   */
  const oneClickPairing = () => {
    hashconnect.findLocalWallets();
    hashconnect.foundExtensionEvent.once((walletMetadata) => {
      hashconnect.connectToLocalWallet(saveDatas.pairingString, walletMetadata);
    })
  }




  useEffect(() => {
    initAndConnect()
    /**
     * Listen to pairing Event
     * When wallet pair with Dapp
     */
    hashconnect.pairingEvent.on((data) => {
      console.log("Paired with wallet", data);

      const accounts = [];

      data.accountIds.forEach(id => {
        if (saveDatas.pairedAccounts.indexOf(id) === -1) {

          accounts.push(id);
        }

      })

      console.log(data);
      /**
       * Disfonctionnement du setSaveDatas A CORRIGER
       */
      setSaveDatas({
        ...saveDatas,
        pairedWalletData: data.metadata,
        pairedAccounts: accounts
      })
    })

  }, [])




  useEffect(() => {
    console.log(saveDatas);
    if (saveDatas.pairedWalletData && saveDatas.topic) {
      saveDataInLocalstorage()
    }
    
  }, [saveDatas])

  return (
    <>
      <InputPairing pairingString={saveDatas.pairingString} />
      <ButtonAuthenticate disabled={saveDatas.pairedAccounts.length < 1} hashconnect={hashconnect} saveDatas={saveDatas} />

    </>
  );
}

export default App;

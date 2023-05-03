export const connectWallet = async () => {
  console.log('connecting to wallet...');
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const obj = {
        status: "Click blue button to get your NFTs",
        address: addressArray[0],
      };
      return obj;
    } catch(err) {
      obj = {
        status: "😥 " + err.message,
        address: "",
      }
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
  console.log('close connectWallet');
};

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressWallet = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (addressWallet.length > 0) {
        return {
          address: addressWallet[0],
          status: "Click blue button to get your NFTs",
        };
      } else {
        return {
          address: "",
          status: "Connect your wallet or Plug in an address and this website will return all of its NFTs!",
        }
      }
    } catch(err) {
      console.error({err});
      obj = {
        status: "😥 " + err.message,
        address: "",
      }
    }
  } else {
    return {
      address: "",
      status: (
        <span>
          <p>
            {" "}
            🦊{" "}
            <a target="_blank" href={`https://metamask.io/download.html`}>
              You must install Metamask, a virtual Ethereum wallet, in your
              browser.
            </a>
          </p>
        </span>
      ),
    };
  }
  console.log('close getCurrentWalletConnected');
}

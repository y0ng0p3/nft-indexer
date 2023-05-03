import {
  Box,
  Button,
  Center,
  Flex,
  Heading,
  Image,
  Input,
  SimpleGrid,
  Text,
} from '@chakra-ui/react';
import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';
// require('dotenv').config();
// import 'dotenv';
import { connectWallet, getCurrentWalletConnected } from './utils/interact';

// dotenv.config();

function App() {
  const [userAddress, setUserAddress] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState([]);
  const [hasQueried, setHasQueried] = useState(false);
  const [loadingNFTs, setLoadingNTFs] = useState(false);
  const [isWalletConnected, setIsWalletConnected] = useState(false);
  const [tokenDataObjects, setTokenDataObjects] = useState([]);

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          setStatus("Click blue button to get your NFTs");
          setIsWalletConnected(true);
        } else {
          setUserAddress("");
          setStatus("🦊 Connect to Metamask using the top button or Plug in an address and this website will return all of its NFTs!");
        }
      });
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          <a target="_blank" href={`https://metamask.io/download.html`}>
            You must install Metamask, a virtual Ethereum wallet, in your
            browser.
          </a>
        </p>
      );
    }
  }

  useEffect(() => {
    const getCurrentWallet = async () => await getCurrentWalletConnected();
    const { address, status } = getCurrentWallet();
    setUserAddress(address);
    setStatus(status);

    addWalletListener();
  }, []);

  async function handleConnectWallet() {
    const walletResponse = await connectWallet();
    setUserAddress(walletResponse.address);
    setStatus(walletResponse.status);
    setIsWalletConnected(true);
  }

  async function getNFTsForOwner() {
    setLoadingNTFs(true);
    const config = {
      apiKey: import.meta.env.ALCHEMY_KEY,
      network: Network.ETH_GOERLI,
    };

    const alchemy = new Alchemy(config);
    const data = await alchemy.nft.getNftsForOwner(userAddress);
    setResults(data);

    const tokenDataPromises = [];

    for (let i = 0; i < data.ownedNfts.length; i++) {
      const tokenData = alchemy.nft.getNftMetadata(
        data.ownedNfts[i].contract.address,
        data.ownedNfts[i].tokenId
      );
      tokenDataPromises.push(tokenData);
    }

    setTokenDataObjects(await Promise.all(tokenDataPromises));
    setLoadingNTFs(false);
    setHasQueried(true);
  }
  return (
    <Box w="100vw">
      <Center>
        <Flex
          alignItems={'center'}
          justifyContent="center"
          flexDirection={'column'}
        >
          <Button fontSize={20} onClick={handleConnectWallet} mb={12} borderColor={'purple'}>
            Connect Wallet
          </Button>
          <Heading mb={0} fontSize={36}>
            NFT Indexer 🖼
          </Heading>
          <Text>
            {status}
          </Text>
        </Flex>
      </Center>
      <Flex
        w="100%"
        flexDirection="column"
        alignItems="center"
        justifyContent={'center'}
      >
        {!isWalletConnected ?
          (<>
            <Heading mt={42}>Get all the ERC-721 tokens of this address:</Heading>
            <Input
              onChange={(e) => setUserAddress(e.target.value)}
              color="black"
              w="600px"
              textAlign="center"
              p={4}
              bgColor="white"
              fontSize={24}
            />
          </>)
          : (<Heading mt={42}>Get all the ERC-721 tokens of the connected wallet.</Heading>)
        }
        <Button fontSize={20} onClick={getNFTsForOwner} mt={36} bgColor="blue">
          Fetch NFTs
        </Button>
        {loadingNFTs ? (
          'Loading NFTs...'
        ) : ('')}

        <Heading my={36}>Here are your NFTs:</Heading>

        {hasQueried ? (
          <SimpleGrid w={'90vw'} columns={4} spacing={24}>
            {results.ownedNfts.map((e, i) => {
              return (
                <Flex
                  flexDir={'column'}
                  color="white"
                  bg="blue"
                  w={'20vw'}
                  key={e.tokenId}
                >
                  <Box>
                    <b>Name:</b>{' '}
                    {tokenDataObjects[i].title?.length === 0
                      ? 'No Name'
                      : tokenDataObjects[i].title}
                  </Box>
                  <Image
                    src={
                      tokenDataObjects[i]?.rawMetadata?.image ??
                      'https://via.placeholder.com/200'
                    }
                    alt={'Image'}
                  />
                </Flex>
              );
            })}
          </SimpleGrid>
        ) : (
          'Please make a query! The query may take a few seconds...'
        )}
      </Flex>
    </Box>
  );
}

export default App;

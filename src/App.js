import { useState } from "react";
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();
import "./App.css";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const Web3 = require("web3");
const web3 = new Web3("ws://localhost:8545");

function App() {
  const [address, setAddress] = useState("");
  const [updated, setUpdated] = useState(address);
  const [advice, setAdvice] = useState("");
  const transactionsAsStrings = "";

  const getTransactions = (walletAddress) => {
    web3.eth
      .getPastEvents("allEvents", {
        fromBlock: 0,
        toBlock: "latest",
        filter: { walletAddress },
      })
      .then((events) => {
        console.log(events);
        events.forEach((event) => {
          web3.eth
            .getTransactions(event.transactionHash)
            .then((transaction) => {
              const transactionValue = web3.utils.fromWei(
                transaction.value,
                "ether"
              );
              const from = transaction.from;
              transactionsAsStrings.append(
                `${
                  from == address ? "bought for " : "sold for"
                } ${transactionValue} ether,`
              );
              console.log(
                `${
                  from == address ? "bought for " : "sold for"
                } ${transactionValue} ether,`
              );
            });
        });
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const gpt = async () => {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `Analyze the following trading history on the ethereum network. 
      Make notes on the frequency, trading amounts and profits. 
      Give advice on what this trader could do better ${transactionsAsStrings}`,
    });
    setAdvice(completion.data.choices[0].text);
    console.log(completion.data.choices[0].text);
  };

  const handleChange = (event) => {
    setMessage(event.target.value);
  };

  return (
    <div className="App">
      <p>Enter your wallet address: </p>
      <input
        type="text"
        id="address"
        name="address"
        value="address"
        onChange={handleChange}
      />
      <button
        onClick={() => {
          getTransactions(address);
          gpt();
        }}
      >
        Get advice!
      </button>
      <p>Here is your advice: {advice}</p>
    </div>
  );
}

export default App;

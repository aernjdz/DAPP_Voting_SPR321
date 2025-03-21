let web3;
let contract;
let account;
let votingContractAddress = "0x25f96898e27d627a60361E31722f0038C8FB96Ac"; 
let contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      }
    ],
    "name": "CandidateAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amount",
        "type": "uint256"
      }
    ],
    "name": "FundsTransferred",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "voter",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "VotingReset",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidates",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "voteCost",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "voters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "votes",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "votingActive",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      }
    ],
    "name": "pushCandidate",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "candidate",
        "type": "address"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function",
    "payable": true
  },
  {
    "inputs": [],
    "name": "getWinner",
    "outputs": [
      {
        "internalType": "address",
        "name": "winner",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  },
  {
    "inputs": [],
    "name": "getBalance",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "resetVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "stopVoting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCandidatesCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function",
    "constant": true
  }
];

window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await ethereum.enable(); 
            initializeApp();
        } catch (error) {
            showAlert("Error", "User denied account access");
        }
    } else {
        showAlert("Error", "Please install MetaMask to interact with the blockchain");
    }
});

async function initializeApp() {
    contract = new web3.eth.Contract(contractABI, votingContractAddress);
    const accounts = await web3.eth.getAccounts();
    const balance = await web3.eth.getBalance(accounts[0]);
    const formattedBalance = web3.utils.fromWei(balance, "ether");
    document.getElementById('balance').innerText = `${formattedBalance} ETH`;

    document.getElementById('addCandidateBtn').addEventListener('click', () => addCandidate(accounts[0]));
    document.getElementById('voteBtn').addEventListener('click', () => voteForCandidate(accounts[0]));
    document.getElementById('showResultsBtn').addEventListener('click', () => showResults());
    document.getElementById('resetElectionBtn').addEventListener('click', () => resetElection());  // Кнопка для скидання виборів

    loadCandidates();
}

async function addCandidate(account) {
  const candidateAddress = document.getElementById('candidateName').value;
  if (!web3.utils.isAddress(candidateAddress)) {
      showAlert("Error", "Please enter a valid Ethereum address as a candidate");
      return;
  }

  const addFee = web3.utils.toWei("0.1", "ether"); 
  try {
      await contract.methods.pushCandidate(candidateAddress).send({ from: account, value: addFee });
      showAlert("Success", "Candidate added successfully!");
      loadCandidates(); 
  } catch (error) {
      showAlert("Error", "Error adding candidate: " + error.message);
  }
}

async function voteForCandidate(account) {
  const selectedCandidateAddress = document.getElementById('voteSelect').value;
  if (!web3.utils.isAddress(selectedCandidateAddress)) {
      showAlert("Error", "Please select a valid candidate");
      return;
  }

  const voteFee = web3.utils.toWei("0.1", "ether"); 
  try {
      const hasVoted = await contract.methods.voters(account).call();
      if (hasVoted) {
          showAlert("Error", "You have already voted");
          return;
      }

      await contract.methods.vote(selectedCandidateAddress).send({ from: account, value: voteFee });
      showAlert("Success", `You have voted for candidate: ${selectedCandidateAddress}`);
      loadCandidates(); 
  } catch (error) {
      showAlert("Error", "Error voting: " + error.message);
  }
}

async function loadCandidates() {
  try {
      const list = document.getElementById('candidatesList');
      const voteSelect = document.getElementById('voteSelect');

      const candidatesCount = await contract.methods.getCandidatesCount().call();
      

      list.innerHTML = '';
      voteSelect.innerHTML = '';

      for (let i = 0; i < candidatesCount; i++) {
          const candidateAddress = await contract.methods.candidates(i).call();

          const listItem = document.createElement('li');
          listItem.className = "list-group-item";
          listItem.innerText = `${i + 1}. ${candidateAddress}`;
          list.appendChild(listItem);

          const option = document.createElement('option');
          option.value = candidateAddress;
          option.innerText = candidateAddress;
          voteSelect.appendChild(option);
      }
  } catch (error) {
      showAlert("Error", "Error loading candidates: " + error.message);
  }
}

async function showResults() {
  try {
  
    const winner = await contract.methods.getWinner().call();
    document.getElementById('winnerAddress').innerText = `The winner is: ${winner}`;
    document.getElementById('voteResult').hidden = false;

  
    await resetVoting();
  } catch (error) {
    showAlert("Error", "Error showing results: " + error.message);
  }
}

// Reset the voting process
async function resetVoting() {
  const accounts = await web3.eth.getAccounts();
  account = accounts[0];
  try {
      if (!account) {
          showAlert("Error", "No account available");
          return;
      }


      await contract.methods.resetVoting().send({ from: account });
      showAlert("Success", "Voting reset successfully");
      loadCandidates();  // Reload the candidates list after resetting
  } catch (error) {
      showAlert("Error", "Error resetting voting: " + error.message);
  }
}


async function resetElection() {
  const accounts = await web3.eth.getAccounts();
  try {
      await contract.methods.resetVotes().send({ from: accounts[0] });
      showAlert("Success", "The election has been reset. You can vote again.");
      loadCandidates(); 
  } catch (error) {
      showAlert("Error", "Error resetting the election: " + error.message);
  }
}

function showAlert(title, msg) {
  alert(`${title}: ${msg}`);
}

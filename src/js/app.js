let web3;
let contract;
let account;
let votingContractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 
let contractABI =  [
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
    "type": "function"
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
    "name": "getCandidatesCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
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
    "type": "function"
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
    "type": "function"
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
    "type": "function"
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
    "type": "function"
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
    "type": "function"
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
    "type": "function"
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
    "type": "function"
  }
];

window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            // Request account access using the newer method
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            initializeApp();
        } catch (error) {
            showAlert("Error", "User denied account access");
        }
    } else {
        showAlert("Error", "Please install MetaMask to interact with the blockchain");
    }
});

async function initializeApp() {
    try {
        contract = new web3.eth.Contract(contractABI, votingContractAddress);
        const accounts = await web3.eth.getAccounts();
        account = accounts[0]; // Store the current account
        
        // Update account balance display
        await updateBalance();
        
        // Setup event listeners for buttons
        document.getElementById('addCandidateBtn').addEventListener('click', addCandidate);
        document.getElementById('voteBtn').addEventListener('click', voteForCandidate);
        document.getElementById('showResultsBtn').addEventListener('click', showResults);
        document.getElementById('resetElectionBtn').addEventListener('click', resetElection);
        
        // Initial data load
        loadCandidates();
        
        // Listen for account changes
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', function (accounts) {
                account = accounts[0];
                updateBalance();
            });
        }
    } catch (error) {
        console.error("Initialization error:", error);
        showAlert("Error", "Failed to initialize application: " + error.message);
    }
}

async function updateBalance() {
    try {
        const balance = await web3.eth.getBalance(account);
        const formattedBalance = web3.utils.fromWei(balance, "ether");
        document.getElementById('balance').innerText = `${formattedBalance} ETH`;
    } catch (error) {
        console.error("Error updating balance:", error);
    }
}

async function addCandidate() {
    const candidateAddress = document.getElementById('candidateName').value;
    
    // Validate the address format
    if (!web3.utils.isAddress(candidateAddress)) {
        showAlert("Error", "Please enter a valid Ethereum address as a candidate");
        return;
    }

    const addFee = web3.utils.toWei("0.1", "ether");
    
    try {
        console.log("Adding candidate:", candidateAddress);
        console.log("From account:", account);
        console.log("Fee:", addFee);
        
        // Estimate gas first to check if the transaction will succeed
        const gasEstimate = await contract.methods.pushCandidate(candidateAddress)
            .estimateGas({ from: account, value: addFee });
            
        console.log("Gas estimate:", gasEstimate);
        
        // Add some buffer to the gas estimate
        const gas = Math.floor(gasEstimate * 1.2);
        
        // Send the transaction with the calculated gas
        const result = await contract.methods.pushCandidate(candidateAddress)
            .send({ 
                from: account, 
                value: addFee,
                gas: gas
            });
            
        console.log("Transaction result:", result);
        showAlert("Success", "Candidate added successfully!");
        
        // Clear the input field
        document.getElementById('candidateName').value = '';
        
        // Reload the candidates list
        loadCandidates();
        
        // Update balance after transaction
        updateBalance();
    } catch (error) {
        console.error("Detailed error:", error);
        showAlert("Error", "Error adding candidate: " + (error.message || error));
    }
}

async function voteForCandidate() {
    const selectedCandidateAddress = document.getElementById('voteSelect').value;
    
    // Validate the selection
    if (!selectedCandidateAddress || !web3.utils.isAddress(selectedCandidateAddress)) {
        showAlert("Error", "Please select a valid candidate");
        return;
    }

    const voteFee = web3.utils.toWei("0.1", "ether");
    
    try {
        // Check if user has already voted
        const hasVoted = await contract.methods.voters(account).call();
        if (hasVoted) {
            showAlert("Error", "You have already voted");
            return;
        }

        // Estimate gas for the transaction
        const gasEstimate = await contract.methods.vote(selectedCandidateAddress)
            .estimateGas({ from: account, value: voteFee });
        
        // Add some buffer to the gas estimate
        const gas = Math.floor(gasEstimate * 1.2);
        
        // Send the transaction
        const result = await contract.methods.vote(selectedCandidateAddress)
            .send({ 
                from: account, 
                value: voteFee,
                gas: gas
            });
            
        console.log("Vote transaction result:", result);
        showAlert("Success", `You have voted for candidate: ${selectedCandidateAddress}`);
        
        // Reload candidates and update balance
        loadCandidates();
        updateBalance();
    } catch (error) {
        console.error("Voting error:", error);
        showAlert("Error", "Error voting: " + (error.message || error));
    }
}

async function loadCandidates() {
    try {
        const list = document.getElementById('candidatesList');
        const voteSelect = document.getElementById('voteSelect');

        // Get the number of candidates
        const candidatesCount = await contract.methods.getCandidatesCount().call();
        console.log("Total candidates:", candidatesCount);

        // Clear existing lists
        list.innerHTML = '';
        voteSelect.innerHTML = '<option value="">Select a candidate</option>';

        // Check if there are any candidates
        if (candidatesCount == 0) {
            list.innerHTML = '<li class="list-group-item">No candidates available</li>';
            return;
        }

        // Populate the lists with candidates
        for (let i = 0; i < candidatesCount; i++) {
            const candidateAddress = await contract.methods.candidates(i).call();
            const voteCount = await contract.methods.votes(candidateAddress).call();

            // Add to the display list
            const listItem = document.createElement('li');
            listItem.className = "list-group-item d-flex justify-content-between align-items-center";
            listItem.innerHTML = `
                <span>${i + 1}. ${candidateAddress}</span>
                <span class="badge bg-primary rounded-pill">${voteCount} votes</span>
            `;
            list.appendChild(listItem);

            // Add to the dropdown
            const option = document.createElement('option');
            option.value = candidateAddress;
            option.innerText = `${candidateAddress} (${voteCount} votes)`;
            voteSelect.appendChild(option);
        }
        
        // Check if the current user has voted
        const hasVoted = await contract.methods.voters(account).call();
        document.getElementById('voteBtn').disabled = hasVoted;
        if (hasVoted) {
            document.getElementById('voteStatus').innerText = "You have already voted";
        } else {
            document.getElementById('voteStatus').innerText = "You can vote";
        }
        
        // Check if voting is active
        const isActive = await contract.methods.votingActive().call();
        if (!isActive) {
            document.getElementById('voteBtn').disabled = true;
            document.getElementById('voteStatus').innerText = "Voting is closed";
        }
    } catch (error) {
        console.error("Error loading candidates:", error);
        showAlert("Error", "Error loading candidates: " + (error.message || error));
    }
}

async function showResults() {
    try {
        // Try to get the winner
        const winner = await contract.methods.getWinner().call();
        const voteCount = await contract.methods.votes(winner).call();
        
        // Display the winner
        document.getElementById('winnerAddress').innerText = `The winner is: ${winner} with ${voteCount} votes`;
        document.getElementById('voteResult').hidden = false;
    } catch (error) {
        console.error("Error showing results:", error);
        showAlert("Error", "Error showing results: " + (error.message || error));
    }
}

async function resetElection() {
    try {
        // Check if the current user is the owner
        const contractOwner = await contract.methods.owner().call();
        if (account.toLowerCase() !== contractOwner.toLowerCase()) {
            showAlert("Error", "Only the contract owner can reset the election");
            return;
        }

        // Estimate gas for the transaction
        const gasEstimate = await contract.methods.resetVoting()
            .estimateGas({ from: account });
        
        // Add some buffer to the gas estimate
        const gas = Math.floor(gasEstimate * 1.2);
        
        // Reset the voting
        const result = await contract.methods.resetVoting()
            .send({ 
                from: account,
                gas: gas
            });
            
        console.log("Reset transaction result:", result);
        showAlert("Success", "The election has been reset. Voters can vote again.");
        
        // Hide the results section
        document.getElementById('voteResult').hidden = true;
        
        // Reload the candidates list
        loadCandidates();
    } catch (error) {
        console.error("Reset error:", error);
        showAlert("Error", "Error resetting the election: " + (error.message || error));
    }
}

function showAlert(title, msg) {
    console.log(`${title}: ${msg}`);
    alert(`${title}: ${msg}`);
}
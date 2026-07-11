---
base: "[[Media.base]]"
Type: Book
Summary: ""
ASIN: ""
Author: []
---
# **Blockchain**

![](https://lh7-us.googleusercontent.com/O6juVvfqtFLWd12lN-kxF7TJd5IIPrIGXjPfx-5JFHZ6w0NorZwbTvRR9SWabA52A2iziWtzji2qkJzbtphGxn3wFlS5LQ9sN4WDTlsmb4s0K57zumSWuaEZ1Z3PEmodAr30cqgEv3zNoc2wBBu7Yg)

# **23 March 2019**

Motivation:

- When you vote, do you know if your ballot is actually counted?
- Meeting someone online, do you know the true identity?
- Buying coffee, are you certain of its origin?

A system of records need to be maintained and security should be guaranteed. No one should be able to edit the record.

**Questions to ask to identify if a use case really requires blockchain**

- **Why blockchain vs database?**
    - ****This is the most important piece to identify first, a lot of time can be wasted in discovery if there is no real blockchain use case
- Do multiple parties **share **data?
- Do multiple parties **update **data?
- Is there a requirement for verification?
- Can **intermediaries **be removed and reduce cost and complexity?
- What is the use case?

## **Blockchain**

Blockchain stores information among a network of personal computers.  Not just decentralized but distributed. ([https://youtu.be/r43LhSUUGTQ?t=44](https://youtu.be/r43LhSUUGTQ?t=44)). Bundles of records called blocks are arranged in chronological order in chains. Blockchain use cryptography to ensure that blocks are not counterfeited.

There are multiple public blockchains like Bitcoin, Etherium, NXT.

Bitcoin(BTC) is one example of how trading can done via blockchain.

No middle-man is involved. People in the network help move money by validating bitcoin transactions with their personal computers, earning a small fee in the process.

Instead of a single database, some sort of list is held by all people in the network, gets validated and becomes the updated list.

Blockchain is the algorithm for Distributed Ledger Technology (DLT ).

A Block contains

- Block no.
- Data
- Nonce
- Block hash
- Hash of the previous block

Data depends on the type of blockchain. In bitcoin, data is the details about a transaction such as the sender, receiver and number of coins.

First block is called the Genesis block.

**If everyone maintains their own ledger, how are all the ledgers kept in sync?**

As soon as someone creates a transaction, it is broadcasted to everyone in the whole network.

In bitcoin, a private key is created for every account number. A function uses this private key and the transaction message to create a unique signature. Another function uses this signature and the transaction message to validate the transaction.

Concepts used to create signature - Elliptic curve digital signature algorithm and mathematical trapdoor.

This gives data on who sent the transaction, but “when” the transaction happened is missing. There can be network delays.  This may allow people to double spend.

**How double spending is avoided in bitcoin?**

The transactions go into a large pool of pending transactions. From there they will be put into a long chain that locks the order. The order in which they are put in chain is kind of a mathematical lottery. Participants select a pending transaction of their choice and begin trying to solve a special problem that will link it to the end of the chain.

This special problem is: f(?) = x, guess the number. Since this function is a one-way hash, it has to be a random guess. (The output of this function also lets us know the number of guesses done to identify the solution. This gives a good sense of how many people are using this blockchain. WHAT HOW?)

In more detail, Block hash should have n leading zeros. Eg. for n = 4, the hash should be **0000**A34KJSFG687S9FIUSJNGAFSD78S65DTVGHDFJNKKGNSKDA. This can be tweaked using the nonce value. Since all other data in a block is fixed, the nonce should be tweaked such that the required format of hash is generated.

**Problem: **If a block is tampered, its hash changes and causes problem to all subsequent blocks. Also our computers are efficient and can calculate millions of hashes per second, it can replace the hashes in all subsequent blocks.

To mitigate this, blockchain has something called Proof of Work. It’s a mechanism that slows down the creation of new blocks. In Bitcoin, for example, it takes 10 minutes to add a new block to the chain. If at least 51% of the nodes remain honest in a blockchain network, it will be difficult for the fraudulent nodes to catch up.

The transactions in a block on bitcoin is stored in merkle tree. Instead of traversing through the records linearly, merkle tree traverses based on hash.

**Smart contracts**. Howww?

Whenever an event happens, it triggers another event automatically.

Smart contracts are simple programs that can be used to automatically exchange coins based on certain conditions.

Blockchain relies on some form of challenge such that no one actor on the network is able to solve the challenge consistently more than everyone else on the network.

People are leveraging blockchain to create identity structures to cryptographically assign for a given attribute. Eg. Government could sign that you have a passport, university could sign that you are a currently enrolled student. So you can control that information and provide proof on demand basis.

Applications:

- Make self-driving cars safer.
- Protect our online identity
- Track billions of things in IoT
- Electricity - distributed smart grid technology
- So many applications in this link - [https://blockgeeks.com/guides/what-is-blockchain-technology/](https://blockgeeks.com/guides/what-is-blockchain-technology/)

Private vs public blockchains have use cases of their own

[https://medium.com/coinmonks/public-vs-private-blockchain-in-a-nutshell-c9fe284fa39f](https://medium.com/coinmonks/public-vs-private-blockchain-in-a-nutshell-c9fe284fa39f)

Hyperledger is an umbrella project of open source blockchains and related tools. Its purpose is mainly for B2B solutions where the there is scalability and privacy.

- The transactions are private and permissioned
- Mining solutions not necessary
- Consensus is achieved using Practical Byzantine Fault Tolerance (PBFT). **Enna karmam da idhu?**

On the contrary ethereum is an open source public blockchain, where mining solutions are required. ETH or Ξ is the currency.

Beginner level - [https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369](https://medium.com/@preethikasireddy/how-does-ethereum-work-anyway-22d1df506369)

**Doubts:**

Bitcoins are getting stolen / lost. Howww?

We are not just cutting out the fee-processing middle man, we are also eliminating the need for the match-making platform. Howww?

Proof of work vs Proof of stakes

Cryptoeconomics

**Reference:**

- [https://www.youtube.com/watch?v=r43LhSUUGTQ](https://www.youtube.com/watch?v=r43LhSUUGTQ)
- [https://www.youtube.com/watch?v=hYip_Vuv8J0](https://www.youtube.com/watch?v=hYip_Vuv8J0)
- [https://www.youtube.com/watch?v=8fbhI1qVj0c](https://www.youtube.com/watch?v=8fbhI1qVj0c)
- [https://www.youtube.com/watch?v=SSo_EIwHSd4](https://www.youtube.com/watch?v=SSo_EIwHSd4)
- [https://www.youtube.com/watch?v=l9jOJk30eQs](https://www.youtube.com/watch?v=l9jOJk30eQs) - technical
- [https://www.youtube.com/watch?v=Lx9zgZCMqXE](https://www.youtube.com/watch?v=Lx9zgZCMqXE) - under the hood - goood
- [https://www.youtube.com/watch?v=B9tlH8lzKI4&feature=youtu.be](https://www.youtube.com/watch?v=B9tlH8lzKI4&feature=youtu.be) - AWS re.Invent Amazon managed blockchain
- [https://bitcoin.org/bitcoin.pdf](https://bitcoin.org/bitcoin.pdf)
- [https://www.khanacademy.org/computing/computer-science/cryptography/modern-crypt/v/discrete-logarithm-problem](https://www.khanacademy.org/computing/computer-science/cryptography/modern-crypt/v/discrete-logarithm-problem) - RSA encryption
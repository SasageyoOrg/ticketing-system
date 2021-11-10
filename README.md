<p align="center">
  <a href="" rel="noopener">
  <img width=320px height=240px src="https://www.digitalberry.fr/wp-content/uploads/2019/07/Blockchain-traçabilité-des-données-et-archivage-à-valeur-probante.jpg" alt="Project logo"></a>
</p>

<h1 align="center">Ticketing System</br><sub></sub></h1>

## 📝 Table of Contents
- [About](#about)
- [Project Topology](#project-topology)
- [Usage](#usage)
- [Authors](#authors)
- [Acknowledgments](#acknowledgement)

## 📋About <a name = "about"></a>
Ticketing system based on the blockchain technology made with Quorum Wizard and Truffle, with a decentralized application written in React.

## 🗂 Project Topology <a name="project-topology"></a>

```
.
├── LICENSE
├── README.md
├── common.sh
├── dapp
│   ├── docker-compose.yml
│   ├── dockerfile.react
│   ├── node_modules
│   ├── package-lock.json
│   ├── package.json
│   ├── public
│   └── src
├── network
│   ├── attach.sh
│   ├── docker-compose.yml
│   └── qdata
├── runme.sh
└── truffle
    ├── build
    ├── contracts
    ├── docker-compose.yml
    ├── dockerfile.trufflemigrate
    ├── dockerfile.truffletest
    ├── migrations
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    ├── test
    └── truffle-config.js
```

## 👩‍💻Usage <a name="usage"></a>
1. Clone the project.
2. Start the docker application.
3. Run the command below from the root directory to run the blockchain (from Quorum Wizard with IBFT), deploy the smart contracts to the network and start the decentralized app:
    ```sh
    ./runme.sh --start-all
    ```
   - other commands available:
        ```
        ./runme.sh <command>
            --start-all     start the complete system (truffle and the dapp will wait cakeshop to start up)
            --start-q       start the quorum blockchain
            --start-tr      start the truffle migration and the dapp
            --truffle-test  run the truffle tests (it also start the blockchain if it's not running)
            --stop-q        stop the quorum blockchain
            --stop          stop the complete system (quorum|truffle|dapp)
            --restart       restart the complete system (with --start-all method)
        ``` 
4. Configure Metamask with RPC url `http://localhost:22000`
5. Import the accounts in Metamask by taking the private keys below:
    ```
    Event Manager       ->   Address: 0xed9d02e382b34818e88B88a309c7fe71E65f419d
                             Private Key: 0xe6181caaffff94a09d7e332fc8da9884d99902c7874eb74354bdcadf411929f1


    Ticket Inspector    ->   Address:0x81559247E62fDb78A43e9535f064ED62B11B6830
                             Private Key: 0xde405e2f3cea4da31ea886d9f93f8855f8925b35f39f8d01ddc08b588be118fe


    Ticket Buyer #1     ->   Address: 0xB4dc6aE681Fa6D5433e68D76aC9318b734F49001
                             Private Key: 0xeccc28aa6410da0d6bd19efdef33b5b7b9e2c5adcd9e8ab899d3369aaa386e72
                                

    Ticket Buyer #2     ->   Address: 0x4d929E07c173ceA67f8008bb19A151e0564e1362
                             Private Key: 0x526ba301ffd7369d010a07c2d44167e4e7c1b7ff1dd85b475b708a1078d04450
    
    ```
    ATTENTION: it's necessary to reset each account, once imported:
    ```
    account -> settings -> advanced -> reset-account
    ```
6. Cakeshop will be accessible at `http://localhost:8999/`
8. React application will be accessible at `http://localhost:3000/`

## ✍️ Authors <a name = "authors"></a>

- Conti Edoardo [@edoardo-conti](https://github.com/edoardo-conti)
- Federici Lorenzo [@lorenzo-federici](https://github.com/lorenzo-federici)
- Melnic Andrian [@andrian-melnic](https://github.com/andrian-melnic)

## 🎉 Acknowledgements <a name = "acknowledgement"></a>

- [51188] Software Cybersecurity Class - Professor <a href="https://www.univpm.it/Entra/Engine/RAServePG.php/P/320710010421/idsel/299/docname/LUCA%20SPALAZZI"><i>Luca Spalazzi</i></a>
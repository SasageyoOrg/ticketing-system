# ticketing-system
1. Clone the project.
2. Start the docker application.
3. Run the command below from the root directory to run the quorum blockchain, deploy the smart contracts to the network and start the decentralized app:
    ```sh
    ./runme.sh start
    ```
   - other commands available:
       ```
      ./runme.sh <command>
      remove        Stop and remove the containers (blockchain + truffle + react)
      stop          Stop the containers (same)
      resume        Resume the containers (same)
      restart       Launch commands "./runme.sh remove" and "./runme.sh start"
        ``` 
4. Configure Metamask with RPC url `http://localhost:8545`
5. Import the accounts in Metamask by taking the private keys below (set one account to organiser and the others as customers):
    ```
    8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63
    c87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3
    ae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f
    ```
6. Cakeshop will be accessible at `http://localhost:8999/`
7. Block Explorer will be accessible at `http://localhost:25000/`
8. React application will be accessible at `http://localhost:3000/`

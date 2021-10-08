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
5. Import the accounts in Metamask by taking the private keys below:
    ```
    Organizzatore   -> 0x60bbe10a196a4e71451c0f6e9ec9beab454c2a5ac0542aa5b8b733ff5719fec3
    Controllore     -> 0xde405e2f3cea4da31ea886d9f93f8855f8925b35f39f8d01ddc08b588be118fe
    Cliente         -> 0xeccc28aa6410da0d6bd19efdef33b5b7b9e2c5adcd9e8ab899d3369aaa386e72
    ```
6. Cakeshop will be accessible at `http://localhost:8999/`
7. Block Explorer will be accessible at `http://localhost:25000/`
8. React application will be accessible at `http://localhost:3000/`

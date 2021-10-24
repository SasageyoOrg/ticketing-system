#!/bin/bash

npm i
# npm install -g truffle@5.1.65

truffle migrate --reset

cd ../dapp/src/abi/contracts
rm *.json 2> /dev/null
cp -a ../../../../truffle/build/contracts/. ./
#!/bin/bash

cd ../dapp/src/abi/contracts
rm *.json 2> /dev/null
cp -a ../../../../truffle/build/contracts/. ./
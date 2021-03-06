#!/bin/bash -u

# markdown
bold=$(tput bold)
normal=$(tput sgr0)

# requirements
. ./common.sh

# functions 
startq() {
    # START ->
    echo "Starting the quorum network..."
    cd network && docker compose up -d
    # <- END START
}

starttr() {
    if [ ! "$(docker ps -q -f name=blockchain-sc)" ]; then
        startq
        waitcs
        cd ../
    fi

    echo "Starting the truffle migration..."
    cd truffle && docker compose --profile trufflemigrate up 

    echo "Starting the react application..."
    cd  ../dapp && docker compose up
}

startr() {
    cd dapp

    if [[ ! "$(docker images -q dapp_react 2> /dev/null)" == "" ]]; then
        docker compose down
        docker image rm dapp_react
    fi

    echo "Starting the react application..."
    docker compose up
}

waitcs() {
    if ! command -v wget &> /dev/null
    then
        echo "${bold}Warning:${normal} wget isn't installed. Restart truffle e dapp manually once installed."
        exit 
    else
        echo "Waiting cakeshop to launch on 8999..."
        wget -q --spider --proxy=off http://localhost:8999/actuator/health
        echo "Cakeshop started successfully!"
    fi
}

truffletest() {
    if [ ! "$(docker ps -q -f name=blockchain-sc)" ]; then
        startq
        waitcs
        cd ../
    fi

    echo "Starting the truffle test..."
    cd truffle && docker compose --profile truffletest up 
}

startall() {
    # START ->
    startq

    waitcs

    cd ../
    starttr
    # <- END START
}

stopq() {
    # STOP ->

    cd network
    docker compose down
    docker compose rm -sfv

    docker volume rm $(docker volume ls -q)

    if [[ ! "$(docker images -q dapp_react 2> /dev/null)" == "" ]]; then
        docker image rm dapp_react
    elif [[ ! "$(docker images -q truffle_trufflemigrate 2> /dev/null)" == "" ]]; then
        docker image rm truffle_trufflemigrate:latest
    elif [[ ! "$(docker images -q truffle_truffletest 2> /dev/null)" == "" ]]; then
        docker image rm truffle_truffletest:latest
    fi
    
    cd ../
    # <- END STOP 
}

stopall() {
    # STOP ->
    cd network && docker compose down && docker compose rm -sfv 

    cd ../truffle && docker compose down && docker compose rm -sfv

    cd ../dapp && docker compose down && docker compose rm -sfv

    cd ../

    docker volume rm $(docker volume ls -q)

    if [[ ! "$(docker images -q dapp_react 2> /dev/null)" == "" ]]; then
        docker image rm dapp_react
    elif [[ ! "$(docker images -q truffle_trufflemigrate 2> /dev/null)" == "" ]]; then
        docker image rm truffle_trufflemigrate
    elif [[ ! "$(docker images -q truffle_truffletest 2> /dev/null)" == "" ]]; then
        docker image rm truffle_truffletest
    fi

    # <- END STOP 
}

if [ $# -eq 0 ] 
then
    # nessun argomento, comportamento default
    echo "Error, you can't launch this command without parameters. Try with: \"./runme.sh --help\""
elif [ "$1" = "--start-all" ]; 
then
    startall
elif [ "$1" = "--start-q" ]; 
then
    startq
elif [ "$1" = "--start-tr" ]; 
then
    starttr
elif [ "$1" = "--start-r" ]; 
then
    startr
elif [ "$1" = "--truffle-test" ]; 
then
    truffletest
elif [ "$1" = "--stop-q" ]; 
then
    stopq
elif [ "$1" = "--stop" ]; 
then
    stopall
elif [ "$1" = "--restart" ]; 
then
    stopall
    echo "Waiting 5 seconds..."
    sleep 5
    startall
elif [ "$1" = "--help" ]; 
then
    echo -e "${bold}--start-all${normal} \t -> start the complete system (truffle and the dapp will wait cakeshop to start up)"
    echo -e "${bold}--start-q${normal} \t -> start the quorum blockchain"
    echo -e "${bold}--start-tr${normal} \t -> start the truffle migration and the dapp"
    echo -e "${bold}--start-r${normal} \t -> start the react application"
    echo -e "${bold}--truffle-test${normal} \t -> start the quorum blockchain if it's not running and run the truffle tests"
    echo -e "${bold}--stop-q${normal} \t -> stop the quorum blockchain"
    echo -e "${bold}--stop${normal} \t\t -> stop the complete system (quorum|truffle|dapp)"
    echo -e "${bold}--restart${normal} \t -> restart the complete system (with --start-all method)"
    echo ""
else
    echo "Error, this option doesn't exist. Try with: \"./runme.sh --help\""
fi
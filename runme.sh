#!/bin/bash -u

bold=$(tput bold)
normal=$(tput sgr0)

startall() {
    # START ->
    echo "Starting the quorum network..."
    cd network && docker compose up -d

    if ! command -v wget &> /dev/null
    then
        echo "${bold}Warning:${normal} wget non è installato nel sistema. Riavviare in seguito truffle e dapp manualmente."
        exit 
    else
        echo "Waiting Cakeshop to launch on 8999..."
        wget -q --spider --proxy=off http://localhost:8999/actuator/health
        echo "Cakeshop launched!"
    fi

    echo "Starting the Truffle migration..."
    cd ../truffle && docker compose up 

    echo "Starting the React application..."
    cd  ../dapp && docker compose up
    # <- END START
}

startq() {
    # START ->
    echo "Starting the quorum network..."
    cd network && docker compose up -d
    # <- END START
}

starttr() {
    echo "Starting the Truffle migration..."
    cd truffle && docker compose up 

    echo "Starting the React application..."
    cd  ../dapp && docker compose up
}

stop() {
    # STOP ->
    cd network && docker compose down && docker compose rm -sfv

    cd ../truffle && docker compose down && docker compose rm -sfv

    cd  ../dapp && docker compose down && docker compose rm -sfv

    cd ../
    # <- END STOP 
}

if [ $# -eq 0 ] 
then
    # nessun argomento, comportamento default
    echo "Errore, esecuzione senza parametri non permessa. Prova con \"./runme.sh --help\""
elif [ "$1" = "--start-all" ]; 
then
    startall
elif [ "$1" = "--start-q" ]; 
then
    startq
elif [ "$1" = "--start-tr" ]; 
then
    starttr
elif [ "$1" = "--stop" ]; 
then
    stop
elif [ "$1" = "--restart" ]; 
then
    stop
    startall
elif [ "$1" = "--help" ]; 
then
    echo -e "${bold}./runme.sh --start-all${normal} \t -> start the complete system (truffle and the dapp will wait cakeshop to start up)"
    echo -e "${bold}./runme.sh --start-q${normal} \t -> start the quorum blockchain"
    echo -e "${bold}./runme.sh --start-tr${normal} \t -> start the truffle migration and the dapp"
    echo -e "${bold}./runme.sh --stop${normal} \t -> stop the complete system (quorum|truffle|dapp)"
    echo -e "${bold}./runme.sh --restart${normal} \t -> restart the complete system (with --start-all method)"
else
    echo "Errore, il comando non esiste. Prova con \"./runme.sh --help\""
fi
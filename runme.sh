#!/bin/bash -u

start() {
    NO_LOCK_REQUIRED=true

    . ./.env
    . ./.common.sh

    echo "docker-compose.yml" > ${LOCK_FILE}

    echo 
    echo "${bold}Software Cybersecurity - Ticketing System${normal}"
    echo "__________________________________________"
    echo 
    sleep 1

    if [ -f "docker-compose-deps.yml" ]; then
        echo "0 - Starting dependencies..."
        docker-compose -f docker-compose-deps.yml up --detach
        sleep 30
    fi

    echo "1 - Starting Quorum, Truffle's migration and React"
    echo
    sleep 1
    docker-compose build --pull
    docker-compose up --detach
    # decommentare per visualizzare i log del service truffle o react (disabilitati dal --detach sopra)
    #docker-compose logs -f truffle
    docker-compose logs -f react

    #docker-compose --profile dapp up

    # \START
}

remove() {
    NO_LOCK_REQUIRED=false

    . ./.env
    . ./.common.sh

    echo 
    echo "${bold}Software Cybersecurity - Ticketing System${normal}"
    echo "__________________________________________"
    echo 
    echo "1 - Stopping and removing the blockchain and the dapp..."
    echo
    sleep 1
    docker-compose down -v
    docker-compose rm -sfv

    if [ -f "docker-compose-deps.yml" ]; then
        echo "1.1 - Stopping dependencies..."
        docker-compose -f docker-compose-deps.yml down -v
        docker-compose rm -sfv
    fi

    rm ${LOCK_FILE}
    echo "Lock file ${LOCK_FILE} removed"
    # \REMOVE
}

if [ $# -eq 0 ] 
then
    # nessun argomento, comportamento default
    echo "error. retry."
elif [ "$1" = "start" ]; 
then
    start
elif [ "$1" = "stop" ]; 
then
    NO_LOCK_REQUIRED=false

    . ./.env
    . ./.common.sh

    echo 
    echo "${bold}Software Cybersecurity - Ticketing System${normal}"
    echo "__________________________________________"
    echo 
    sleep 1

    echo "1 - Stopping the blockchain and the dapp..."
    echo
    sleep 1

    docker-compose stop
    echo "2 - Waiting 30s..."
    sleep 30

    if [ -f "docker-compose-deps.yml" ]; then
        echo "2.2 - Stopping dependencies..."
        docker-compose -f docker-compose-deps.yml stop
    fi

    #\STOP
elif [ "$1" = "resume" ]; 
then
    NO_LOCK_REQUIRED=false

    . ./.env
    . ./.common.sh

    echo 
    echo "${bold}Software Cybersecurity - Ticketing System${normal}"
    echo "__________________________________________"
    echo 
    sleep 1

    echo "1 - Resuming the blockchain and the dapp..."
    echo
    sleep 1

    if [ -f "docker-compose-deps.yml" ]; then
        echo "1.1 - Starting dependencies..."
        docker-compose -f docker-compose-deps.yml start
        sleep 60
    fi

    docker-compose start

    #\RESUME
elif [ "$1" = "remove" ]; 
then
    remove
elif [ "$1" = "restart" ]; 
then
    remove
    start
else
    echo "error. retry."
fi
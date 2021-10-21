#!/bin/bash
if [ -z $1 ] || [ ! -f $1 ]; then
  echo "Please provide a valid script file to execute as the first parameter (i.e. private_contract.js)" >&2
  exit 1
fi
docker cp $1 "$(docker-compose ps -q node1)":/$1
docker-compose exec node1 /bin/sh -c "geth --exec 'loadScript(\"$1\")' attach qdata/dd/geth.ipc"


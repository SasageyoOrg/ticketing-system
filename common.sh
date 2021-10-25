#!/bin/sh

me=`basename "$0"`

if [ "$me" = ".common.sh" ];then
  echo >&2 "Questo script non dovrebbe essere eseguito separatamente."
  exit 1
fi

bold=$(tput bold)
normal=$(tput sgr0)

hash docker 2>/dev/null || {
  echo >&2 "Questo script richiede Docker, ma non è installato."
  exit 1
}

hash docker-compose 2>/dev/null || {
  echo >&2 "Questo script richiede Docker Compose, ma non è installato."
  exit 1
}

docker info &>/dev/null
if [ "$?" -eq "1" ];then
  echo >&2 "Questo script richiede l'esecuzione del demone Docker. Avvia Docker e riprova."
  exit 1
fi

# We use "SI" measures here because the measurement in the UI and actual bytes
# do not align exactly
PRIVACY_MINIMUM=$(( 6 * 1000 * 1000 * 1000 ))
NORMAL_MINIMUM=$(( 4 * 1000 * 1000 * 1000 ))
dockermem=$(docker info --format '{{.MemTotal}}')

case "$me" in
  *privacy* )
    if [ $dockermem -lt $PRIVACY_MINIMUM ]; then
      echo >&2 "Questo script richiede che Docker disponga di almeno 6 GB di memoria disponibile.";
      exit 1
    fi;
    ;;
  * )
    if [ $dockermem -lt $NORMAL_MINIMUM ]; then
      echo >&2 "Questo script richiede che Docker disponga di almeno 4 GB di memoria disponibile."
      exit 1
    fi
    ;;
esac

current_dir=${PWD##*/}

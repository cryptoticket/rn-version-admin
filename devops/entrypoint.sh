#!/bin/sh

APP=rn-version-admin
CMD=$1

shift

case $CMD in

    *)
        echo "Starting rn-version-admin..."
		npm run frontend:build
        npm start
    ;;

esac
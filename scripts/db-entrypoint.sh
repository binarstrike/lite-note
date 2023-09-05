#!/bin/bash

DEFAULT_PORT=27107
REPLICA_SET_NAME=rs0
DB_PORT=$([ ! -z "$DB_PORT" ] && [[ "$DB_PORT" =~ ^[0-9]+$ ]] && echo -n $DB_PORT || echo -n $DEFAULT_PORT)

function main() {
    if [ ! -z $1 ]; then
        local command=$1; shift
        exec $command "$@"
    else
        if [ -z $DB_USER ]; then
            echo "DB_USER variable is empty"
            exit 1
        elif [ -z $DB_PASSWORD ]; then
            echo "DB_PASSWORD variable is empty"
            exit 1
        elif [ -z $DB_HOSTNAME ]; then
            DB_HOSTNAME=localhost
        fi
        initdb &
        docker-entrypoint.sh --replSet $REPLICA_SET_NAME --bind_ip_all --port $DB_PORT
    fi
}

function initdb() {
    sleep 15
    mongosh --port $DB_PORT --eval \
    "rs.initiate({ _id: 'rs0', version: 1, members: [{ _id: 0, host: '$DB_HOSTNAME:$DB_PORT' }] });"
    sleep 2
    mongosh --port $DB_PORT --eval \
    "db.getSiblingDB('admin').createUser({ user: '$DB_USER', pwd: '$DB_PASSWORD', roles: [] });"
}

main "$@"
#!/bin/bash

if [ ! -z $1 ]; then
    command=$1
    shift
    $command "$@"
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

    if [ ! -z $DB_PORT ]; then
        /usr/local/bin/docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all --port $DB_PORT &
        sleep 3
        mongosh --port $DB_PORT --eval \
        "rs.initiate({ _id: 'rs0', version: 1, members: [{ _id: 0, host: '$DB_HOSTNAME:$DB_PORT' }] });"
        sleep 3
        mongosh --port $DB_PORT --eval \
        "db.getSiblingDB('admin').createUser({ user: '$DB_USER', pwd: '$DB_PASSWORD', roles: [] });"
    else
        /usr/local/bin/docker-entrypoint.sh mongod --replSet rs0 --bind_ip_all &
        sleep 3
        mongosh --eval "rs.initiate({ _id: 'rs0', version: 1, members: [{ _id: 0, host: '$DB_HOSTNAME' }] });"
        sleep 3
        mongosh --eval "db.getSiblingDB('admin').createUser({ user: '$DB_USER', pwd: '$DB_PASSWORD', roles: [] });"
    fi
    sleep infinity
fi

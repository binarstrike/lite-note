#!/bin/sh
set -e

function main() {
    if [ ! -z $1 ]; then
        local command=$1; shift
        exec $command "$@"
    else
        npx prisma db push --schema ./schema.prisma
        exec node ./dist/main
    fi
}

main "$@"
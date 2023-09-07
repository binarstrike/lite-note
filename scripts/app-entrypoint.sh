#!/bin/sh
set -e

function main() {
    if [ ! -z $1 ]; then
        local command=$1; shift
        exec $command "$@"
    else
        if [ -d $APP_WORKDIR ]; then
            cd $APP_WORKDIR
        elif [ -d "$PWD/dist" ]; then
            true
        else
            echo >&2 "Can't find file or directory of application"
            exit 1
        fi
        npx prisma db push --schema ./schema.prisma
        exec node ./dist/main
    fi
}

main "$@"
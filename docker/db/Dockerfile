FROM mongo:6-jammy

COPY --chmod=700 ./scripts/db-entrypoint.sh /usr/local/bin/

ENTRYPOINT ["db-entrypoint.sh"]
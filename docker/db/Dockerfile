FROM mongo:6-jammy

COPY db-entrypoint.sh /

RUN chmod 755 /db-entrypoint.sh

ENTRYPOINT ["/db-entrypoint.sh"]
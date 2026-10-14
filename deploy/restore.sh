#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
if [ "$#" -ne 1 ] || [ ! -f "$1/database.dump" ] || [ ! -f "$1/uploads.tar.gz" ]; then
  printf 'Usage: sh deploy/restore.sh /absolute/path/to/backup\n' >&2; exit 1
fi
printf 'Restore replaces database and media. Type RESTORE to continue: '
read -r task_confirm
[ "$task_confirm" = RESTORE ] || exit 1
task_restore_dir="$1"
docker compose stop app
trap 'docker compose start app >/dev/null' EXIT INT TERM
docker compose exec -T db pg_restore -U realty -d realty --clean --if-exists --exit-on-error < "$task_restore_dir/database.dump"
# Restore into the dedicated uploads volume only; preserve any newer files.
docker compose run --rm --no-deps --user root --entrypoint tar app -xzf - -C /app/uploads < "$task_restore_dir/uploads.tar.gz"
docker compose run --rm --no-deps --user root --entrypoint chown app -R node:node /app/uploads
docker compose exec -T db psql -U realty -d realty -c 'DELETE FROM admin_sessions;'
docker compose start app >/dev/null
trap - EXIT INT TERM
printf 'Restore complete. Sign in again and verify the website.\n'

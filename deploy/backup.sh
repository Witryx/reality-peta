#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
task_backup_dir="${BACKUP_DIR:-./backups}"
mkdir -p "$task_backup_dir"
chmod 700 "$task_backup_dir"
task_stamp="$(date -u +%Y%m%dT%H%M%SZ)"
task_target="$task_backup_dir/$task_stamp"
mkdir "$task_target"
chmod 700 "$task_target"
# Briefly stop writes so database and media form one consistent backup.
docker compose stop app
trap 'docker compose start app >/dev/null' EXIT INT TERM
docker compose exec -T db pg_dump -U realty -d realty -Fc > "$task_target/database.dump"
docker compose run --rm --no-deps --user root --entrypoint tar app -czf - -C /app/uploads . > "$task_target/uploads.tar.gz"
cp package-lock.json database/schema.sql "$task_target/"
chmod 600 "$task_target/"*
docker compose start app >/dev/null
trap - EXIT INT TERM
printf 'Backup saved: %s\n' "$task_target"

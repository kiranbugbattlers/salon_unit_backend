@echo off
echo Starting data import...

set PGPASSWORD=Rushi@26
set PGHOST=localhost
set PGPORT=5432
set PGUSER=postgres
set PGDATABASE=salon_backend1

echo Importing users table...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\COPY users FROM 'data/public_users_2026-01-02_123658.json' WITH CSV HEADER"

echo Importing user_roles table...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\COPY user_roles FROM 'data/public_user_roles_2026-01-02_123658.json' WITH CSV HEADER"

echo Importing customers table...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\COPY customers FROM 'data/public_customers_2026-01-02_123658.json' WITH CSV HEADER"

echo Importing business_owners table...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\COPY business_owners FROM 'data/public_business_owner_2026-01-02_123658.json' WITH CSV HEADER"

echo Importing services table...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\COPY services FROM 'data/public_services_2026-01-02_123658.json' WITH CSV HEADER"

echo Importing bookings table...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\COPY bookings FROM 'data/public_bookings_2026-01-02_123658.json' WITH CSV HEADER"

echo Importing payments table...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\COPY payments FROM 'data/public_payments_2026-01-02_123658.json' WITH CSV HEADER"

echo Importing wallets table...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\COPY wallets FROM 'data/public_wallets_2026-01-02_123658.json' WITH CSV HEADER"

echo Importing wallet_transactions table...
psql -h %PGHOST% -p %PGPORT% -U %PGUSER% -d %PGDATABASE% -c "\COPY wallet_transactions FROM 'data/public_wallet_transactions_2026-01-02_123658.json' WITH CSV HEADER"

echo Import completed!
pause

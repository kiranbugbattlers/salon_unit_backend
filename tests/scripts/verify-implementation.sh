#!/bin/bash

echo "=========================================="
echo "Banking + Defaulter System - Verification"
echo "=========================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0

# Function to check file exists
check_file() {
  if [ -f "$1" ]; then
    echo -e "${GREEN}✓${NC} File exists: $1"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} File missing: $1"
    ((FAILED++))
  fi
}

# Function to check string in file
check_content() {
  if grep -q "$2" "$1" 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Found '$2' in $1"
    ((PASSED++))
  else
    echo -e "${RED}✗${NC} Missing '$2' in $1"
    ((FAILED++))
  fi
}

echo "1. Checking New Files..."
echo "------------------------"
check_file "src/wallet/dto/defaulter.dto.ts"
check_file "src/wallet/controllers/admin-defaulter.controller.ts"
check_file "migrations/002_add_banking_and_defaulter.sql"
echo ""

echo "2. Checking Modified Files..."
echo "----------------------------"
check_file "src/wallet/wallet.module.ts"
check_file "src/database/entities/index.ts"
echo ""

echo "3. Checking Entity Exports..."
echo "----------------------------"
check_content "src/database/entities/index.ts" "banking-info.entity"
echo ""

echo "4. Checking Wallet Module Registrations..."
echo "-----------------------------------------"
check_content "src/wallet/wallet.module.ts" "WalletMonitorService"
check_content "src/wallet/wallet.module.ts" "AdminDefaulterController"
check_content "src/wallet/wallet.module.ts" "BankingInfo"
echo ""

echo "5. Checking Previously Implemented Files..."
echo "------------------------------------------"
check_file "src/database/entities/banking-info.entity.ts"
check_file "src/database/entities/business-owner.entity.ts"
check_file "src/business-owner/dto/business-owner-onboarding-step4.dto.ts"
check_file "src/wallet/wallet-monitor.service.ts"
echo ""

echo "6. Checking Business Owner Entity..."
echo "-----------------------------------"
check_content "src/database/entities/business-owner.entity.ts" "isDefaulter"
check_content "src/database/entities/business-owner.entity.ts" "defaulterSince"
echo ""

echo "7. Checking Step 4 DTO..."
echo "-----------------------"
check_content "src/business-owner/dto/business-owner-onboarding-step4.dto.ts" "accountNumber"
check_content "src/business-owner/dto/business-owner-onboarding-step4.dto.ts" "ifscCode"
check_content "src/business-owner/dto/business-owner-onboarding-step4.dto.ts" "bankName"
echo ""

echo "8. Checking Public Endpoint Filters..."
echo "-------------------------------------"
check_content "src/business/business.service.ts" "isDefaulter"
check_content "src/browse/browse.service.ts" "isDefaulter"
echo ""

echo "9. Checking Migration File..."
echo "---------------------------"
check_content "migrations/002_add_banking_and_defaulter.sql" "CREATE TABLE IF NOT EXISTS banking_info"
check_content "migrations/002_add_banking_and_defaulter.sql" "is_defaulter"
check_content "migrations/002_add_banking_and_defaulter.sql" "defaulter_since"
echo ""

echo "10. Checking Documentation..."
echo "---------------------------"
check_file "BANKING_DEFAULTER_SYSTEM.md"
check_file "IMPLEMENTATION_SUMMARY.md"
echo ""

echo "=========================================="
echo "Verification Complete"
echo "=========================================="
echo ""
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed! Implementation is complete.${NC}"
  echo ""
  echo "Next Steps:"
  echo "1. Run database migration:"
  echo "   psql -U postgres -d salon_backend_db -f migrations/002_add_banking_and_defaulter.sql"
  echo ""
  echo "2. Restart the application:"
  echo "   npm run start:dev"
  echo ""
  echo "3. Test the system:"
  echo "   - Complete business owner onboarding step 4"
  echo "   - Create negative wallet balance"
  echo "   - Trigger defaulter check"
  echo "   - Verify public filtering"
  echo ""
  exit 0
else
  echo -e "${RED}✗ Some checks failed. Please review the errors above.${NC}"
  exit 1
fi

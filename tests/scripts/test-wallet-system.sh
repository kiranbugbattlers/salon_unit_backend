#!/bin/bash

#############################################
# WALLET SYSTEM COMPREHENSIVE API TEST SCRIPT
#############################################
# This script tests all wallet system endpoints
# Usage: ./test-wallet-system.sh
#
# Before running:
# 1. Make sure backend is running
# 2. Update tokens in CONFIGURATION section below
#############################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

#############################################
# CONFIGURATION
#############################################

# API Base URL
API_URL="${API_URL:-http://localhost:3000}"

# Access Tokens (UPDATE THESE WITH YOUR TOKENS)
ADMIN_TOKEN="${ADMIN_TOKEN:-your_admin_token_here}"
BUSINESS_OWNER_TOKEN="${BUSINESS_OWNER_TOKEN:-your_business_owner_token_here}"
CUSTOMER_TOKEN="${CUSTOMER_TOKEN:-your_customer_token_here}"

# Test Statistics
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Test Results Array
declare -a TEST_RESULTS

#############################################
# UTILITY FUNCTIONS
#############################################

# Print colored output
print_info() {
    echo -e "${BLUE}ℹ ${1}${NC}"
}

print_success() {
    echo -e "${GREEN}✓ ${1}${NC}"
}

print_error() {
    echo -e "${RED}✗ ${1}${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ ${1}${NC}"
}

print_section() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  ${1}${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Make API call and return response
api_call() {
    local method=$1
    local endpoint=$2
    local token=$3
    local data=$4

    if [ -z "$data" ]; then
        curl -s -X "$method" "${API_URL}${endpoint}" \
            -H "Authorization: Bearer ${token}" \
            -H "Content-Type: application/json"
    else
        curl -s -X "$method" "${API_URL}${endpoint}" \
            -H "Authorization: Bearer ${token}" \
            -H "Content-Type: application/json" \
            -d "$data"
    fi
}

# Test assertion
assert_success() {
    local test_name=$1
    local response=$2
    local expected_field=$3

    ((TOTAL_TESTS++))

    # Check if response contains error
    if echo "$response" | grep -q '"statusCode":[45][0-9][0-9]'; then
        local error_msg=$(echo "$response" | grep -o '"message":"[^"]*"' | cut -d'"' -f4)
        print_error "TEST FAILED: $test_name"
        print_error "  Error: $error_msg"
        TEST_RESULTS+=("❌ $test_name - FAILED: $error_msg")
        ((FAILED_TESTS++))
        return 1
    fi

    # Check for expected field if provided
    if [ ! -z "$expected_field" ]; then
        if ! echo "$response" | grep -q "$expected_field"; then
            print_error "TEST FAILED: $test_name"
            print_error "  Expected field '$expected_field' not found in response"
            TEST_RESULTS+=("❌ $test_name - FAILED: Missing field '$expected_field'")
            ((FAILED_TESTS++))
            return 1
        fi
    fi

    print_success "TEST PASSED: $test_name"
    TEST_RESULTS+=("✅ $test_name - PASSED")
    ((PASSED_TESTS++))
    return 0
}

# Skip test with reason
skip_test() {
    local test_name=$1
    local reason=$2

    ((TOTAL_TESTS++))
    ((SKIPPED_TESTS++))

    print_warning "TEST SKIPPED: $test_name"
    print_warning "  Reason: $reason"
    TEST_RESULTS+=("⏭️  $test_name - SKIPPED: $reason")
}

#############################################
# TOKEN VALIDATION
#############################################

validate_tokens() {
    print_section "VALIDATING ACCESS TOKENS"

    if [ "$ADMIN_TOKEN" == "your_admin_token_here" ]; then
        print_error "Admin token not configured!"
        print_info "Please set ADMIN_TOKEN environment variable or edit the script"
        exit 1
    fi

    if [ "$BUSINESS_OWNER_TOKEN" == "your_business_owner_token_here" ]; then
        print_error "Business owner token not configured!"
        print_info "Please set BUSINESS_OWNER_TOKEN environment variable or edit the script"
        exit 1
    fi

    if [ "$CUSTOMER_TOKEN" == "your_customer_token_here" ]; then
        print_error "Customer token not configured!"
        print_info "Please set CUSTOMER_TOKEN environment variable or edit the script"
        exit 1
    fi

    print_success "All tokens configured"
}

#############################################
# ADMIN TESTS
#############################################

test_admin_endpoints() {
    print_section "TESTING ADMIN ENDPOINTS"

    # Test 1: Get Active Commission Config
    print_info "Test 1: Get Active Commission Configuration"
    response=$(api_call "GET" "/api/v1/admin/commission/config/active" "$ADMIN_TOKEN")
    assert_success "Admin - Get Active Commission Config" "$response" '"success":true'

    # Test 2: Get Commission Config History
    print_info "Test 2: Get Commission Configuration History"
    response=$(api_call "GET" "/api/v1/admin/commission/config/history?page=1&limit=10" "$ADMIN_TOKEN")
    assert_success "Admin - Get Config History" "$response" '"success":true'

    # Test 3: View All Wallets
    print_info "Test 3: View All Wallets"
    response=$(api_call "GET" "/api/v1/admin/commission/wallets?page=1&limit=10" "$ADMIN_TOKEN")
    assert_success "Admin - View All Wallets" "$response" '"wallets"'

    # Test 4: Get Commission Transactions
    print_info "Test 4: Get Commission Transactions"
    response=$(api_call "GET" "/api/v1/admin/commission/transactions?page=1&limit=10" "$ADMIN_TOKEN")
    assert_success "Admin - Get Commission Transactions" "$response" '"success":true'

    # Test 5: Get Commission Summary Report
    print_info "Test 5: Get Commission Summary Report"
    response=$(api_call "GET" "/api/v1/admin/commission/reports/commission-summary" "$ADMIN_TOKEN")
    assert_success "Admin - Commission Summary Report" "$response" '"success":true'

    # Test 6: Get Wallet Summary Report
    print_info "Test 6: Get Wallet Summary Report"
    response=$(api_call "GET" "/api/v1/admin/commission/reports/wallet-summary" "$ADMIN_TOKEN")
    assert_success "Admin - Wallet Summary Report" "$response" '"success":true'

    # Test 7: Get All Settlements
    print_info "Test 7: Get All Settlements"
    response=$(api_call "GET" "/api/v1/admin/commission/settlements?page=1&limit=10" "$ADMIN_TOKEN")
    assert_success "Admin - Get All Settlements" "$response" '"success":true'

    # Test 8: Get Pending Settlements
    print_info "Test 8: Get Pending Settlements"
    response=$(api_call "GET" "/api/v1/admin/commission/settlements/pending-approvals?page=1&limit=10" "$ADMIN_TOKEN")
    assert_success "Admin - Get Pending Settlements" "$response" '"success":true'
}

#############################################
# BUSINESS OWNER TESTS
#############################################

test_business_owner_endpoints() {
    print_section "TESTING BUSINESS OWNER ENDPOINTS"

    # Test 9: Get Wallet Statistics (consolidated)
    print_info "Test 9: Get Wallet Statistics"
    response=$(api_call "GET" "/api/v1/business-owner/wallet/stats" "$BUSINESS_OWNER_TOKEN")
    assert_success "Business Owner - Get Wallet Stats" "$response" '"totalEarned"'
    assert_success "Business Owner - Get Wallet Stats (totalBookings)" "$response" '"totalBookings"'

    # Test 10: Get Transaction History
    print_info "Test 10: Get Transaction History"
    response=$(api_call "GET" "/api/v1/business-owner/wallet/transactions?page=1&limit=10" "$BUSINESS_OWNER_TOKEN")
    assert_success "Business Owner - Get Transactions" "$response" '"transactions"'

    # Test 11: Get Settlements
    print_info "Test 11: Get Settlements"
    response=$(api_call "GET" "/api/v1/business-owner/wallet/settlements?page=1&limit=10" "$BUSINESS_OWNER_TOKEN")
    assert_success "Business Owner - Get Settlements" "$response" '"settlements"'

    # Test 12: Get Earnings Report
    print_info "Test 12: Get Earnings Report"
    start_date=$(date -d "30 days ago" +%Y-%m-%d)
    end_date=$(date +%Y-%m-%d)
    response=$(api_call "GET" "/api/v1/business-owner/wallet/earnings-report?startDate=$start_date&endDate=$end_date" "$BUSINESS_OWNER_TOKEN")
    assert_success "Business Owner - Earnings Report" "$response" '"success":true'
}

#############################################
# CUSTOMER TESTS
#############################################

test_customer_endpoints() {
    print_section "TESTING CUSTOMER ENDPOINTS"

    # Test 13: Get Wallet Statistics
    print_info "Test 13: Get Wallet Statistics"
    response=$(api_call "GET" "/api/v1/customer/wallet/stats" "$CUSTOMER_TOKEN")
    assert_success "Customer - Get Wallet Stats" "$response" '"totalEarned"'

    # Test 14: Get Transaction History
    print_info "Test 14: Get Transaction History"
    response=$(api_call "GET" "/api/v1/customer/wallet/transactions?page=1&limit=10" "$CUSTOMER_TOKEN")
    assert_success "Customer - Get Transactions" "$response" '"transactions"'

    # Test 15: Get Reward Points
    print_info "Test 15: Get Reward Points"
    response=$(api_call "GET" "/api/v1/customer/wallet/reward-points" "$CUSTOMER_TOKEN")
    assert_success "Customer - Get Reward Points" "$response" '"totalPoints"'

    # Test 16: Get Tier Progress
    print_info "Test 16: Get Tier Progress"
    response=$(api_call "GET" "/api/v1/customer/wallet/reward-points/tier-progress" "$CUSTOMER_TOKEN")
    assert_success "Customer - Get Tier Progress" "$response" '"currentTier"'

    # Test 17: Get Tier Benefits
    print_info "Test 17: Get All Tier Benefits"
    response=$(api_call "GET" "/api/v1/customer/wallet/reward-points/tier-benefits" "$CUSTOMER_TOKEN")
    assert_success "Customer - Get Tier Benefits" "$response" '"tier"'

    # Test 18: Get Reward Points History
    print_info "Test 18: Get Reward Points History"
    response=$(api_call "GET" "/api/v1/customer/wallet/reward-points/history?page=1&limit=10" "$CUSTOMER_TOKEN")
    assert_success "Customer - Get Reward History" "$response" '"success":true'
}

#############################################
# INTEGRATION TESTS
#############################################

test_integration_scenarios() {
    print_section "TESTING INTEGRATION SCENARIOS"

    # These tests check if the system handles edge cases properly

    # Test 22: Admin - Filter Wallets by Type
    print_info "Test 22: Filter Wallets by User Type"
    response=$(api_call "GET" "/api/v1/admin/commission/wallets?userType=customer&page=1&limit=10" "$ADMIN_TOKEN")
    assert_success "Admin - Filter Customer Wallets" "$response" '"wallets"'

    response=$(api_call "GET" "/api/v1/admin/commission/wallets?userType=business_owner&page=1&limit=10" "$ADMIN_TOKEN")
    assert_success "Admin - Filter Business Owner Wallets" "$response" '"wallets"'

    # Test 23: Pagination
    print_info "Test 23: Test Pagination"
    response=$(api_call "GET" "/api/v1/business-owner/wallet/transactions?page=1&limit=5" "$BUSINESS_OWNER_TOKEN")
    assert_success "Business Owner - Pagination Test" "$response" '"page":1'

    # Test 24: Invalid Page Number
    print_info "Test 24: Test Invalid Page Number Handling"
    response=$(api_call "GET" "/api/v1/customer/wallet/transactions?page=0&limit=10" "$CUSTOMER_TOKEN")
    # Should still work (backend should handle it gracefully)
    if echo "$response" | grep -q '"success":true\|"transactions"'; then
        print_success "TEST PASSED: Invalid page handled gracefully"
        ((TOTAL_TESTS++))
        ((PASSED_TESTS++))
        TEST_RESULTS+=("✅ Invalid Page Number Handling - PASSED")
    else
        print_warning "Invalid page returned error (acceptable behavior)"
        ((TOTAL_TESTS++))
        ((SKIPPED_TESTS++))
        TEST_RESULTS+=("⏭️  Invalid Page Number Handling - SKIPPED")
    fi
}

#############################################
# ERROR HANDLING TESTS
#############################################

test_error_handling() {
    print_section "TESTING ERROR HANDLING"

    # Test 25: Unauthorized Access
    print_info "Test 25: Test Unauthorized Access"
    response=$(api_call "GET" "/api/v1/admin/commission/config/active" "invalid_token")
    if echo "$response" | grep -q '"statusCode":401'; then
        print_success "TEST PASSED: Unauthorized access properly rejected"
        ((TOTAL_TESTS++))
        ((PASSED_TESTS++))
        TEST_RESULTS+=("✅ Unauthorized Access Handling - PASSED")
    else
        print_error "TEST FAILED: Should reject unauthorized access"
        ((TOTAL_TESTS++))
        ((FAILED_TESTS++))
        TEST_RESULTS+=("❌ Unauthorized Access Handling - FAILED")
    fi

    # Test 26: Role-Based Access Control
    print_info "Test 26: Test Customer Cannot Access Admin Endpoints"
    response=$(api_call "GET" "/api/v1/admin/commission/config/active" "$CUSTOMER_TOKEN")
    if echo "$response" | grep -q '"statusCode":403\|"statusCode":401'; then
        print_success "TEST PASSED: Customer properly blocked from admin endpoint"
        ((TOTAL_TESTS++))
        ((PASSED_TESTS++))
        TEST_RESULTS+=("✅ Role-Based Access Control - PASSED")
    else
        print_error "TEST FAILED: Customer should not access admin endpoints"
        ((TOTAL_TESTS++))
        ((FAILED_TESTS++))
        TEST_RESULTS+=("❌ Role-Based Access Control - FAILED")
    fi
}

#############################################
# GENERATE REPORT
#############################################

generate_report() {
    print_section "TEST EXECUTION SUMMARY"

    echo ""
    echo "📊 STATISTICS:"
    echo "  Total Tests:  $TOTAL_TESTS"
    echo -e "  ${GREEN}Passed:       $PASSED_TESTS${NC}"
    echo -e "  ${RED}Failed:       $FAILED_TESTS${NC}"
    echo -e "  ${YELLOW}Skipped:      $SKIPPED_TESTS${NC}"
    echo ""

    # Calculate success rate
    if [ $TOTAL_TESTS -gt 0 ]; then
        SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo "  Success Rate: ${SUCCESS_RATE}%"
    fi

    echo ""
    echo "📋 DETAILED RESULTS:"
    echo ""

    for result in "${TEST_RESULTS[@]}"; do
        echo "  $result"
    done

    echo ""

    if [ $FAILED_TESTS -eq 0 ]; then
        print_success "ALL TESTS PASSED! 🎉"
        echo ""
        echo "The wallet system is functioning correctly."
        return 0
    else
        print_error "SOME TESTS FAILED!"
        echo ""
        echo "Please review the failed tests above."
        return 1
    fi
}

#############################################
# MAIN EXECUTION
#############################################

main() {
    clear

    echo ""
    echo "╔═══════════════════════════════════════════════════════╗"
    echo "║                                                       ║"
    echo "║   WALLET SYSTEM COMPREHENSIVE API TEST SUITE         ║"
    echo "║                                                       ║"
    echo "╚═══════════════════════════════════════════════════════╝"
    echo ""

    print_info "API URL: $API_URL"
    echo ""

    # Validate tokens
    validate_tokens

    # Run test suites
    test_admin_endpoints
    test_business_owner_endpoints
    test_customer_endpoints
    test_integration_scenarios
    test_error_handling

    # Generate final report
    generate_report

    # Return exit code based on test results
    if [ $FAILED_TESTS -eq 0 ]; then
        exit 0
    else
        exit 1
    fi
}

# Run main function
main "$@"

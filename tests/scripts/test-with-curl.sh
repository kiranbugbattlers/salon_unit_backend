#!/bin/bash

# S3 Integration Test Script using curl
# Make this file executable: chmod +x test-with-curl.sh

echo "🧪 S3 Integration Test Script"
echo "==============================="

# Configuration - UPDATE THESE VALUES
SERVER_URL="http://localhost:3000"
CUSTOMER_JWT="YOUR_CUSTOMER_JWT_TOKEN_HERE"
BUSINESS_OWNER_JWT="YOUR_BUSINESS_OWNER_JWT_TOKEN_HERE"
BARBER_JWT="YOUR_BARBER_JWT_TOKEN_HERE"

# Test image path - create a test image or use any image file
TEST_IMAGE="test-image.jpg"

echo "📋 Prerequisites:"
echo "1. Backend server running on $SERVER_URL"
echo "2. Valid JWT tokens for customer and business-owner"
echo "3. Test image file: $TEST_IMAGE"
echo "4. S3 credentials in .env file"
echo ""

# Function to test if server is running
check_server() {
    echo "🔍 Checking if server is running..."
    if curl -s -f "$SERVER_URL/api/docs" > /dev/null; then
        echo "✅ Server is running at $SERVER_URL"
        echo "📖 Swagger docs available at: $SERVER_URL/api/docs"
        return 0
    else
        echo "❌ Server is not running at $SERVER_URL"
        echo "💡 Start server with: npm run start:dev"
        return 1
    fi
}

# Create a test image if it doesn't exist
create_test_image() {
    if [ ! -f "$TEST_IMAGE" ]; then
        echo "📸 Creating test image..."
        # Create a simple 100x100 red square using ImageMagick (if available)
        if command -v convert > /dev/null; then
            convert -size 100x100 xc:red "$TEST_IMAGE" 2>/dev/null
            echo "✅ Created test image: $TEST_IMAGE"
        else
            echo "⚠️  Please create a test image named '$TEST_IMAGE' or update TEST_IMAGE path"
            echo "   You can use any .jpg, .png, or .webp image file"
        fi
    else
        echo "✅ Test image found: $TEST_IMAGE"
    fi
}

# Test customer profile picture upload
test_customer_profile_upload() {
    echo ""
    echo "📸 Testing Customer Profile Picture Upload..."
    
    if [ "$CUSTOMER_JWT" == "YOUR_CUSTOMER_JWT_TOKEN_HERE" ]; then
        echo "⚠️  Please update CUSTOMER_JWT in this script"
        return 1
    fi
    
    if [ ! -f "$TEST_IMAGE" ]; then
        echo "❌ Test image not found: $TEST_IMAGE"
        return 1
    fi
    
    echo "🔄 Uploading to $SERVER_URL/customer/profile-picture..."
    
    response=$(curl -s -X POST "$SERVER_URL/customer/profile-picture" \
        -H "Authorization: Bearer $CUSTOMER_JWT" \
        -F "file=@$TEST_IMAGE" \
        -w "\n%{http_code}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "201" ]; then
        echo "✅ Success! Profile picture uploaded"
        echo "📄 Response: $body"
    else
        echo "❌ Failed with HTTP $http_code"
        echo "📄 Response: $body"
    fi
}

# Test get customer profile
test_get_customer_profile() {
    echo ""
    echo "👤 Testing Get Customer Profile..."
    
    if [ "$CUSTOMER_JWT" == "YOUR_CUSTOMER_JWT_TOKEN_HERE" ]; then
        echo "⚠️  Please update CUSTOMER_JWT in this script"
        return 1
    fi
    
    echo "🔄 Getting profile from $SERVER_URL/customer/profile..."
    
    response=$(curl -s -X GET "$SERVER_URL/customer/profile" \
        -H "Authorization: Bearer $CUSTOMER_JWT" \
        -w "\n%{http_code}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "200" ]; then
        echo "✅ Success! Profile retrieved"
        echo "🔍 Looking for profile picture URLs..."
        if echo "$body" | grep -q "profilePic"; then
            echo "✅ Profile picture URLs found in response"
        else
            echo "⚠️  No profile picture URLs in response"
        fi
    else
        echo "❌ Failed with HTTP $http_code"
        echo "📄 Response: $body"
    fi
}

# Test business owner profile (updated - now returns single address)
test_business_owner_profile() {
    echo ""
    echo "🏪 Testing Business Owner Profile (Updated Address Structure)..."

    if [ "$BUSINESS_OWNER_JWT" == "YOUR_BUSINESS_OWNER_JWT_TOKEN_HERE" ]; then
        echo "⚠️  Please update BUSINESS_OWNER_JWT in this script"
        return 1
    fi

    echo "🔄 Getting profile from $SERVER_URL/api/v1/business-owner/profile..."

    response=$(curl -s -X GET "$SERVER_URL/api/v1/business-owner/profile" \
        -H "Authorization: Bearer $BUSINESS_OWNER_JWT" \
        -w "\n%{http_code}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        echo "✅ Success! Business owner profile retrieved"
        echo "🔍 Checking address structure..."
        if echo "$body" | grep -q '"address":{' || echo "$body" | grep -q '"address":null'; then
            echo "✅ CORRECT: Single address field found (not array)"
            if echo "$body" | grep -q '"addressType":"home"'; then
                echo "✅ CORRECT: Personal home address returned (from UserAddress table)"
            fi
        elif echo "$body" | grep -q '"addresses":\['; then
            echo "❌ INCORRECT: Still returning addresses array - fix needed"
        else
            echo "ℹ️  No personal address found (business owner may not have set personal address yet)"
        fi
        echo "📝 NOTE: Business address (step2) should be separate from personal address"
        echo "📄 Response: $body"
    else
        echo "❌ Failed with HTTP $http_code"
        echo "📄 Response: $body"
    fi
}

# Test customer profile for comparison
test_customer_profile_comparison() {
    echo ""
    echo "👤 Testing Customer Profile (For Comparison)..."

    if [ "$CUSTOMER_JWT" == "YOUR_CUSTOMER_JWT_TOKEN_HERE" ]; then
        echo "⚠️  Please update CUSTOMER_JWT in this script"
        return 1
    fi

    echo "🔄 Getting profile from $SERVER_URL/api/v1/customer/profile..."

    response=$(curl -s -X GET "$SERVER_URL/api/v1/customer/profile" \
        -H "Authorization: Bearer $CUSTOMER_JWT" \
        -w "\n%{http_code}")

    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)

    if [ "$http_code" = "200" ]; then
        echo "✅ Success! Customer profile retrieved"
        echo "🔍 Checking address structure..."
        if echo "$body" | grep -q '"addresses":\['; then
            echo "❌ INCORRECT: Customer should not have addresses array in profile"
            echo "💡 Customer addresses should be in separate user-address endpoint"
        else
            echo "✅ CORRECT: No addresses array in customer profile"
        fi
        echo "📄 Response: $body"
    else
        echo "❌ Failed with HTTP $http_code"
        echo "📄 Response: $body"
    fi
}

# Test barber business media upload
test_barber_media_upload() {
    echo ""
    echo "🏢 Testing Barber Business Media Upload..."
    
    if [ "$BARBER_JWT" == "YOUR_BARBER_JWT_TOKEN_HERE" ]; then
        echo "⚠️  Please update BARBER_JWT in this script"
        return 1
    fi
    
    if [ ! -f "$TEST_IMAGE" ]; then
        echo "❌ Test image not found: $TEST_IMAGE"
        return 1
    fi
    
    echo "🔄 Uploading to $SERVER_URL/barber/business-media..."
    
    response=$(curl -s -X POST "$SERVER_URL/barber/business-media" \
        -H "Authorization: Bearer $BARBER_JWT" \
        -F "files=@$TEST_IMAGE" \
        -F "files=@$TEST_IMAGE" \
        -w "\n%{http_code}")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" = "201" ]; then
        echo "✅ Success! Business media uploaded"
        echo "📄 Response: $body"
    else
        echo "❌ Failed with HTTP $http_code"
        echo "📄 Response: $body"
    fi
}

# Main execution
main() {
    check_server || exit 1
    create_test_image
    
    echo ""
    echo "🚀 Starting API Tests..."
    echo "========================"
    
    test_customer_profile_upload
    test_get_customer_profile
    test_business_owner_profile
    test_customer_profile_comparison
    test_barber_media_upload

    echo ""
    echo "🎯 Test Summary:"
    echo "================"
    echo "✅ Check server status"
    echo "📸 Test customer profile upload"
    echo "👤 Test customer profile retrieval"
    echo "🏪 Test business owner profile (UPDATED - single address)"
    echo "👥 Test customer profile comparison"
    echo "🏢 Test barber media upload"
    echo ""
    echo "💡 Next Steps:"
    echo "1. Update JWT tokens in this script"
    echo "2. Ensure server is running: npm run start:dev"
    echo "3. Check Swagger docs: $SERVER_URL/api/docs"
    echo "4. Verify S3 credentials in .env file"
}

main "$@"
#!/bin/bash

# Admin Dashboard - Verification Checklist
# Run this to verify all components are in place

echo "🔍 NamChamps Admin Dashboard - Verification Checklist"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check package.json dependencies
echo "📦 Checking Dependencies..."
if grep -q '"ejs"' package.json && grep -q '"express-session"' package.json; then
    echo -e "${GREEN}✓${NC} Dependencies installed (ejs, express-session)"
else
    echo -e "${RED}✗${NC} Missing dependencies"
fi
echo ""

# Check Views
echo "📄 Checking EJS Views..."
views=(
    "views/layout.ejs"
    "views/login.ejs"
    "views/dashboard.ejs"
    "views/users.ejs"
    "views/user-counts.ejs"
    "views/settings.ejs"
)

for view in "${views[@]}"; do
    if [ -f "$view" ]; then
        echo -e "${GREEN}✓${NC} $view"
    else
        echo -e "${RED}✗${NC} $view (MISSING)"
    fi
done
echo ""

# Check CSS
echo "🎨 Checking CSS..."
if [ -f "public/css/admin-style.css" ]; then
    echo -e "${GREEN}✓${NC} public/css/admin-style.css"
else
    echo -e "${RED}✗${NC} public/css/admin-style.css (MISSING)"
fi
echo ""

# Check Controllers
echo "⚙️  Checking Controllers..."
if grep -q "exports.renderDashboard" controllers/adminController.js && \
   grep -q "exports.renderUsersList" controllers/adminController.js && \
   grep -q "exports.renderSettings" controllers/adminController.js; then
    echo -e "${GREEN}✓${NC} adminController.js (all functions present)"
else
    echo -e "${RED}✗${NC} adminController.js (missing functions)"
fi
echo ""

# Check Routes
echo "🛣️  Checking Routes..."
if grep -q "router.get('/login'" routes/adminRoutes.js && \
   grep -q "router.get('/dashboard'" routes/adminRoutes.js && \
   grep -q "router.get('/users'" routes/adminRoutes.js && \
   grep -q "router.get('/settings'" routes/adminRoutes.js; then
    echo -e "${GREEN}✓${NC} adminRoutes.js (all routes configured)"
else
    echo -e "${RED}✗${NC} adminRoutes.js (missing routes)"
fi
echo ""

# Check Server Configuration
echo "🚀 Checking Server Configuration..."
if grep -q "app.set('view engine', 'ejs')" server.js && \
   grep -q "express.static" server.js && \
   grep -q "express-session" server.js; then
    echo -e "${GREEN}✓${NC} server.js (EJS and session configured)"
else
    echo -e "${RED}✗${NC} server.js (configuration missing)"
fi
echo ""

# Check Documentation
echo "📚 Checking Documentation..."
docs=(
    "ADMIN_DASHBOARD_README.md"
    "ADMIN_QUICK_START.md"
    "ADMIN_IMPLEMENTATION_COMPLETE.md"
)

for doc in "${docs[@]}"; do
    if [ -f "$doc" ]; then
        echo -e "${GREEN}✓${NC} $doc"
    else
        echo -e "${RED}✗${NC} $doc (MISSING)"
    fi
done
echo ""

# Check if npm install was run
echo "📋 Checking npm packages..."
if [ -d "node_modules/ejs" ] && [ -d "node_modules/express-session" ]; then
    echo -e "${GREEN}✓${NC} npm packages installed"
else
    echo -e "${YELLOW}⚠${NC}  Run 'npm install' to install dependencies"
fi
echo ""

echo "=================================================="
echo "✅ Verification Complete!"
echo ""
echo "📖 Next Steps:"
echo "1. Start server: npm start (or npm run dev)"
echo "2. Visit: http://localhost:5001/admin/login"
echo "3. Login with super admin credentials"
echo ""
echo "📚 Documentation:"
echo "- Full README: ADMIN_DASHBOARD_README.md"
echo "- Quick Start: ADMIN_QUICK_START.md"
echo "- Implementation: ADMIN_IMPLEMENTATION_COMPLETE.md"
echo ""

// Firebase Configuration - Replace with your own credentials
const firebaseConfig = {
  apiKey: "AIzaSyAQ3_BUlm6aUjRXn7o2P1TJNXttT9EAEE4",
  authDomain: "kasuwapoa-pro.firebaseapp.com",
  databaseURL: "https://kasuwapoa-pro-default-rtdb.firebaseio.com",
  projectId: "kasuwapoa-pro",
  storageBucket: "kasuwapoa-pro.firebasestorage.app",
  messagingSenderId: "788577627255",
  appId: "1:788577627255:web:74385bd55f8d2d356c2a72",
  measurementId: "G-26JDENE88H"
};


// Initialize Firebase
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Subscription Plans
const SUBSCRIPTION_PLANS = {
    free: {
        name: { en: 'Free', ha: 'Kyauta', ar: 'مجاني' },
        price: 0,
        currency: '₦',
        features: {
            maxProducts: 50,
            maxUsers: 1,
            reports: false,
            customers: false,
            api: false,
            support: 'email'
        }
    },
    basic: {
        name: { en: 'Basic', ha: 'Na Gida', ar: 'أساسي' },
        price: 5000,
        currency: '₦',
        features: {
            maxProducts: 500,
            maxUsers: 2,
            reports: true,
            customers: false,
            api: false,
            support: 'email'
        }
    },
    pro: {
        name: { en: 'Pro', ha: 'Na Musamman', ar: 'احترافي' },
        price: 15000,
        currency: '₦',
        features: {
            maxProducts: -1, // unlimited
            maxUsers: 5,
            reports: true,
            customers: true,
            api: false,
            support: 'priority'
        }
    },
    enterprise: {
        name: { en: 'Enterprise', ha: 'Kamfanoni', ar: 'مؤسسي' },
        price: 50000,
        currency: '₦',
        features: {
            maxProducts: -1,
            maxUsers: -1,
            reports: true,
            customers: true,
            api: true,
            support: 'dedicated'
        }
    }
};

// Current user state
let currentUser = null;
let currentShop = null;
let currentLang = localStorage.getItem('pos_language') || 'en';

// Check subscription validity
function isSubscriptionValid(shop) {
    if (!shop || !shop.subscription) return false;
    if (shop.subscription.plan === 'free') return true;
    const expiry = shop.subscription.expiryDate?.toDate?.() || new Date(shop.subscription.expiryDate);
    return expiry > new Date();
}

// Get plan features
function getPlanFeatures(planId) {
    return SUBSCRIPTION_PLANS[planId]?.features || SUBSCRIPTION_PLANS.free.features;
}

// Check permission
function hasPermission(permission) {
    if (!currentShop || !currentUser) return false;
    if (currentShop.ownerId === currentUser.uid) return true;
    const userRole = currentShop.staff?.[currentUser.uid]?.role || 'staff';
    const permissions = {
        owner: ['all'],
        manager: ['pos', 'products', 'sales', 'customers', 'reports'],
        cashier: ['pos', 'sales'],
        staff: ['pos']
    };
    return permissions[userRole]?.includes(permission) || permissions[userRole]?.includes('all');
}

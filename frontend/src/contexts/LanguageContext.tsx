import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'sw';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.market': 'Marketplace',
    'nav.orders': 'Orders',
    'nav.profile': 'Profile',
    'nav.fresh': 'Fresh Today',
    
    // Onboarding
    'onboarding.title1': 'From farm to your table — directly.',
    'onboarding.subtitle1': 'Get the freshest organic produce directly from local farmers safely and affordably.',
    'onboarding.title2': 'No middlemen. Just fair prices.',
    'onboarding.subtitle2': 'Better profits for hard-working farmers and significantly better prices for buyers in the market.',
    'onboarding.title3': 'Support local farmers instantly.',
    'onboarding.subtitle3': 'Quick and reliable delivery straight to your doorstep or local market stall in minutes.',
    'onboarding.login': 'Log In',
    'onboarding.getStarted': 'Get Started',
    'onboarding.explore': 'Explore Marketplace',
    
    // Login
    'login.welcome': 'Welcome Back',
    'login.subtitle': 'Sign in to continue to Mkulima Exchange',
    'login.emailLabel': 'Email Address',
    'login.emailPlaceholder': 'Enter your email...',
    'login.passwordLabel': 'Password',
    'login.passwordPlaceholder': 'Enter your password...',
    'login.forgotPassword': 'Forgot Password?',
    'login.loginButton': 'Log In',
    'login.noAccount': "Don't have an account?",
    'login.signupText': 'Sign Up',
    
    // Register
    'register.title': 'Create Account',
    'register.subtitle': 'Join the Mkulima Exchange community',
    'register.nameLabel': 'Full Name',
    'register.namePlaceholder': 'Enter your name...',
    'register.emailLabel': 'Email Address',
    'register.emailPlaceholder': 'Enter your email...',
    'register.phoneLabel': 'Phone Number',
    'register.phonePlaceholder': 'Enter your phone number...',
    'register.passwordLabel': 'Password',
    'register.passwordPlaceholder': 'Enter your password...',
    'register.registerButton': 'Sign Up',
    'register.hasAccount': 'Already have an account?',
    'register.loginText': 'Log In',
    
    // Home
    'home.bannerLabel': 'Market Today',
    'home.bannerTitle': 'Fresh from\\nKenyan Farms!',
    'home.bannerSubtitle': 'Get up to 20% off on bulk orders today. Buy directly from local farmers, straight to your door.',
    'home.shopNow': 'Shop',
    'home.viewOffers': 'View Offers',
    'home.categories': 'Categories',
    'home.categoriesDesc': 'What are you cooking today?',
    'home.seeAll': 'See All',
    'home.popular': 'Popular Near You',
    'home.popularDesc': 'Near Nairobi, Kenya',
    'home.by': 'By',
    'home.price': 'Price',
    
    // Search
    'search.hero': 'The Market',
    'search.heroDesc': 'Find the freshest produce across Kenya.',
    'search.placeholder': 'Search vegetables, fruits...',
    'search.filter': 'Filter',
    'search.browse': 'Browse By Category',
    'search.browseDesc': 'Choose what you want',
    
    // Categories (Home)
    'cat.all': 'All',
    'cat.veg': 'Vegetables',
    'cat.fruits': 'Fruits',
    'cat.grains': 'Grains',
    'cat.tubers': 'Tubers',
    'cat.dairy': 'Dairy',
    
    // Categories (Search)
    'scat.fruits': 'Fresh Fruits',
    'scat.fruits.sub': 'Fruits',
    'scat.veg': 'Leafy Greens',
    'scat.veg.sub': 'Vegetables',
    'scat.grains': 'Grains & Cereals',
    'scat.grains.sub': 'Grains',
    'scat.tubers': 'Root Tubers',
    'scat.tubers.sub': 'Tubers',
    'scat.dairy': 'Dairy Products',
    'scat.dairy.sub': 'Dairy',
    'scat.poultry': 'Poultry & Eggs',
    'scat.poultry.sub': 'Poultry',
    'scat.items': 'Items',
    
    // Orders
    'orders.pageTitle': 'My Orders',
    'orders.pageSubtitle': 'My Orders',
    'orders.active': 'Active',
    'orders.past': 'Past Orders',
    'orders.noOrders': 'No Orders',
    'orders.noOrdersDesc': 'When you place an order, it will appear here.',
    'orders.onRoute': 'On Route',
    'orders.delivered': 'Delivered',
    'orders.track': 'Track',
    'orders.reorder': 'Reorder',
    'orders.date.today': 'Today',
    'orders.date.yesterday': 'Yesterday',
    
    // Profile
    'profile.edit': 'Edit Profile',
    'profile.orders': 'My Orders',
    'profile.saved': 'Saved Items',
    'profile.addresses': 'Addresses',
    'profile.payments': 'Payments',
    'profile.settings': 'Settings',
    'profile.logout': 'Log Out',
    'profile.completedOrders': 'Completed Orders',
    'profile.completedDesc': 'Total orders completed this year.',
    'profile.wallet': 'Wallet Balance',
    'profile.topUp': 'Top Up',
  },
  sw: {
    // Navigation
    'nav.home': 'Nyumbani',
    'nav.market': 'Soko',
    'nav.orders': 'Oda Zangu',
    'nav.profile': 'Profaili',
    'nav.fresh': 'Safi Leo',
    
    // Onboarding
    'onboarding.title1': 'Mzao halisi. Toka shambani hadi kwako.',
    'onboarding.subtitle1': 'Pata mazao bora na safi moja kwa moja kutoka kwa wakulima wa ndani kwa usalama na bei nafuu.',
    'onboarding.title2': 'Hakuna madalali. Bei za haki.',
    'onboarding.subtitle2': 'Faida bora kwa wakulima na bei nzuri zaidi kwa wanunuzi sokoni.',
    'onboarding.title3': 'Saidia wakulima wa karibu papo hapo.',
    'onboarding.subtitle3': 'Uletaji wa haraka na uhakika mpaka mlangoni pako au kwenye kibanda chako cha soko.',
    'onboarding.login': 'Ingia',
    'onboarding.getStarted': 'Anza Sasa',
    'onboarding.explore': 'Tembelea Sokoni',
    
    // Login
    'login.welcome': 'Karibu Tena!',
    'login.subtitle': 'Ingia ili uendelee na Mkulima Exchange',
    'login.emailLabel': 'Barua Pepe (Email)',
    'login.emailPlaceholder': 'Weka barua pepe yako...',
    'login.passwordLabel': 'Nenosiri (Password)',
    'login.passwordPlaceholder': 'Weka nenosiri lako...',
    'login.forgotPassword': 'Umesahau Nenosiri?',
    'login.loginButton': 'Ingia (Login)',
    'login.noAccount': 'Hauna akaunti?',
    'login.signupText': 'Jiunge Sasa',
    
    // Register
    'register.title': 'Jiunge Nasi',
    'register.subtitle': 'Jiunge na jumuiya ya Mkulima Exchange',
    'register.nameLabel': 'Jina Kamili (Full Name)',
    'register.namePlaceholder': 'Weka jina lako...',
    'register.emailLabel': 'Barua Pepe (Email)',
    'register.emailPlaceholder': 'Weka barua pepe...',
    'register.phoneLabel': 'Nambari ya Simu (Phone)',
    'register.phonePlaceholder': 'Weka nambari ya simu...',
    'register.passwordLabel': 'Nenosiri (Password)',
    'register.passwordPlaceholder': 'Weka nenosiri...',
    'register.registerButton': 'Jisajili (Sign Up)',
    'register.hasAccount': 'Ushajiunga?',
    'register.loginText': 'Ingia sasa (Login)',
    
    // Home
    'home.bannerLabel': 'Soko La Leo',
    'home.bannerTitle': 'Maaza Safi\\nKutoka Mashambani!',
    'home.bannerSubtitle': 'Pata punguzo la hadi 20% kwa maagizo ya jumla leo. Nunua moja kwa moja kutoka kwa wakulima wa ndani.',
    'home.shopNow': 'Nunua Sasa',
    'home.viewOffers': 'Tazama Ofa',
    'home.categories': 'Kategoria',
    'home.categoriesDesc': 'Unapika nini leo?',
    'home.seeAll': 'Tazama Zote',
    'home.popular': 'Vipya Sokoni',
    'home.popularDesc': 'Karibu Nairobi, Kenya',
    'home.by': 'Na',
    'home.price': 'Bei',
    
    // Search
    'search.hero': 'Soko Letu',
    'search.heroDesc': 'Pata mazao mapya kote nchini Kenya.',
    'search.placeholder': 'Tafuta mboga, matunda...',
    'search.filter': 'Kichujio',
    'search.browse': 'Vinjari Kategoria',
    'search.browseDesc': 'Chagua unachotaka',
    
    // Categories (Home)
    'cat.all': 'Zote',
    'cat.veg': 'Mboga',
    'cat.fruits': 'Matunda',
    'cat.grains': 'Nafaka',
    'cat.tubers': 'Viazi/Nduma',
    'cat.dairy': 'Maziwa',
    
    // Categories (Search)
    'scat.fruits': 'Matunda Freshi',
    'scat.fruits.sub': 'Matunda',
    'scat.veg': 'Mboga za Majani',
    'scat.veg.sub': 'Mboga',
    'scat.grains': 'Nafaka na Mikunde',
    'scat.grains.sub': 'Nafaka',
    'scat.tubers': 'Mazao ya Mizizi',
    'scat.tubers.sub': 'Viazi',
    'scat.dairy': 'Maziwa Halisi',
    'scat.dairy.sub': 'Maziwa',
    'scat.poultry': 'Kuku na Mayai',
    'scat.poultry.sub': 'Kuku',
    'scat.items': 'Bidhaa',
    
    // Orders
    'orders.pageTitle': 'Oda Zangu',
    'orders.pageSubtitle': 'Oda Zangu',
    'orders.active': 'Imetumwa',
    'orders.past': 'Zilizopita',
    'orders.noOrders': 'Hakuna Oda',
    'orders.noOrdersDesc': 'Unapoweka oda, itaonekana hapa.',
    'orders.onRoute': 'Inakuja',
    'orders.delivered': 'Imefika',
    'orders.track': 'Fuatilia',
    'orders.reorder': 'Nunua Tena',
    'orders.date.today': 'Leo',
    'orders.date.yesterday': 'Jana',
    
    // Profile
    'profile.edit': 'Badilisha Profaili',
    'profile.orders': 'Oda Zangu',
    'profile.saved': 'Ninazopenda',
    'profile.addresses': 'Anwani',
    'profile.payments': 'Miamala',
    'profile.settings': 'Akaunti',
    'profile.logout': 'Ondoka',
    'profile.completedOrders': 'Oda Zilizokamilika',
    'profile.completedDesc': 'Oda zilizokamilika mwaka huu.',
    'profile.wallet': 'Pochi Yako',
    'profile.topUp': 'Weka Pesa',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'en' || saved === 'sw') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

import React, { useState } from 'react';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import CategoryCards from './CategoryCards';
import FeaturedNurseries from './FeaturedNurseries';
import FeaturedPlants from './FeaturedPlants';
import WhyTreeBazzar from './WhyTreeBazzar';
import AppDownloadSection from './AppDownloadSection';
import PartnerCta from './PartnerCta';
import LandingFooter from './LandingFooter';
import AddNurseryModal from '../common/AddNurseryModal';
import NurseryDetailsModal from '../common/NurseryDetailsModal';

export default function LandingPage({ 
  nurseries = [], 
  plants = [], 
  cities = [],
  ads = [],
  onOpenLogin, 
  onAddNursery,
  onContactLead 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedNursery, setSelectedNursery] = useState(null);

  // Active nurseries: Paid subscribed OR auto-approved active free trial
  const subscribedNurseries = React.useMemo(() => {
    return nurseries.filter(n => {
      if (n.isSuspended || n.status === 'suspended' || n.status === 'rejected' || n.status === 'revoked') return false;
      // When free trial expires, nursery is hidden until subscription is approved / paid
      if (n.isTrialExpired) return false;
      
      // Auto-approved active free trial nurseries are visible during trial
      if (n.isTrialActive || n.autoApproved) return true;

      const isSub = Boolean(
        n.isSubscribed === true ||
        n.subscriptionStatus === 'active' ||
        n.isSubscriptionApproved === true ||
        n.subscriptionPlan === 'paid_annual' ||
        n.paymentStatus === 'paid'
      );
      return isSub && n.status === 'approved';
    });
  }, [nurseries]);

  const handleRegisterNurserySubmit = (newNurseryData) => {
    if (onAddNursery) {
      onAddNursery(newNurseryData);
    }
    setRegisterModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-[#2E7D32]/20 selection:text-[#1E5631]">
      
      {/* 1. Header Navigation */}
      <LandingNavbar 
        onOpenLogin={onOpenLogin}
        onOpenRegisterNursery={() => setRegisterModalOpen(true)}
      />

      {/* 2. Hero Section with Unified Search */}
      <HeroSection
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        totalNurseries={subscribedNurseries.length}
        totalPlants={plants.length}
        cities={cities}
      />

      {/* 3. Category Showcase Grid */}
      <CategoryCards
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        plants={plants}
      />

      {/* 4. Verified Nurseries Showcase */}
      <FeaturedNurseries
        nurseries={nurseries}
        plants={plants}
        searchQuery={searchQuery}
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        onSelectNursery={(n) => setSelectedNursery(n)}
        onContactLead={onContactLead}
        onOpenRegisterNursery={() => setRegisterModalOpen(true)}
        cities={cities}
      />

      {/* 5. Live Plant Catalog & WhatsApp Inquiries */}
      <FeaturedPlants
        plants={plants}
        nurseries={nurseries}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        searchQuery={searchQuery}
        selectedCity={selectedCity}
        onContactLead={onContactLead}
      />

      {/* 6. Why TreeBazzar & How It Works */}
      <WhyTreeBazzar />

      {/* 7. Official Android App Download Section (Google Play) */}
      <AppDownloadSection />

      {/* 8. Partner Registration CTA */}
      <PartnerCta 
        onOpenRegisterNursery={() => setRegisterModalOpen(true)}
      />

      {/* 8. Footer */}
      <LandingFooter 
        onOpenLogin={onOpenLogin}
        cities={cities}
      />

      {/* Nursery Registration Modal (for growers onboarding) */}
      <AddNurseryModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onAddNursery={handleRegisterNurserySubmit}
        cities={cities}
      />

      {/* Nursery Details Modal */}
      {selectedNursery && (
        <NurseryDetailsModal
          nursery={selectedNursery}
          isOpen={!!selectedNursery}
          onClose={() => setSelectedNursery(null)}
        />
      )}

    </div>
  );
}

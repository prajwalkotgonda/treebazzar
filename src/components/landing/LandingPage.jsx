import React, { useState } from 'react';
import LandingNavbar from './LandingNavbar';
import HeroSection from './HeroSection';
import CategoryCards from './CategoryCards';
import FeaturedNurseries from './FeaturedNurseries';
import FeaturedPlants from './FeaturedPlants';
import WhyTreeBazzar from './WhyTreeBazzar';
import PartnerCta from './PartnerCta';
import LandingFooter from './LandingFooter';
import AddNurseryModal from '../common/AddNurseryModal';
import NurseryDetailsModal from '../common/NurseryDetailsModal';

export default function LandingPage({ 
  nurseries = [], 
  plants = [], 
  onOpenLogin, 
  onAddNursery,
  onContactLead 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedNursery, setSelectedNursery] = useState(null);

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
        totalNurseries={nurseries.length}
        totalPlants={plants.length}
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
        selectedCity={selectedCity}
        onCityChange={setSelectedCity}
        onSelectNursery={(n) => setSelectedNursery(n)}
        onContactLead={onContactLead}
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

      {/* 7. Partner Registration CTA */}
      <PartnerCta 
        onOpenRegisterNursery={() => setRegisterModalOpen(true)}
      />

      {/* 8. Footer */}
      <LandingFooter 
        onOpenLogin={onOpenLogin}
      />

      {/* Nursery Registration Modal (for growers onboarding) */}
      <AddNurseryModal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        onAddNursery={handleRegisterNurserySubmit}
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

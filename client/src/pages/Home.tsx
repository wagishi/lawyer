import Hero from '@/components/home/Hero';
import UserTypeSelection from '@/components/home/UserTypeSelection';
import LawyerSearch from '@/components/home/LawyerSearch';
import AIChatbot from '@/components/home/AIChatbot';
import DocumentManagement from '@/components/home/DocumentManagement';
import LegalNews from '@/components/home/LegalNews';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

const Home = () => {
  return (
    <div>
      <Hero />
      <UserTypeSelection />
      <LawyerSearch />
      <AIChatbot />
      <DocumentManagement />
      <LegalNews />
      <Testimonials />
      <CallToAction />
    </div>
  );
};

export default Home;

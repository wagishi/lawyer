import { Link } from 'wouter';
import { Facebook, Twitter, Linkedin, Instagram, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary text-white pt-12 pb-6">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-serif font-bold mb-4">LegalConnect</h3>
            <p className="text-gray-300 mb-4">
              Connecting legal professionals with clients and simplifying legal services through technology.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <Facebook size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <Twitter size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <Linkedin size={18} />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition duration-300">
                <Instagram size={18} />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/find-lawyers">
                  <a className="text-gray-300 hover:text-white transition duration-300">Find a Lawyer</a>
                </Link>
              </li>
              <li>
                <Link href="/resources">
                  <a className="text-gray-300 hover:text-white transition duration-300">Legal Resources</a>
                </Link>
              </li>
              <li>
                <Link href="/ai-consultation">
                  <a className="text-gray-300 hover:text-white transition duration-300">AI Consultation</a>
                </Link>
              </li>
              <li>
                <Link href="/news">
                  <a className="text-gray-300 hover:text-white transition duration-300">Legal News</a>
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-300">About Us</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition duration-300">Contact</a>
              </li>
            </ul>
          </div>
          
          {/* Practice Areas */}
          <div>
            <h3 className="text-lg font-bold mb-4">Practice Areas</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/find-lawyers?specialization=Family Law">
                  <a className="text-gray-300 hover:text-white transition duration-300">Family Law</a>
                </Link>
              </li>
              <li>
                <Link href="/find-lawyers?specialization=Corporate Law">
                  <a className="text-gray-300 hover:text-white transition duration-300">Corporate Law</a>
                </Link>
              </li>
              <li>
                <Link href="/find-lawyers?specialization=Criminal Defense">
                  <a className="text-gray-300 hover:text-white transition duration-300">Criminal Defense</a>
                </Link>
              </li>
              <li>
                <Link href="/find-lawyers?specialization=Estate Planning">
                  <a className="text-gray-300 hover:text-white transition duration-300">Estate Planning</a>
                </Link>
              </li>
              <li>
                <Link href="/find-lawyers?specialization=Intellectual Property">
                  <a className="text-gray-300 hover:text-white transition duration-300">Intellectual Property</a>
                </Link>
              </li>
              <li>
                <Link href="/find-lawyers?specialization=Immigration">
                  <a className="text-gray-300 hover:text-white transition duration-300">Immigration</a>
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-accent flex-shrink-0 mt-1" />
                <span className="text-gray-300">
                  123 Legal Street, Suite 500<br />
                  San Francisco, CA 94103
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-accent flex-shrink-0" />
                <span className="text-gray-300">(555) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-accent flex-shrink-0" />
                <span className="text-gray-300">info@legalconnect.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-600 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} LegalConnect. All rights reserved.
          </p>
          <div className="flex space-x-4 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">Terms of Service</a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">Cookie Policy</a>
            <a href="#" className="text-gray-400 hover:text-white transition duration-300">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

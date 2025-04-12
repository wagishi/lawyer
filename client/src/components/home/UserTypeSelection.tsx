import { Link } from 'wouter';

const UserTypeSelection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
          How can we help you today?
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Client Card */}
          <div className="bg-background rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1521791055366-0d553381c47a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=200&q=80')" }}
            ></div>
            <div className="p-6">
              <h3 className="text-2xl font-serif font-bold mb-3">I Need Legal Help</h3>
              <p className="text-gray-600 mb-6">
                Connect with experienced lawyers, access resources, and get AI-powered consultations for your legal matters.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Find the right lawyer for your case
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Access legal document templates
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Get preliminary AI consultation
                </li>
              </ul>
              <Link href="/register/client">
                <a className="block text-center bg-primary text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300">
                  Register as a Client
                </a>
              </Link>
            </div>
          </div>
          
          {/* Lawyer Card */}
          <div className="bg-background rounded-xl shadow-md hover:shadow-lg transition duration-300 overflow-hidden">
            <div 
              className="h-48 bg-cover bg-center" 
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1593115057322-e94b77572f20?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=200&q=80')" }}
            ></div>
            <div className="p-6">
              <h3 className="text-2xl font-serif font-bold mb-3">I'm a Legal Professional</h3>
              <p className="text-gray-600 mb-6">
                Expand your practice, connect with clients, and manage your cases on a dedicated professional platform.
              </p>
              <ul className="mb-6 space-y-2">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Create a professional profile
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Find new clients in your practice areas
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-accent mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
                  </svg>
                  Manage documents and communications
                </li>
              </ul>
              <Link href="/register/lawyer">
                <a className="block text-center bg-secondary text-white font-semibold px-6 py-3 rounded-md hover:bg-gray-700 transition duration-300">
                  Register as a Lawyer
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserTypeSelection;

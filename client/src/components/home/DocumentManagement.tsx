import { Link } from 'wouter';
import { Lock, Share2, History, FileSignature } from 'lucide-react';

const DocumentManagement = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4">
          Secure Document Management
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Store, share, and manage your legal documents securely in one place.
        </p>
        
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <img 
              src="https://images.unsplash.com/photo-1568992687947-868a62a9f521?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
              alt="Legal documents" 
              className="rounded-lg shadow-lg w-full"
            />
          </div>
          
          <div>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-3 text-white mr-4 flex-shrink-0">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl mb-2">Bank-Level Security</h3>
                  <p className="text-gray-600">
                    Your documents are encrypted and protected with the highest security standards.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-3 text-white mr-4 flex-shrink-0">
                  <Share2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl mb-2">Easy Sharing</h3>
                  <p className="text-gray-600">
                    Share documents with clients or attorneys with controlled permissions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-3 text-white mr-4 flex-shrink-0">
                  <History className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl mb-2">Version Control</h3>
                  <p className="text-gray-600">
                    Track changes and maintain a history of all document versions.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-primary rounded-full p-3 text-white mr-4 flex-shrink-0">
                  <FileSignature className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-xl mb-2">E-Signatures</h3>
                  <p className="text-gray-600">
                    Legally sign documents electronically without printing or scanning.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <Link href="/dashboard">
                <a className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-700 transition duration-300">
                  Manage Your Documents
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DocumentManagement;

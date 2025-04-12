import { Link } from 'wouter';

const CallToAction = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Join thousands of legal professionals and clients on the fastest growing legal services platform.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/register">
            <a className="bg-primary text-white font-semibold px-8 py-3 rounded-md hover:bg-blue-700 transition duration-300">
              Create Your Account
            </a>
          </Link>
          <Link href="/find-lawyers">
            <a className="bg-white text-primary border border-primary font-semibold px-8 py-3 rounded-md hover:bg-gray-100 transition duration-300">
              Learn More
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;

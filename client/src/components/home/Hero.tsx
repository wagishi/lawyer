import { Link } from 'wouter';

const Hero = () => {
  return (
    <section className="relative bg-primary py-16 md:py-24">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 text-white mb-10 md:mb-0">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Connect with qualified legal professionals
          </h1>
          <p className="text-xl mb-8 opacity-90">
            Find the right lawyer for your needs or offer your expertise to clients seeking legal assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/find-lawyers">
              <a className="bg-white text-primary font-semibold px-6 py-3 rounded-md hover:bg-gray-100 transition duration-300 text-center">
                Find a Lawyer
              </a>
            </Link>
            <Link href="/register/lawyer">
              <a className="bg-accent text-white font-semibold px-6 py-3 rounded-md hover:bg-blue-500 transition duration-300 text-center">
                Register as a Lawyer
              </a>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <img 
            src="https://images.unsplash.com/photo-1589578228447-e1a4e481c6c8?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80" 
            alt="Lawyers in a meeting" 
            className="rounded-lg shadow-xl" 
            width="600" 
            height="400"
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;

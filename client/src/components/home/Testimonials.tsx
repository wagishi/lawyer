import { Star, StarHalf } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Rebecca T.',
      role: 'Family Law Client',
      testimonial: 'LegalConnect helped me find the perfect attorney for my divorce case. The process was smooth and I felt supported every step of the way.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64&q=80'
    },
    {
      name: 'Michael R.',
      role: 'Corporate Attorney',
      testimonial: 'As an attorney, this platform has significantly increased my client base. The document management system streamlines my practice and saves me hours each week.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64&q=80'
    },
    {
      name: 'Jennifer L.',
      role: 'Real Estate Client',
      testimonial: 'The AI consultation gave me quick answers to my rental questions and then connected me with a real estate lawyer who helped me resolve my issue. Great service!',
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=64&h=64&q=80'
    }
  ];

  // Render star ratings
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-5 w-5 fill-yellow-300 text-yellow-300" />);
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-5 w-5 fill-yellow-300 text-yellow-300" />);
    }
    
    return stars;
  };

  return (
    <section className="py-16 bg-secondary text-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-12">
          What Our Users Say
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm"
            >
              <div className="flex text-yellow-300 mb-4">
                {renderStars(testimonial.rating)}
              </div>
              <p className="italic mb-6">"{testimonial.testimonial}"</p>
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <h4 className="font-bold">{testimonial.name}</h4>
                  <p className="text-sm text-gray-300">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;

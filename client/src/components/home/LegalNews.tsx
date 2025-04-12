import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const LegalNews = () => {
  const { data: news, isLoading } = useQuery({
    queryKey: ['/api/news'],
    refetchOnWindowFocus: false,
  });

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-center mb-4">
          Latest Legal News
        </h2>
        <p className="text-center text-gray-600 mb-12 max-w-3xl mx-auto">
          Stay updated with important developments in the legal world.
        </p>
        
        <div className="grid md:grid-cols-3 gap-6">
          {isLoading ? (
            // Loading skeletons
            Array(3).fill(0).map((_, index) => (
              <Card key={index} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-4 w-16 mb-2" />
                  <Skeleton className="h-6 w-full mb-3" />
                  <Skeleton className="h-20 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))
          ) : news && news.length > 0 ? (
            news.slice(0, 3).map((item) => (
              <Card key={item.id} className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition duration-300 bg-background">
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardContent className="p-6">
                  <Badge variant="secondary" className="text-xs text-accent bg-blue-100 font-semibold uppercase">
                    {item.category}
                  </Badge>
                  <h3 className="font-serif font-bold text-xl mt-2 mb-3">{item.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">{formatDate(item.publicationDate)}</span>
                    <Link href={`/news/${item.id}`}>
                      <a className="text-accent hover:text-blue-700 font-semibold">Read More</a>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="col-span-3 text-center py-10">No news articles found.</p>
          )}
        </div>
        
        <div className="mt-10 text-center">
          <Link href="/news">
            <a className="inline-block bg-white text-primary border border-primary rounded-md px-6 py-3 hover:bg-primary hover:text-white transition duration-300">
              View All News
            </a>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LegalNews;

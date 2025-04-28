import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Calendar, User, Tag, MessageCircle } from 'lucide-react';

const ItemDetails = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching item details from API
    const fetchItemDetails = async () => {
      try {
        // Replace with actual API call
        // const response = await fetch(`/api/items/${id}`);
        // const data = await response.json();
        
        // Mock data for demonstration
        const mockData = {
          id: id,
          title: 'Blue Backpack',
          description: 'Navy blue Jansport backpack with red zipper. Contains math textbooks and a calculator.',
          category: 'Backpack',
          status: 'lost',
          location: 'University Library, 2nd Floor',
          date: '2025-04-22',
          image: '/api/placeholder/400/300',
          owner: {
            id: '123',
            name: 'Alex Johnson',
            avatar: '/api/placeholder/40/40'
          }
        };
        
        setItem(mockData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching item details:', error);
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading item details...</div>;
  }

  if (!item) {
    return <div className="text-center">Item not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold">{item.title}</CardTitle>
              <CardDescription className="flex items-center mt-2">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(item.date).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge variant={item.status === 'lost' ? 'destructive' : 'success'} className="text-sm uppercase">
              {item.status}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div>
            <img 
              src={item.image} 
              alt={item.title} 
              className="w-full h-64 object-cover rounded-md"
            />
            
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-2">Details</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center">
                  <Tag className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{item.category}</span>
                </div>
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2 text-gray-500" />
                  <div className="flex items-center">
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={item.owner.avatar} alt={item.owner.name} />
                      <AvatarFallback>{item.owner.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span>{item.owner.name}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{item.description}</p>
            
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-4">
                <Button className="w-full flex items-center justify-center">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline">Back to Listings</Button>
          {item.status === 'lost' && (
            <Button variant="success">Mark as Found</Button>
          )}
          {item.status === 'found' && (
            <Button variant="success">Claim Item</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ItemDetails;
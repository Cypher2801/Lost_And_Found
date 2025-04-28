import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Pencil, Settings, LogOut } from 'lucide-react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [userItems, setUserItems] = useState({ lost: [], found: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching user data from API
    const fetchUserData = async () => {
      try {
        // Mock data for demonstration
        const mockUser = {
          id: '123',
          name: 'Alex Johnson',
          email: 'alex.johnson@example.com',
          phone: '(555) 123-4567',
          joinDate: '2024-11-15',
          avatar: '/api/placeholder/80/80'
        };

        const mockItems = {
          lost: [
            {
              id: '1',
              title: 'Blue Backpack',
              category: 'Backpack',
              status: 'lost',
              date: '2025-04-22',
              location: 'University Library',
              image: '/api/placeholder/100/100'
            },
            {
              id: '2',
              title: 'iPhone 16',
              category: 'Electronics',
              status: 'lost',
              date: '2025-04-18',
              location: 'Campus Cafe',
              image: '/api/placeholder/100/100'
            }
          ],
          found: [
            {
              id: '3',
              title: 'Car Keys',
              category: 'Keys',
              status: 'found',
              date: '2025-04-25',
              location: 'Parking Lot B',
              image: '/api/placeholder/100/100'
            }
          ]
        };
        
        setUser(mockUser);
        setUserItems(mockItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading profile data...</div>;
  }

  if (!user) {
    return <div className="text-center">User not found</div>;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center">
                <Avatar className="h-16 w-16 mr-4">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl font-bold">{user.name}</CardTitle>
                  <CardDescription>{user.email}</CardDescription>
                </div>
              </div>
              <div className="mt-4 md:mt-0 flex space-x-2">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit Profile
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Contact Information</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Email:</span>
                    <span className="ml-2">{user.email}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>
                    <span className="ml-2">{user.phone}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Account Details</h3>
                <div className="space-y-2">
                  <div>
                    <span className="text-gray-500">Member Since:</span>
                    <span className="ml-2">{new Date(user.joinDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Items Posted:</span>
                    <span className="ml-2">{userItems.lost.length + userItems.found.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="ghost" className="text-red-500 hover:text-red-700 flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </CardFooter>
        </Card>

        <Tabs defaultValue="lost" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="lost">
              Lost Items <Badge variant="secondary" className="ml-2">{userItems.lost.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="found">
              Found Items <Badge variant="secondary" className="ml-2">{userItems.found.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="lost">
            {userItems.lost.length === 0 ? (
              <div className="text-center py-8 text-gray-500">You haven't posted any lost items yet.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {userItems.lost.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="h-24 w-24 object-cover"
                      />
                      <div className="p-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant="destructive">Lost</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.location}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                          <Button variant="link" size="sm" className="h-auto p-0">View Details</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="found">
            {userItems.found.length === 0 ? (
              <div className="text-center py-8 text-gray-500">You haven't posted any found items yet.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4 mt-4">
                {userItems.found.map(item => (
                  <Card key={item.id} className="overflow-hidden">
                    <div className="flex">
                      <img 
                        src={item.image} 
                        alt={item.title} 
                        className="h-24 w-24 object-cover"
                      />
                      <div className="p-4 flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.title}</h3>
                          <Badge variant="success">Found</Badge>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{item.location}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-500">{new Date(item.date).toLocaleDateString()}</span>
                          <Button variant="link" size="sm" className="h-auto p-0">View Details</Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
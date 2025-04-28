import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, PackageOpen, Users, TrendingUp, Search } from 'lucide-react';

const Dashboard = () => {
  // Mock data for recent listings
  const recentLostItems = [
    { id: 1, title: 'iPhone 15 Pro', description: 'Lost at Central Park on Sunday afternoon', location: 'Central Park', date: '2025-04-24', category: 'Electronics' },
    { id: 2, title: 'Gold Bracelet', description: 'Lost during commute on subway line 6', location: 'Subway Line 6', date: '2025-04-22', category: 'Jewelry' },
  ];

  const recentFoundItems = [
    { id: 3, title: 'Car Keys', description: 'Found in the library, second floor', location: 'Public Library', date: '2025-04-25', category: 'Personal Items' },
    { id: 4, title: 'Black Backpack', description: 'Found at coffee shop, has laptop inside', location: 'Starbucks on Main St', date: '2025-04-23', category: 'Bags' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to FindIt. Your central hub for lost and found items.</p>
        </div>
        <Link to="/create-listing">
          <Button>Create New Listing</Button>
        </Link>
      </div>
      
      {/* Stats Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Lost Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85</div>
            <p className="text-xs text-muted-foreground">+4 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Found Items</CardTitle>
            <PackageOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">120</div>
            <p className="text-xs text-muted-foreground">+8 from last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,500</div>
            <p className="text-xs text-muted-foreground">+36 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-muted-foreground">+2% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Search Box */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for lost or found items..."
              className="w-full rounded-md border border-input pl-8 pr-4 py-2 bg-background"
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Recent Listings Tabs */}
      <Tabs defaultValue="lost" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="lost">Recent Lost Items</TabsTrigger>
          <TabsTrigger value="found">Recent Found Items</TabsTrigger>
        </TabsList>
        
        <TabsContent value="lost" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {recentLostItems.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>Lost on {item.date} • {item.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{item.description}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                      {item.category}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/item/${item.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/lost-items">
              <Button variant="link">View All Lost Items</Button>
            </Link>
          </div>
        </TabsContent>
        
        <TabsContent value="found" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {recentFoundItems.map(item => (
              <Card key={item.id}>
                <CardHeader>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>Found on {item.date} • {item.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>{item.description}</p>
                  <div className="mt-2">
                    <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                      {item.category}
                    </span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link to={`/item/${item.id}`}>
                    <Button variant="outline">View Details</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/found-items">
              <Button variant="link">View All Found Items</Button>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
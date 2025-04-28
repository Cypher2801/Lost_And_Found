import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Package, Filter, AlertCircle } from 'lucide-react';

const LostItems = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Mock data for lost items
  const lostItems = [
    { id: 1, title: 'iPhone 15 Pro', description: 'Lost at Central Park on Sunday afternoon', location: 'Central Park', date: '2025-04-24', category: 'Electronics', reward: '$100' },
    { id: 2, title: 'Gold Bracelet', description: 'Lost during commute on subway line 6', location: 'Subway Line 6', date: '2025-04-22', category: 'Jewelry', reward: '$50' },
    { id: 3, title: 'Black Wallet', description: 'Lost at the grocery store on Main Street', location: 'Green Grocery', date: '2025-04-20', category: 'Accessories', reward: '$30' },
    { id: 4, title: 'Prescription Glasses', description: 'Lost at the cinema during evening show', location: 'AMC Theater', date: '2025-04-19', category: 'Eyewear', reward: '$20' },
    { id: 5, title: 'Blue Backpack', description: 'Lost on the bus route 42', location: 'City Bus', date: '2025-04-18', category: 'Bags', reward: '$40' },
    { id: 6, title: 'Car Keys with Red Keychain', description: 'Lost in the shopping mall parking', location: 'Downtown Mall', date: '2025-04-17', category: 'Keys', reward: '$25' },
  ];
  
  // Filter items based on search query and category
  const filteredItems = lostItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(lostItems.map(item => item.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lost Items</h1>
          <p className="text-muted-foreground">Browse items reported as lost</p>
        </div>
        <Link to="/create-listing">
          <Button>
            <AlertCircle className="mr-2 h-4 w-4" />
            Report Lost Item
          </Button>
        </Link>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search lost items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Items Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{item.title}</CardTitle>
                    <CardDescription>{item.date} • {item.location}</CardDescription>
                  </div>
                  <div className="bg-red-100 dark:bg-red-900 p-1 rounded">
                    <Package className="h-4 w-4 text-red-600 dark:text-red-300" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.description}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:text-blue-300">
                    {item.category}
                  </span>
                  {item.reward && (
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      Reward: {item.reward}
                    </span>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Link to={`/item/${item.id}`} className="w-full">
                  <Button variant="outline" className="w-full">View Details</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Package className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No items found</h3>
          <p className="mt-2 text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default LostItems;

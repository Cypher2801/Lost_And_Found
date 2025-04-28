import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, PackageOpen, Filter, HandMetal } from 'lucide-react';

const FoundItems = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Mock data for found items
  const foundItems = [
    { id: 1, title: 'Car Keys', description: 'Found in the library, second floor', location: 'Public Library', date: '2025-04-25', category: 'Keys' },
    { id: 2, title: 'Black Backpack', description: 'Found at coffee shop, has laptop inside', location: 'Starbucks on Main St', date: '2025-04-23', category: 'Bags' },
    { id: 3, title: 'Silver Necklace', description: 'Found at the park near the fountain', location: 'Central Park', date: '2025-04-22', category: 'Jewelry' },
    { id: 4, title: 'Student ID Card', description: 'Found near university campus', location: 'State University', date: '2025-04-21', category: 'Documents' },
    { id: 5, title: 'Samsung Phone', description: 'Found on the subway, line 3', location: 'Subway Line 3', date: '2025-04-20', category: 'Electronics' },
    { id: 6, title: 'Umbrella', description: 'Found at the restaurant', location: 'Italian Bistro', date: '2025-04-18', category: 'Accessories' },
  ];
  
  // Filter items based on search query and category
  const filteredItems = foundItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories for filter
  const categories = [...new Set(foundItems.map(item => item.category))];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Found Items</h1>
          <p className="text-muted-foreground">Browse items that have been found</p>
        </div>
        <Link to="/create-listing">
          <Button>
            <HandMetal className="mr-2 h-4 w-4" />
            Report Found Item
          </Button>
        </Link>
      </div>
      
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search found items..."
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
                  <div className="bg-green-100 dark:bg-green-900 p-1 rounded">
                    <PackageOpen className="h-4 w-4 text-green-600 dark:text-green-300" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{item.description}</p>
                <div className="mt-3">
                  <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:text-green-300">
                    {item.category}
                  </span>
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
          <PackageOpen className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No items found</h3>
          <p className="mt-2 text-muted-foreground">Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default FoundItems;
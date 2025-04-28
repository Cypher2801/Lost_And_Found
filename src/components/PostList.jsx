import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Image, Film, Images, HeartIcon, MessageCircle, Share2, Smile, Frown, Meh, Hash } from 'lucide-react';

const getSentimentIcon = (engagement) => {
  if (engagement >= 0.7) return <Smile className="text-green-500" />;
  if (engagement >= 0.4) return <Meh className="text-yellow-500" />;
  return <Frown className="text-red-500" />;
};

const getPostTypeIcon = (type) => {
  switch (type.toLowerCase()) {
    case 'reel': return <Film className="w-4 h-4" />;
    case 'carousel': return <Images className="w-4 h-4" />;
    default: return <Image className="w-4 h-4" />;
  }
};

const PostList = ({ posts }) => {
  const POSTS_PER_PAGE = 10; // Number of posts per page
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Get posts for the current page
  const currentPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <Card className="sm:max-w-8xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent Posts</CardTitle>
            <CardDescription>Latest posts and their performance</CardDescription>
          </div>
          <div className="text-sm text-muted-foreground">
            Showing {currentPosts.length} of {posts.length} posts
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {currentPosts.map((post, index) => (
            <div 
              key={index} 
              className="group flex flex-col gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-all duration-200 hover:shadow-md"
            >
              {/* Top row with type and engagement metrics */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {getPostTypeIcon(post.type)}
                    <Badge 
                      variant="secondary" 
                      className="capitalize bg-rose-500 text-white font-medium"
                    >
                      {post.type}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1 text-[15px]">
                    <HeartIcon className="w-4 h-4 text-rose-500" />
                    <span className="font-medium">{post.likes.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[15px]">
                    <MessageCircle className="w-4 h-4 text-blue-500" />
                    <span className="font-medium">{post.comments.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[15px]">
                    <Share2 className="w-4 h-4 text-green-500" />
                    <span className="font-medium">{post.shares.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getSentimentIcon(post.engagement)}
                    <span className="text-sm text-muted-foreground">
                      {(post.engagement * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom row with hashtags */}
              {post.hashtags && (
                <div className="flex flex-wrap items-center gap-2">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  {post.hashtags.split(',').map((tag, tagIndex) => (
                    <Badge 
                      key={tagIndex}
                      variant="outline" 
                      className="bg-background hover:bg-accent transition-colors text-xs font-normal"
                    >
                      {tag.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        <div className="flex justify-center mt-6 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i + 1)}
              className={`px-4 py-2 rounded-lg ${
                currentPage === i + 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PostList;

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartIcon, MessageCircle, Images, Smile } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="w-4 h-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
    </CardContent>
  </Card>
);

const MetricsOverview = ({ totalPosts, avgLikes, avgComments, avgEngagement }) => (
  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
    <MetricCard title="Total Posts" value={totalPosts} icon={Images} />
    <MetricCard title="Average Likes" value={avgLikes.toLocaleString()} icon={HeartIcon} />
    <MetricCard title="Average Comments" value={avgComments.toLocaleString()} icon={MessageCircle}/>
    <MetricCard title="Average Engagement" value={avgEngagement} icon={Smile} />
  </div>
);

export { MetricCard, MetricsOverview };
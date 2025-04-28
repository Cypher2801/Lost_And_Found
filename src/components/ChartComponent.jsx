import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, LineChart, Line, XAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent, ChartTooltip, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Badge } from 'lucide-react';

const chartConfig = {
  colors: {
    likes: "#ec4899",
    comments: "#3b82f6",
    sentiment: "#22c55e"
  }
};
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    console.log("data",data);
    return (
      <div className="p-2 bg-rose-500 rounded shadow-md text-sm">
        <p className="font-bold">{data.type}</p>
        <p>Count: {data.count}</p>
        <p>Likes: {data.likes}</p>
        <p>Comments: {data.comments}</p>
        <p>Engagement: {(data.engagement * 100).toFixed(1)}%</p>
        {/* {data.hashtags.split(',').map((tag, tagIndex) => (
          <Badge
              key={tagIndex}
              variant="outline" 
              className="bg-background hover:bg-accent transition-colors text-xs font-normal"
            >
              {tag.trim()}
            </Badge>
        ))} */}
      </div>
    );
  }
  return null;
};

const PostTypeDistribution = ({ postTypeData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Post Type Distribution</CardTitle>
      <CardDescription>Analysis by post type</CardDescription>
    </CardHeader>
    <CardContent className="pt-4">
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <BarChart data={postTypeData} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip content={<CustomTooltip />} />
          <Bar dataKey="count" fill={chartConfig.colors.likes} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

const EngagementChart = ({ postTypeData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Engagement Metrics</CardTitle>
      <CardDescription>Average likes and comments per post type</CardDescription>
    </CardHeader>
    <CardContent className="pt-4">
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <BarChart data={postTypeData} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="likes" fill={chartConfig.colors.likes} radius={[4, 4, 0, 0]} />
          <Bar dataKey="comments" fill={chartConfig.colors.comments} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

const SentimentChart = ({ postTypeData }) => (
  <Card>
    <CardHeader>
      <CardTitle>Engagement Analysis</CardTitle>
      <CardDescription>Average Engagement score by post type</CardDescription>
    </CardHeader>
    <CardContent className="pt-4">
      <ChartContainer config={chartConfig} className="h-[400px] w-full">
        <LineChart data={postTypeData} accessibilityLayer>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="type" tickLine={false} tickMargin={10} axisLine={false} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line type="monotone" dataKey="engagement" stroke={chartConfig.colors.sentiment} strokeWidth={2} />
        </LineChart>
      </ChartContainer>
    </CardContent>
  </Card>
);

export { PostTypeDistribution, EngagementChart, SentimentChart, chartConfig };
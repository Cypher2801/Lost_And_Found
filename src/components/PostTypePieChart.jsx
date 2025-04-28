import React, { useState, useLayoutEffect, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const ANIMATION_DURATION = 800;

const PostTypePieChart = ({ postTypeData }) => {
  const [selectedType, setSelectedType] = useState(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (postTypeData?.length && !selectedType) {
      setSelectedType(postTypeData[0].type);
    }
  }, [postTypeData]);

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setKey(prev => prev + 1);
  };

  const [chartSize, setChartSize] = useState(400);

  useLayoutEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setChartSize(width < 640 ? 300 : width < 768 ? 400 : 600);
    };
    
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  const metrics = [
    { name: 'Likes', key: 'likes' },
    { name: 'Comments', key: 'comments' },
    { name: 'Shares', key: 'shares' }
  ];

  const formatValue = (value) => {
    return value ? value.toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0';
  };

  const selectedTypeData = postTypeData.find(data => data.type === selectedType);

  const chartData = selectedTypeData ? metrics.map(metric => ({
    name: metric.name,
    value: selectedTypeData[metric.key] || 0,
  })) : [];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const value = formatValue(payload[0].value);
      return (
        <div className="bg-white p-2 border rounded-lg shadow-sm">
          <p className="text-sm font-medium text-gray-900">
            {`${payload[0].name}: ${value}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!postTypeData.length) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center text-lg font-semibold">
          {selectedType ? `${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Statistics` : 'Select Post Type'}
        </CardTitle>
        <div className="flex flex-wrap gap-2 justify-center mt-4">
          {postTypeData.map((type) => (
            <Button
              key={type.type}
              variant={selectedType === type.type ? "default" : "outline"}
              size="sm"
              onClick={() => handleTypeChange(type.type)}
              className="min-w-24"
            >
              {type.type.charAt(0).toUpperCase() + type.type.slice(1)}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                key={key}
                data={chartData}
                cx="50%"
                cy="50%"
                outerRadius={chartSize < 400 ? 80 : 100}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
                label={({ name, value }) => 
                  `${name} (${formatValue(value)})`
                }
                animationBegin={0}
                animationDuration={ANIMATION_DURATION}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostTypePieChart;
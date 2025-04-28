import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
//import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { AlertCircle, Upload, CalendarIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

const CreateListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    status: 'lost',
    date: null,
    location: '',
    contactMethod: 'email',
    contactInfo: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const categories = [
    'Electronics', 'Jewelry', 'Clothing', 'Accessories', 
    'Books', 'Keys', 'ID/Documents', 'Other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleDateChange = (date) => {
    setFormData(prev => ({ ...prev, date }));
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: null }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Handle image preview
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.contactInfo.trim()) newErrors.contactInfo = 'Contact information is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Simulate API call to create listing
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to home page or item details page
      navigate('/');
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrors(prev => ({ ...prev, form: 'Failed to create listing. Please try again.' }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Listing</CardTitle>
          <CardDescription>
            Provide details about the item you lost or found
          </CardDescription>
        </CardHeader>
        
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {errors.form && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.form}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="status">Type of Listing</Label>
              <RadioGroup
                id="status"
                value={formData.status}
                onValueChange={(value) => handleSelectChange('status', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lost" id="lost" />
                  <Label htmlFor="lost">Lost Item</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="found" id="found" />
                  <Label htmlFor="found">Found Item</Label>
                </div>
              </RadioGroup>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Brief description of the item"
                value={formData.title}
                onChange={handleInputChange}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Detailed description including color, brand, identifying features, etc."
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className={errors.description ? "border-red-500" : ""}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
              </div>
              
              {/* <div className="space-y-2">
                <Label htmlFor="date">
                  {formData.status === 'lost' ? 'When did you lose it?' : 'When did you find it?'}
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground",
                        errors.date && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={handleDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
              </div> */}
              // Alternative date input without requiring the Calendar component
                <div className="space-y-2">
                <Label htmlFor="date">
                    {formData.status === 'lost' ? 'When did you lose it?' : 'When did you find it?'}
                </Label>
                <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date ? formData.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => {
                    const newDate = e.target.value ? new Date(e.target.value) : null;
                    handleDateChange(newDate);
                    }}
                    className={errors.date ? "border-red-500" : ""}
                />
                {errors.date && <p className="text-sm text-red-500">{errors.date}</p>}
                </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                placeholder="Where you lost/found the item"
                value={formData.location}
                onChange={handleInputChange}
                className={errors.location ? "border-red-500" : ""}
              />
              {errors.location && <p className="text-sm text-red-500">{errors.location}</p>}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Contact Information</Label>
              <RadioGroup
                value={formData.contactMethod}
                onValueChange={(value) => handleSelectChange('contactMethod', value)}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="phone" id="phone" />
                  <Label htmlFor="phone">Phone</Label>
                </div>
              </RadioGroup>
              
              <Input
                id="contactInfo"
                name="contactInfo"
                placeholder={formData.contactMethod === 'email' ? 'Your email address' : 'Your phone number'}
                value={formData.contactInfo}
                onChange={handleInputChange}
                className={errors.contactInfo ? "border-red-500" : ""}
              />
              {errors.contactInfo && <p className="text-sm text-red-500">{errors.contactInfo}</p>}
            </div>
            
            <div className="space-y-4">
              <Label>Upload Image</Label>
              <div className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center ${formData.image ? 'border-gray-300' : 'border-gray-200'}`}>
                {formData.image ? (
                  <div className="text-center">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="mx-auto h-48 object-contain mb-4" 
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, image: null }))}
                    >
                      Remove Image
                    </Button>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-4 flex text-sm leading-6 text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-semibold text-primary hover:text-primary/80"
                      >
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between border-t pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Create Listing'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CreateListing;
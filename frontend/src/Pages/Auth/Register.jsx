import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
const Register = () => {
  const { toast } = useToast(); // Proper use of useToast hook
  const [loading, setLoading] = useState(false);
  const navigate=useNavigate();
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roll_number: "",
      phone: "",
      hostel: "",
      room_number: ""
    }
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await api.post("/user/register", values);
      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account",
      });
      navigate("/verify-email",{state:{email:values.email}});
      form.reset();
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Card className="w-full border-0 shadow-lg dark:border dark:border-gray-700 dark:shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>Enter your details to get started</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            {[
              { name: "name", label: "Full Name", type: "text" },
              { name: "email", label: "Email", type: "email" },
              { name: "password", label: "Password", type: "password" },
              { name: "roll_number", label: "Roll Number", type: "text" },
              { name: "phone", label: "Phone Number", type: "tel" },
              { name: "hostel", label: "Hostel", type: "text" },
              { name: "room_number", label: "Room Number", type: "text" }
            ].map((field) => (
              <FormField
                key={field.name}
                control={form.control}
                name={field.name}
                render={({ field: formField }) => (
                  <FormItem>
                    <Label>{field.label}</Label>
                    <FormControl>
                      <Input
                        type={field.type}
                        placeholder={field.label}
                        {...formField}
                        className="dark:border-gray-600"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 dark:text-blue-400 hover:underline">
                Login here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default Register;
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";
import api from "@/services/api";
const Login = () => {
  const { toast } = useToast(); // Proper use of useToast hook
  const [loading, setLoading] = useState(false);
  const form = useForm({
    defaultValues: {
      email: "",
      password: ""
    }
  });

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      const { data } = await api.post("/user/login", values);
    //   localStorage.setItem("token", data.token);
      toast({
        title: "Login successful",
        description: "Redirecting to dashboard...",
      });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1000);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.response?.data?.message || "An error occurred",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Card className="w-full border-0 shadow-lg dark:border dark:border-gray-700 dark:shadow-none">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Enter your credentials to access your account</CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <Label>Email</Label>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      {...field}
                      className="dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <Label>Password</Label>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      {...field}
                      className="dark:border-gray-600"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 dark:text-blue-400 hover:underline">
                Register here
              </Link>
            </div>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default Login;
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

// Step 1: Basic Information Schema
const basicInfoSchema = z.object({
  firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
  lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  confirmPassword: z.string().min(8, { message: 'Please confirm your password' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Step 2: Client Profile Schema
const clientProfileSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  preferredContactMethod: z.string(),
  legalInterests: z.array(z.string()).min(1, { message: 'Please select at least one legal interest' }),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

// Combined schema for all steps
const fullSchema = z.object({
  ...basicInfoSchema.shape,
  ...clientProfileSchema.shape,
});

const ClientRegister = () => {
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const [, navigate] = useLocation();
  
  const form = useForm<z.infer<typeof fullSchema>>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      address: '',
      preferredContactMethod: 'email',
      legalInterests: [],
      agreeToTerms: false,
    },
    mode: 'onChange',
  });
  
  const registerMutation = useMutation({
    mutationFn: async (data: z.infer<typeof fullSchema>) => {
      // Create user account first
      const userResponse = await apiRequest('POST', '/api/auth/register', {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        userType: 'client',
      });
      
      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.message || 'Failed to create account');
      }
      
      const user = await userResponse.json();
      
      // Then create client profile
      const profileResponse = await apiRequest('POST', '/api/clients/profile', {
        phone: data.phone,
        address: data.address,
        preferredContactMethod: data.preferredContactMethod,
      });
      
      if (!profileResponse.ok) {
        const error = await profileResponse.json();
        throw new Error(error.message || 'Failed to create client profile');
      }
      
      return { user, profile: await profileResponse.json() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Registration Successful",
        description: "Your client account has been created",
      });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const nextStep = async () => {
    let validateFields: string[] = [];
    
    // Determine which fields to validate based on current step
    if (step === 1) {
      validateFields = ['firstName', 'lastName', 'email', 'password', 'confirmPassword'];
    }
    
    // Validate only the fields for the current step
    const result = await form.trigger(validateFields as any);
    
    if (result) {
      setStep(prevStep => prevStep + 1);
    }
  };
  
  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
  };
  
  const onSubmit = (data: z.infer<typeof fullSchema>) => {
    registerMutation.mutate(data);
  };
  
  const legalInterests = [
    'Family Law', 'Criminal Defense', 'Corporate Law', 'Intellectual Property', 
    'Real Estate', 'Immigration', 'Tax Law', 'Employment Law', 'Personal Injury',
    'Estate Planning', 'Bankruptcy', 'Environmental Law', 'Healthcare Law',
    'Civil Rights', 'International Law', 'Entertainment Law', 'General Consultation'
  ];
  
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Create Your Client Account</h1>
          <p className="text-gray-600">
            Join our platform and find the right legal help for your needs
          </p>
        </div>
        
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between">
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <div className="text-sm mt-1">Basic Info</div>
            </div>
            <div className="grow mx-2 flex items-center">
              <div className={`h-1 w-full ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            </div>
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <div className="text-sm mt-1">Profile Details</div>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && 'Account Information'}
                  {step === 2 && 'Profile Details'}
                </CardTitle>
                <CardDescription>
                  {step === 1 && 'Enter your basic account information'}
                  {step === 2 && 'Tell us more about your legal needs'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {step === 1 && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormDescription>
                            Must be at least 8 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="********" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {step === 2 && (
                  <>
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormDescription>
                            Used for lawyer communications if preferred
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="123 Main St, City, State, Zip" {...field} />
                          </FormControl>
                          <FormDescription>
                            Helps lawyers understand jurisdiction for your case
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="preferredContactMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Contact Method</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select preferred contact method" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone</SelectItem>
                              <SelectItem value="both">Both Email and Phone</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="legalInterests"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Legal Interests</FormLabel>
                            <FormDescription>
                              Select areas of law you're interested in
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {legalInterests.map((interest) => (
                              <FormField
                                key={interest}
                                control={form.control}
                                name="legalInterests"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={interest}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(interest)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, interest])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== interest
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {interest}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="agreeToTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 mt-8">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              I agree to the terms of service and privacy policy
                            </FormLabel>
                            <FormDescription>
                              By creating an account, you agree to our <a href="#" className="text-primary underline">Terms of Service</a> and <a href="#" className="text-primary underline">Privacy Policy</a>.
                            </FormDescription>
                            <FormMessage />
                          </div>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col sm:flex-row gap-4 justify-between">
                <div>
                  {step > 1 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={prevStep}
                    >
                      Back
                    </Button>
                  )}
                  {step === 1 && (
                    <Link href="/register">
                      <Button variant="outline">
                        Cancel
                      </Button>
                    </Link>
                  )}
                </div>
                <div>
                  {step < 2 && (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                    >
                      Continue
                    </Button>
                  )}
                  {step === 2 && (
                    <Button 
                      type="submit" 
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ClientRegister;

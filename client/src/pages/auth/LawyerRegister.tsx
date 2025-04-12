import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { insertUserSchema, insertLawyerProfileSchema } from '@shared/schema';
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
import { Textarea } from '@/components/ui/textarea';
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

// Step 2: Professional Information Schema
const professionalInfoSchema = z.object({
  specialization: z.string().min(1, { message: 'Please select a specialization' }),
  yearsOfExperience: z.number().min(0, { message: 'Experience must be a positive number' }),
  location: z.string().min(1, { message: 'Please enter your location' }),
  lawSchool: z.string().min(1, { message: 'Please enter your law school' }),
  barNumber: z.string().min(1, { message: 'Please enter your bar number' }),
  hourlyRate: z.number().min(0, { message: 'Hourly rate must be a positive number' }),
  availability: z.string().min(1, { message: 'Please enter your availability' }),
});

// Step 3: Profile Details Schema
const profileDetailsSchema = z.object({
  biography: z.string().min(20, { message: 'Biography must be at least 20 characters' }),
  languages: z.array(z.string()).min(1, { message: 'Please select at least one language' }),
  expertise: z.array(z.string()).min(1, { message: 'Please select at least one area of expertise' }),
  profilePicture: z.string().optional(),
  awards: z.array(z.string()).optional(),
  publications: z.array(z.string()).optional(),
  education: z.record(z.string(), z.any()),
  professionalAssociations: z.array(z.string()).optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

// Combined schema for all steps
const fullSchema = z.object({
  ...basicInfoSchema.shape,
  ...professionalInfoSchema.shape,
  ...profileDetailsSchema.shape,
});

const LawyerRegister = () => {
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
      specialization: '',
      yearsOfExperience: 0,
      location: '',
      lawSchool: '',
      barNumber: '',
      hourlyRate: 150,
      availability: 'Weekdays 9am-5pm',
      biography: '',
      languages: ['English'],
      expertise: [],
      awards: [],
      publications: [],
      education: {
        lawSchool: {
          institution: '',
          degree: 'Juris Doctor',
          year: ''
        }
      },
      professionalAssociations: [],
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
        userType: 'lawyer',
      });
      
      if (!userResponse.ok) {
        const error = await userResponse.json();
        throw new Error(error.message || 'Failed to create account');
      }
      
      const user = await userResponse.json();
      
      // Then create lawyer profile
      const profileResponse = await apiRequest('POST', '/api/lawyers/profile', {
        specialization: data.specialization,
        yearsOfExperience: data.yearsOfExperience,
        location: data.location,
        lawSchool: data.lawSchool,
        barNumber: data.barNumber,
        biography: data.biography,
        hourlyRate: data.hourlyRate,
        availability: data.availability,
        languages: data.languages,
        profilePicture: data.profilePicture,
        expertise: data.expertise,
        awards: data.awards,
        publications: data.publications,
        education: data.education,
        professionalAssociations: data.professionalAssociations,
      });
      
      if (!profileResponse.ok) {
        const error = await profileResponse.json();
        throw new Error(error.message || 'Failed to create lawyer profile');
      }
      
      return { user, profile: await profileResponse.json() };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: "Registration Successful",
        description: "Your lawyer account has been created",
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
    } else if (step === 2) {
      validateFields = ['specialization', 'yearsOfExperience', 'location', 'lawSchool', 'barNumber', 'hourlyRate', 'availability'];
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
  
  const languages = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Arabic', 'Russian', 'Portuguese', 'Italian'];
  
  const expertiseAreas = [
    'Family Law', 'Criminal Defense', 'Corporate Law', 'Intellectual Property', 
    'Real Estate', 'Immigration', 'Tax Law', 'Employment Law', 'Personal Injury',
    'Estate Planning', 'Bankruptcy', 'Environmental Law', 'Healthcare Law',
    'Civil Rights', 'International Law', 'Entertainment Law', 'Mergers & Acquisitions'
  ];
  
  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Create Your Lawyer Account</h1>
          <p className="text-gray-600">
            Join our platform and connect with potential clients
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
              <div className="text-sm mt-1">Professional</div>
            </div>
            <div className="grow mx-2 flex items-center">
              <div className={`h-1 w-full ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
            </div>
            <div className="text-center">
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${
                step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                3
              </div>
              <div className="text-sm mt-1">Profile</div>
            </div>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card>
              <CardHeader>
                <CardTitle>
                  {step === 1 && 'Account Information'}
                  {step === 2 && 'Professional Details'}
                  {step === 3 && 'Complete Your Profile'}
                </CardTitle>
                <CardDescription>
                  {step === 1 && 'Enter your basic account information'}
                  {step === 2 && 'Tell us about your legal practice'}
                  {step === 3 && 'Add details to help clients find you'}
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
                      name="specialization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Specialization</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select your primary specialization" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {expertiseAreas.map((area) => (
                                <SelectItem key={area} value={area}>{area}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="yearsOfExperience"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Years of Experience</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hourly Rate (USD)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0}
                                {...field}
                                onChange={e => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="New York, NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lawSchool"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Law School</FormLabel>
                          <FormControl>
                            <Input placeholder="Harvard Law School" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="barNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bar Number</FormLabel>
                          <FormControl>
                            <Input placeholder="123456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="availability"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Availability</FormLabel>
                          <FormControl>
                            <Input placeholder="Weekdays 9am-5pm" {...field} />
                          </FormControl>
                          <FormDescription>
                            General availability for initial consultations
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                
                {step === 3 && (
                  <>
                    <FormField
                      control={form.control}
                      name="biography"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Biography</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell potential clients about your experience and approach..." 
                              className="min-h-[120px]"
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 20 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="languages"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Languages</FormLabel>
                            <FormDescription>
                              Select all languages you're fluent in
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {languages.map((language) => (
                              <FormField
                                key={language}
                                control={form.control}
                                name="languages"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={language}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(language)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, language])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== language
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {language}
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
                      name="expertise"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">Areas of Expertise</FormLabel>
                            <FormDescription>
                              Select all areas you specialize in
                            </FormDescription>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {expertiseAreas.map((area) => (
                              <FormField
                                key={area}
                                control={form.control}
                                name="expertise"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={area}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(area)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, area])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== area
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {area}
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
                  {step < 3 && (
                    <Button 
                      type="button" 
                      onClick={nextStep}
                    >
                      Continue
                    </Button>
                  )}
                  {step === 3 && (
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

export default LawyerRegister;

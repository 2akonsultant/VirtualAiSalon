import { useState } from "react";
import { useLocation } from "wouter";
import { Calendar, Clock, MapPin, User, Phone, Mail, CreditCard, CheckCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Service } from "@shared/schema";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  customerEmail: z.string().email("Please enter a valid email").optional().or(z.literal("")),
  customerAddress: z.string().min(10, "Please provide a complete address"),
  appointmentDate: z.string().min(1, "Please select a date"),
  appointmentTime: z.string().min(1, "Please select a time"),
  notes: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function Booking() {
  const [, setLocation] = useLocation();
  const [selectedServices, setSelectedServices] = useState<Service[]>([]);
  const [currentStep, setCurrentStep] = useState<"services" | "details" | "confirmation">("services");
  const [bookingId, setBookingId] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: services = [], isLoading } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      customerAddress: "",
      appointmentDate: "",
      appointmentTime: "",
      notes: "",
    },
  });

  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await apiRequest("POST", "/api/customers", customerData);
      return response.json();
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      setBookingId(data.id);
      setCurrentStep("confirmation");
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been successfully scheduled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Booking Failed",
        description: "Unable to create booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleServiceToggle = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.id === service.id);
      if (exists) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  const calculateTotal = () => {
    return selectedServices.reduce((total, service) => total + service.priceMin, 0);
  };

  const calculateDuration = () => {
    return selectedServices.reduce((total, service) => total + service.duration, 0);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 20; hour++) {
      for (let minute of [0, 30]) {
        if (hour === 20 && minute === 30) break;
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const getNextSevenDays = () => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'short', 
          day: 'numeric' 
        }),
      });
    }
    return dates;
  };

  const onSubmit = async (data: BookingFormData) => {
    if (selectedServices.length === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select at least one service to continue.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create customer
      const customer = await createCustomerMutation.mutateAsync({
        name: data.customerName,
        phone: data.customerPhone,
        email: data.customerEmail || null,
        address: data.customerAddress,
      });

      // Create booking
      const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
      
      await createBookingMutation.mutateAsync({
        customerId: customer.id,
        serviceIds: selectedServices.map(s => s.id),
        appointmentDate: appointmentDateTime.toISOString(),
        notes: data.notes || null,
      });

    } catch (error) {
      console.error("Booking error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading booking form...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 bg-background">
      {/* Header */}
      <section className="py-8 gradient-hero" data-testid="booking-header">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => setLocation("/")}
              className="mr-4"
              data-testid="button-back-home"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
              Book Your Appointment
            </h1>
            <p className="text-lg text-muted-foreground">
              Schedule your premium doorstep beauty service in just a few steps
            </p>
          </div>
        </div>
      </section>

      {/* Progress Steps */}
      <section className="py-6 bg-background border-b border-border" data-testid="booking-progress">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-8">
            {[
              { step: "services", label: "Select Services", icon: CheckCircle },
              { step: "details", label: "Booking Details", icon: User },
              { step: "confirmation", label: "Confirmation", icon: CheckCircle },
            ].map(({ step, label, icon: Icon }, index) => (
              <div key={step} className="flex items-center" data-testid={`step-${step}`}>
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  currentStep === step 
                    ? "bg-primary border-primary text-primary-foreground" 
                    : index < (currentStep === "details" ? 1 : currentStep === "confirmation" ? 2 : 0)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border text-muted-foreground"
                }`}>
                  <Icon className="h-5 w-5" />
                </div>
                <span className={`ml-2 font-medium ${
                  currentStep === step ? "text-primary" : "text-muted-foreground"
                }`}>
                  {label}
                </span>
                {index < 2 && (
                  <div className={`ml-8 w-8 h-0.5 ${
                    index < (currentStep === "details" ? 1 : currentStep === "confirmation" ? 2 : 0)
                      ? "bg-primary" 
                      : "bg-border"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Service Selection */}
        {currentStep === "services" && (
          <Card data-testid="step-services">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Select Your Services</CardTitle>
              <p className="text-muted-foreground">Choose from our premium beauty treatments</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Women's Services */}
              <div>
                <h3 className="text-xl font-serif font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">👩</span>
                  Women's Hair Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services
                    .filter((service: Service) => service.category === "women")
                    .map((service: Service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceToggle(service)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedServices.find(s => s.id === service.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`service-option-${service.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <Badge variant="outline">₹{service.priceMin}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(service.duration)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Kids Services */}
              <div>
                <h3 className="text-xl font-serif font-semibold mb-4 flex items-center">
                  <span className="text-2xl mr-2">🧒</span>
                  Kids Hair Services
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services
                    .filter((service: Service) => service.category === "kids")
                    .map((service: Service) => (
                      <div
                        key={service.id}
                        onClick={() => handleServiceToggle(service)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedServices.find(s => s.id === service.id)
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        data-testid={`service-option-${service.id}`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{service.name}</h4>
                          <Badge variant="outline">₹{service.priceMin}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{service.description}</p>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDuration(service.duration)}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Selected Services Summary */}
              {selectedServices.length > 0 && (
                <Card className="bg-secondary/30">
                  <CardContent className="p-4">
                    <h4 className="font-semibold mb-3">Selected Services ({selectedServices.length})</h4>
                    <div className="space-y-2 mb-4">
                      {selectedServices.map((service) => (
                        <div key={service.id} className="flex justify-between items-center">
                          <span className="text-sm">{service.name}</span>
                          <span className="text-sm font-medium">₹{service.priceMin}</span>
                        </div>
                      ))}
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-center font-semibold">
                      <span>Total Amount:</span>
                      <span className="text-primary">₹{calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground mt-1">
                      <span>Estimated Duration:</span>
                      <span>{formatDuration(calculateDuration())}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep("details")}
                  disabled={selectedServices.length === 0}
                  className="btn-primary"
                  data-testid="button-continue-to-details"
                >
                  Continue to Booking Details
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Booking Details */}
        {currentStep === "details" && (
          <Card data-testid="step-details">
            <CardHeader>
              <CardTitle className="text-2xl font-serif">Booking Details</CardTitle>
              <p className="text-muted-foreground">Please provide your information and preferred appointment time</p>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Customer Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <User className="h-5 w-5 mr-2 text-primary" />
                      Customer Information
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your full name" {...field} data-testid="input-customer-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone Number *</FormLabel>
                            <FormControl>
                              <Input type="tel" placeholder="Enter your phone number" {...field} data-testid="input-customer-phone" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="customerEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Enter your email (optional)" {...field} data-testid="input-customer-email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="customerAddress"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complete Address *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your complete address for doorstep service" 
                              className="h-24" 
                              {...field} 
                              data-testid="textarea-customer-address"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Appointment Scheduling */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      Appointment Scheduling
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="appointmentDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Date *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-appointment-date">
                                  <SelectValue placeholder="Select appointment date" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {getNextSevenDays().map((date) => (
                                  <SelectItem key={date.value} value={date.value}>
                                    {date.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="appointmentTime"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Preferred Time *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-appointment-time">
                                  <SelectValue placeholder="Select appointment time" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {generateTimeSlots().map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Special Instructions</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any special requirements or notes for the stylist" 
                              className="h-20" 
                              {...field} 
                              data-testid="textarea-booking-notes"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  {/* Booking Summary */}
                  <Card className="bg-secondary/30">
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-3">Booking Summary</h4>
                      <div className="space-y-2 mb-4">
                        {selectedServices.map((service) => (
                          <div key={service.id} className="flex justify-between items-center text-sm">
                            <span>{service.name}</span>
                            <span>₹{service.priceMin}</span>
                          </div>
                        ))}
                      </div>
                      <Separator className="my-3" />
                      <div className="space-y-1">
                        <div className="flex justify-between items-center font-semibold">
                          <span>Total Amount:</span>
                          <span className="text-primary">₹{calculateTotal()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <span>Estimated Duration:</span>
                          <span>{formatDuration(calculateDuration())}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep("services")}
                      data-testid="button-back-to-services"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Services
                    </Button>
                    <Button
                      type="submit"
                      disabled={createCustomerMutation.isPending || createBookingMutation.isPending}
                      className="btn-primary"
                      data-testid="button-confirm-booking"
                    >
                      {createCustomerMutation.isPending || createBookingMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Confirm Booking
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {currentStep === "confirmation" && bookingId && (
          <Card className="text-center" data-testid="step-confirmation">
            <CardContent className="p-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              
              <h2 className="text-3xl font-serif font-bold text-foreground mb-4">
                Booking Confirmed!
              </h2>
              
              <p className="text-lg text-muted-foreground mb-6">
                Your appointment has been successfully scheduled. We'll contact you shortly to confirm the details.
              </p>

              <Card className="bg-secondary/30 mb-6">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3">Booking Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Booking ID:</span>
                      <span className="font-mono">{bookingId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Services:</span>
                      <span>{selectedServices.length} service(s)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-semibold text-primary">₹{calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Duration:</span>
                      <span>{formatDuration(calculateDuration())}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Phone className="h-4 w-4 mr-2" />
                  <span>We'll call you at the provided number for confirmation</span>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    onClick={() => setLocation("/")}
                    className="btn-primary"
                    data-testid="button-back-home"
                  >
                    Back to Home
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    data-testid="button-call-salon"
                  >
                    <a href="tel:9036626642">
                      <Phone className="h-4 w-4 mr-2" />
                      Call Salon
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

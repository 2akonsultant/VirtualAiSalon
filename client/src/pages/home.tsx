import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Calendar, Phone, Star, Home as HomeIcon, ShoppingBag, CheckCircle, Bot, QrCode, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import AIChat from "@/components/ai-chat";
import ServiceCard from "@/components/service-card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Service } from "@shared/schema";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiInitialMessage, setAiInitialMessage] = useState("");
  const { toast } = useToast();

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    phone: "",
    serviceInterest: "",
    address: "",
    message: "",
  });

  // Check if this is an AI chat redirect
  useEffect(() => {
    if (location === "/ai-chat") {
      setShowAIChat(true);
    }
  }, [location]);

  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const featuredServices = services.slice(0, 6);

  // Contact form submission mutation
  const contactMutation = useMutation({
    mutationFn: async (formData: typeof contactForm) => {
      const response = await apiRequest("POST", "/api/contact", formData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you! We'll contact you soon.",
      });
      // Reset form
      setContactForm({
        name: "",
        phone: "",
        serviceInterest: "",
        address: "",
        message: "",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!contactForm.name || !contactForm.phone || !contactForm.serviceInterest || !contactForm.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    contactMutation.mutate(contactForm);
  };

  const handleServiceAI = (service: Service) => {
    setShowAIChat(true);
    setAiInitialMessage(`I'm interested in learning more about ${service.name}. Can you tell me more details?`);
  };

  const handleServiceBook = (service: Service) => {
    setLocation("/booking");
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-16 gradient-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl lg:text-6xl font-serif font-bold text-foreground mb-6">
                <span className="text-primary">Virtual Salon</span> at Your Doorstep
              </h1>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Goodness Glamour brings professional hair services directly to your home. 
                Our virtual salon specializes in premium hair treatments for women and kids, 
                delivered with care and expertise to your doorstep.
              </p>
              
              {/* QR Code Section */}
              <Card className="p-8 mb-8 bg-card/80 backdrop-blur-sm" data-testid="qr-scan-section">
                <div className="flex items-center justify-center mb-6">
                  <div className="w-48 h-48 bg-white border-2 border-primary/20 rounded-2xl flex items-center justify-center shadow-xl p-4">
                    <img 
                      src="/qr-code.png" 
                      alt="QR Code to visit Goodness Glamour website"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <h3 className="text-xl font-serif font-semibold mb-3 text-center">Scan to Visit Our Website</h3>
                <p className="text-muted-foreground text-sm text-center leading-relaxed">
                  Scan this QR code with your phone camera to instantly open our website and explore all services
                </p>
              </Card>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => setLocation("/booking")}
                  className="btn-primary flex items-center justify-center"
                  data-testid="button-book-appointment"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment
                </Button>
                <Button 
                  asChild
                  className="btn-secondary flex items-center justify-center"
                  data-testid="button-call-salon"
                >
                  <a href="tel:9036626642">
                    <Phone className="h-4 w-4 mr-2" />
                    Call: 9036626642
                  </a>
                </Button>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1562322140-8baeececf3df?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Professional hair styling service" 
                className="rounded-xl shadow-2xl w-full h-auto"
                data-testid="hero-image"
              />
              
              <Badge className="floating-badge -top-6 -right-6 bg-primary text-primary-foreground" data-testid="badge-rating">
                <Star className="h-5 w-5 mr-2" />
                5★ Rated
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services */}
      <section className="py-16 bg-background" data-testid="featured-services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">
              Our Premium Hair Services
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Professional hair treatments for women and children, 
              delivered with care and expertise by our virtual salon to your doorstep.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredServices.map((service: Service) => (
              <ServiceCard
                key={service.id}
                service={service}
                onAskAI={handleServiceAI}
                onBook={handleServiceBook}
              />
            ))}
          </div>

          <div className="text-center">
            <Button 
              asChild
              className="btn-primary"
              data-testid="button-view-all-services"
            >
              <a href="/services">View All Services</a>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-secondary/30" data-testid="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to book your premium doorstep beauty service
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: QrCode,
                title: "1. Scan QR Code",
                description: "Scan our QR code from flyers, products, or salon materials to instantly connect with our AI assistant.",
                color: "bg-primary",
                href: "/scan-qr"
              },
              {
                icon: Bot,
                title: "2. Chat with AI",
                description: "Our AI assistant will understand your needs and recommend the perfect services for you and your family.",
                color: "bg-accent",
                href: "/ai-chat"
              },
              {
                icon: CheckCircle,
                title: "3. Book Appointment", 
                description: "Choose your preferred date, time, and location. Our system will confirm your booking instantly.",
                color: "bg-primary",
                href: "/booking"
              },
              {
                icon: HomeIcon,
                title: "4. Enjoy Service",
                description: "Our professional stylist arrives at your doorstep with all equipment for a premium salon experience.",
                color: "bg-accent",
                href: "/about-service"
              }
            ].map((step, index) => (
              <a 
                key={index} 
                href={step.href}
                className="text-center group cursor-pointer block hover:scale-105 transition-transform"
                data-testid={`step-${index + 1}`}
              >
                <div className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform`}>
                  <step.icon className="text-white text-2xl h-8 w-8" />
                </div>
                <h3 className="text-xl font-serif font-semibold mb-4 group-hover:text-primary transition-colors">{step.title}</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors">{step.description}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Showcase */}
      <section className="py-16 bg-background" data-testid="ai-showcase">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-6">
                Meet Your Personal Beauty Assistant
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Our AI-powered assistant is available 24/7 to help you choose the perfect services, 
                answer questions, and book appointments. Experience personalized beauty consultations 
                through voice or chat.
              </p>
              
              <div className="space-y-4 mb-8">
                {[
                  "Instant service recommendations",
                  "Voice and chat support", 
                  "Real-time appointment booking",
                  "Personalized beauty advice"
                ].map((feature, index) => (
                  <div key={index} className="flex items-center" data-testid={`ai-feature-${index}`}>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-4">
                      <CheckCircle className="text-primary-foreground text-sm h-4 w-4" />
                    </div>
                    <span className="text-foreground">{feature}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => setShowAIChat(true)}
                className="btn-accent flex items-center"
                data-testid="button-try-ai-assistant"
              >
                <Bot className="h-4 w-4 mr-2" />
                Try AI Assistant
              </Button>
            </div>

            {/* AI Chat Demo */}
            <Card className="shadow-lg" data-testid="ai-chat-demo">
              <div className="bg-primary text-primary-foreground p-4 flex items-center rounded-t-xl">
                <div className="w-8 h-8 bg-primary-foreground/20 rounded-full flex items-center justify-center mr-3">
                  <Bot className="text-primary-foreground text-sm h-4 w-4" />
                </div>
                <div>
                  <h4 className="font-medium">Beauty Assistant</h4>
                  <p className="text-xs opacity-80">Online now</p>
                </div>
              </div>
              
              <CardContent className="p-6 h-80 overflow-y-auto space-y-4">
                {[
                  { role: "ai", message: "Hello! Welcome to Goodness Glamour. Which service are you interested in today?" },
                  { role: "user", message: "I want a hair treatment and spa for myself and a haircut for my daughter." },
                  { role: "ai", message: "Perfect! For hair treatment, we have keratin treatment (₹2000), hair spa (₹1200), and scalp detox (₹800). For kids haircut, we offer fun cuts starting from ₹300. Which interests you?" },
                  { role: "user", message: "Book keratin treatment and kids haircut for this Saturday." },
                  { role: "ai", message: "Excellent choice! I can book both services for Saturday. Could you please provide your address and preferred time slot?" }
                ].map((chat, index) => (
                  <div 
                    key={index} 
                    className={`flex items-start ${chat.role === "user" ? "justify-end" : ""}`}
                    data-testid={`demo-message-${index}`}
                  >
                    {chat.role === "ai" && (
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <Bot className="text-primary-foreground text-xs h-4 w-4" />
                      </div>
                    )}
                    
                    <div className={`rounded-lg p-3 max-w-xs text-sm ${
                      chat.role === "user" 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-secondary text-secondary-foreground"
                    }`}>
                      {chat.message}
                    </div>
                  </div>
                ))}
              </CardContent>

              <div className="p-4 border-t border-border">
                <div className="flex items-center space-x-2">
                  <Input placeholder="Type your message..." className="flex-1" disabled />
                  <Button size="icon" disabled className="btn-primary">
                    <Bot className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-secondary/30" data-testid="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">
              What Our Clients Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Read testimonials from satisfied customers who love our doorstep beauty services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Priya Sharma",
                role: "Regular Customer",
                rating: 5,
                review: "Amazing service! The AI assistant helped me choose the perfect treatment. The stylist was professional and my hair looks fantastic. Love the convenience!"
              },
              {
                name: "Anita Desai", 
                role: "Mother of Two",
                rating: 5,
                review: "Perfect for busy moms! My daughter loved her haircut and I got a relaxing spa treatment. The QR code booking was so easy to use."
              },
              {
                name: "Rashmi Patel",
                role: "Working Professional", 
                rating: 5,
                review: "The AI voice assistant understands exactly what I need. Professional service, affordable prices, and great results every time!"
              }
            ].map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow" data-testid={`testimonial-${index}`}>
                <div className="flex items-center mb-4">
                  <div className="flex text-accent">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-muted-foreground mb-6 italic">
                  "{testimonial.review}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mr-4">
                    <span className="text-primary-foreground font-semibold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-background" data-testid="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Ready to experience premium doorstep beauty services? Contact us today!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <div className="space-y-6">
                {[
                  { icon: Phone, title: "Phone", info: "9036626642" },
                  { icon: Clock, title: "Service Hours", info: "Mon - Sun: 9:00 AM - 8:00 PM" },
                  { icon: MapPin, title: "Service Area", info: "We serve across the city with doorstep services" },
                  { icon: Bot, title: "AI Assistant", info: "Available 24/7 for instant booking and queries" }
                ].map((contact, index) => (
                  <div key={index} className="flex items-center" data-testid={`contact-info-${index}`}>
                    <div className={`w-12 h-12 ${index % 2 === 0 ? 'bg-primary' : 'bg-accent'} rounded-full flex items-center justify-center mr-4`}>
                      <contact.icon className="text-white h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{contact.title}</h4>
                      <p className="text-muted-foreground">{contact.info}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 space-y-4">
                <Button 
                  onClick={() => setLocation("/booking")}
                  className="w-full btn-primary flex items-center justify-center"
                  data-testid="button-book-appointment-contact"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Book Appointment Now
                </Button>
                <Button 
                  onClick={() => setShowAIChat(true)}
                  className="w-full btn-accent flex items-center justify-center"
                  data-testid="button-chat-ai-contact"
                >
                  <Bot className="h-4 w-4 mr-2" />
                  Chat with AI Assistant
                </Button>
                <Button 
                  asChild
                  className="w-full btn-secondary flex items-center justify-center"
                  data-testid="button-call-contact"
                >
                  <a href="tel:9036626642">
                    <Phone className="h-4 w-4 mr-2" />
                    Call: 9036626642
                  </a>
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <Card className="p-8" data-testid="contact-form">
              <h3 className="text-2xl font-serif font-semibold mb-6">Send us a Message</h3>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Name *</label>
                    <Input 
                      placeholder="Your name" 
                      value={contactForm.name}
                      onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                      data-testid="input-contact-name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Phone *</label>
                    <Input 
                      type="tel" 
                      placeholder="Your phone number" 
                      value={contactForm.phone}
                      onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                      data-testid="input-contact-phone"
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Service Interest *</label>
                  <Select 
                    value={contactForm.serviceInterest}
                    onValueChange={(value) => setContactForm({...contactForm, serviceInterest: value})}
                  >
                    <SelectTrigger data-testid="select-service-interest">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Women's Hair Services">Women's Hair Services</SelectItem>
                      <SelectItem value="Kids Hair Services">Kids Hair Services</SelectItem>
                      <SelectItem value="Hair Spa & Treatment">Hair Spa & Treatment</SelectItem>
                      <SelectItem value="Bridal & Party Styling">Bridal & Party Styling</SelectItem>
                      <SelectItem value="Hair Coloring">Hair Coloring</SelectItem>
                      <SelectItem value="Consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Address *</label>
                  <Textarea 
                    placeholder="Your full address for doorstep service" 
                    className="h-24"
                    value={contactForm.address}
                    onChange={(e) => setContactForm({...contactForm, address: e.target.value})}
                    data-testid="textarea-contact-address"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message (Optional)</label>
                  <Textarea 
                    placeholder="Tell us about your requirements" 
                    className="h-24"
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    data-testid="textarea-contact-message"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full btn-accent"
                  disabled={contactMutation.isPending}
                  data-testid="button-send-message"
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12" data-testid="footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-serif font-semibold mb-4">Goodness Glamour</h3>
              <p className="text-background/80 mb-4">
                Premium doorstep beauty services for women and kids. 
                Experience luxury salon treatments in the comfort of your home.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-background/80">
                <li>Hair Cut & Styling</li>
                <li>Hair Coloring</li>
                <li>Hair Spa & Treatment</li>
                <li>Bridal Styling</li>
                <li>Kids Hair Services</li>
                <li>Home Consultation</li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-background/80">
                <li><a href="/services" className="hover:text-background">Our Services</a></li>
                <li><a href="#how-it-works" className="hover:text-background">How It Works</a></li>
                <li><a href="#contact" className="hover:text-background">Contact Us</a></li>
                <li><a href="/booking" className="hover:text-background">Book Now</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-background/80">
                <li className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  9036626642
                </li>
                <li className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  9 AM - 8 PM Daily
                </li>
                <li className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Citywide Service
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-background/20 mt-8 pt-8 text-center text-background/60">
            <p>&copy; 2024 Goodness Glamour Ladies & Kids Salon. All rights reserved.</p>
            <p className="mt-2">Powered by AI-driven booking technology</p>
          </div>
        </div>
      </footer>

      {/* Floating AI Chat Button */}
      <Button
        onClick={() => setShowAIChat(true)}
        className="fixed bottom-6 right-6 z-40 bg-accent text-accent-foreground w-16 h-16 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 flex items-center justify-center"
        data-testid="button-floating-ai-chat"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* AI Chat Modal */}
      <AIChat
        isOpen={showAIChat}
        onClose={() => setShowAIChat(false)}
        initialMessage={aiInitialMessage}
      />
    </div>
  );
}

import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, Calendar, LogIn, UserPlus, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Check if user is logged in
  const token = localStorage.getItem("authToken");
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;

  const handleLogout = () => {
    console.log("🚪 Logout button clicked");
    console.log("🚪 Current location before logout:", location);
    console.log("🚪 Removing auth token and user data...");
    
    // Clear all authentication data
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingUserId");
    localStorage.removeItem("pendingUserEmail");
    
    console.log("🚪 All auth data cleared");
    console.log("🚪 Redirecting to login page...");
    
    // Force redirect to login page
    setLocation("/login");
    
    console.log("🚪 Logout completed");
    
    // Force page reload to ensure auth state is cleared
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  const navItems = [
    { href: "/services", label: "Services" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/", label: "How It Works", hash: "#how-it-works" },
    { href: "/", label: "Contact", hash: "#contact" },
  ];

  const handleNavClick = (href: string, hash?: string) => {
    setIsOpen(false);
    if (hash && location === "/") {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-b border-border z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" data-testid="link-home">
            <h1 className="text-xl font-serif font-semibold text-primary hover:text-primary/80 transition-colors">
              Goodness Glamour
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href + (item.hash || "")}
                href={item.href}
                onClick={() => handleNavClick(item.href, item.hash)}
                data-testid={`link-nav-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <span className="text-foreground hover:text-primary transition-colors cursor-pointer">
                  {item.label}
                </span>
              </Link>
            ))}
            
            <a 
              href="tel:9036626642" 
              className="text-foreground hover:text-primary transition-colors flex items-center"
              data-testid="link-phone"
            >
              <Phone className="h-4 w-4 mr-1" />
              9036626642
            </a>
            
            {token && user ? (
              <>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <User className="h-4 w-4" />
                  <span>Hi, {user.name}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("🎯 Desktop logout button clicked");
                    console.log("🎯 handleLogout function:", typeof handleLogout);
                    handleLogout();
                  }}
                  className="flex items-center hover:bg-red-50 hover:border-red-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="sm" className="flex items-center">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            
            <Link href="/booking" data-testid="button-book-now">
              <Button className="btn-primary flex items-center">
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-6">
                  <Link href="/" onClick={() => setIsOpen(false)} data-testid="link-mobile-home">
                    <h2 className="text-lg font-serif font-semibold text-primary">
                      Goodness Glamour
                    </h2>
                  </Link>
                  
                  {navItems.map((item) => (
                    <Link
                      key={item.href + (item.hash || "")}
                      href={item.href}
                      onClick={() => handleNavClick(item.href, item.hash)}
                      data-testid={`link-mobile-${item.label.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <span className="text-lg text-foreground hover:text-primary transition-colors cursor-pointer">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                  
                  <a 
                    href="tel:9036626642" 
                    className="text-lg text-foreground hover:text-primary transition-colors flex items-center"
                    data-testid="link-mobile-phone"
                  >
                    <Phone className="h-5 w-5 mr-2" />
                    9036626642
                  </a>
                  
                  {/* Mobile Auth Buttons */}
                  {token && user ? (
                    <>
                      <div className="flex items-center gap-2 text-lg text-foreground py-2">
                        <User className="h-5 w-5" />
                        <span>Hi, {user.name}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          console.log("🎯 Mobile logout button clicked");
                          setIsOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center justify-center hover:bg-red-50 hover:border-red-200"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full flex items-center justify-center">
                          <LogIn className="h-4 w-4 mr-2" />
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <Button variant="default" className="w-full flex items-center justify-center">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  <Link href="/booking" onClick={() => setIsOpen(false)} data-testid="button-mobile-book">
                    <Button className="btn-primary w-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Book Appointment
                    </Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

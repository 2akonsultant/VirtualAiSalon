import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Calendar, LogIn, UserPlus, LogOut, User, Settings, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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

  // Role-based navigation items
  const navItems = user?.role === "admin" 
    ? [
        { href: "/services", label: "Services" },
        { href: "/admin-dashboard", label: "Admin Dashboard" },
        { href: "/", label: "How It Works", hash: "#how-it-works" },
        { href: "/", label: "Contact", hash: "#contact" },
      ]
    : [
        { href: "/services", label: "Services" },
        { href: "/my-bookings", label: "My Bookings" },
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
    <nav className="fixed top-0 left-0 right-0 bg-[#2c1810]/85 backdrop-blur-md border-b border-[#c9a869]/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <Link href="/" data-testid="link-home">
            <h1 className="text-3xl font-serif font-semibold text-[#faf8f3] hover:text-[#d4af37] transition-colors">
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
                <span className="text-lg text-[#faf8f3] hover:text-[#d4af37] transition-colors cursor-pointer">
                  {item.label}
                </span>
              </Link>
            ))}
            
            {token && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-3 h-auto text-[#faf8f3]">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{backgroundColor:'#c9a86922'}}>
                      <User className="h-5 w-5" style={{color:'#c9a869'}} />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700">
                  <div className="px-3 py-2 border-b border-gray-700">
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-white/80">{user.email}</p>
                  </div>
                  <DropdownMenuItem 
                    onClick={() => setLocation("/my-bookings")}
                    className="text-white/90 hover:text-white hover:bg-gray-800"
                  >
                    <User className="h-4 w-4 mr-2" />
                    My Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setLocation("/booking")}
                    className="text-white/90 hover:text-white hover:bg-gray-800"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Book Appointment
                  </DropdownMenuItem>
                  {user.role === "admin" && (
                    <DropdownMenuItem 
                      onClick={() => setLocation("/admin-dashboard")}
                      className="text-white/90 hover:text-white hover:bg-gray-800"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
                  >
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="lg" className="flex items-center border-[#c9a869] text-[#faf8f3] hover:bg-[#d4af37] hover:text-[#2c1810]">
                    <LogIn className="h-5 w-5 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default" size="lg" className="flex items-center bg-[#c9a869] text-[#2c1810] hover:bg-[#d4af37]">
                    <UserPlus className="h-5 w-5 mr-2" />
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
            
            <Link href="/booking" data-testid="button-book-now">
              <Button className="flex items-center text-lg px-6 py-3 bg-[#c9a869] text-[#2c1810] hover:bg-[#d4af37]">
                <Calendar className="h-5 w-5 mr-2" />
                Book Now
              </Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-12 w-12" data-testid="button-mobile-menu">
                  <Menu className="h-7 w-7" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-6 mt-6">
                  <Link href="/" onClick={() => setIsOpen(false)} data-testid="link-mobile-home">
                    <h2 className="text-2xl font-serif font-semibold text-gray-800">
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
                      <span className="text-xl text-gray-800 hover:text-gray-900 transition-colors cursor-pointer">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                  
                  {/* Mobile Auth Buttons */}
                  {token && user ? (
                    <>
                      <div className="flex items-center gap-3 text-xl text-foreground py-3 border-b border-gray-700">
                        <div className="w-12 h-12 bg-gradient-to-br from-amber-700 via-amber-600 to-amber-800 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-black" />
                        </div>
                        <div>
                          <p className="text-lg font-medium text-white">{user.name}</p>
                          <p className="text-base text-white/80">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setIsOpen(false);
                            setLocation("/my-bookings");
                          }}
                          className="w-full flex items-center justify-start text-lg text-white/90 hover:text-white hover:bg-gray-800 py-3"
                        >
                          <User className="h-5 w-5 mr-3" />
                          My Profile
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          onClick={() => {
                            setIsOpen(false);
                            setLocation("/booking");
                          }}
                          className="w-full flex items-center justify-start text-lg text-white/90 hover:text-white hover:bg-gray-800 py-3"
                        >
                          <Calendar className="h-5 w-5 mr-3" />
                          Book Appointment
                        </Button>
                        
                        {user.role === "admin" && (
                          <Button 
                            variant="ghost" 
                            onClick={() => {
                              setIsOpen(false);
                              setLocation("/admin-dashboard");
                            }}
                            className="w-full flex items-center justify-start text-lg text-white/90 hover:text-white hover:bg-gray-800 py-3"
                          >
                            <Settings className="h-5 w-5 mr-3" />
                            Admin Dashboard
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsOpen(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center justify-start text-lg text-red-400 hover:text-red-300 hover:bg-red-900/20 py-3"
                        >
                          <ArrowRight className="h-5 w-5 mr-3" />
                          Sign out
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full flex items-center justify-center text-lg py-3">
                          <LogIn className="h-5 w-5 mr-2" />
                          Login
                        </Button>
                      </Link>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <Button variant="default" className="w-full flex items-center justify-center text-lg py-3">
                          <UserPlus className="h-5 w-5 mr-2" />
                          Sign Up
                        </Button>
                      </Link>
                    </>
                  )}
                  
                  <Link href="/booking" onClick={() => setIsOpen(false)} data-testid="button-mobile-book">
                    <Button className="btn-primary w-full flex items-center justify-center text-lg py-3">
                      <Calendar className="h-5 w-5 mr-2" />
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

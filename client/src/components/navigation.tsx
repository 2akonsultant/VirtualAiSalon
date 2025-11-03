import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Calendar, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [location, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Public site: hide auth; provide default user null
  const token = null as unknown as string | null;
  const user = null as unknown as { role?: string; name?: string; email?: string } | null;

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
            
            {/* Auth UI removed for public site */}
            
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
                  
                  {/* Auth UI removed for public site (mobile) */}
                  
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

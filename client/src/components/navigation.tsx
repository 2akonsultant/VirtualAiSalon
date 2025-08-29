import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function Navigation() {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { href: "/services", label: "Services" },
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

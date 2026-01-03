import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-4">
        <div className="space-y-2">
          <h1 className="text-8xl font-bold text-primary">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button asChild className="gap-2">
            <Link to="/dashboard">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
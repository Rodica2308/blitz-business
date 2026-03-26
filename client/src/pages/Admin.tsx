import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Layout from "@/components/Layout";
import AdminPanel from "@/components/AdminPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const Admin = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [_, setLocation] = useLocation();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, isLoading, setLocation]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <Card className="p-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
            <h3 className="text-xl font-semibold mb-2">Checking authentication...</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              Please wait while we verify your credentials.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  // Show unauthorized message if not authenticated
  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="h-full flex items-center justify-center">
          <Card className="p-8 flex flex-col items-center justify-center max-w-md">
            <div className="text-red-500 mb-4 text-6xl">⚠️</div>
            <h3 className="text-xl font-semibold mb-3">Unauthorized Access</h3>
            <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
              You need to be logged in as an administrator to access this page.
            </p>
            <Button onClick={() => setLocation("/")}>Go to Home</Button>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <AdminPanel isOpen={true} onClose={() => setLocation("/")} />
    </Layout>
  );
};

export default Admin;

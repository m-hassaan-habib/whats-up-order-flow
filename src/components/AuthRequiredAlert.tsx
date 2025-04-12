
import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface AuthRequiredAlertProps {
  action: string;
}

export const AuthRequiredAlert: React.FC<AuthRequiredAlertProps> = ({ action }) => {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Authentication Required</AlertTitle>
      <AlertDescription className="flex flex-col md:flex-row gap-2 md:items-center">
        <span>You need to be logged in to {action}.</span>
        <div className="flex gap-2">
          <Link to="/login">
            <Button variant="outline" size="sm">
              Login
            </Button>
          </Link>
          <Link to="/signup">
            <Button size="sm">
              Sign Up
            </Button>
          </Link>
        </div>
      </AlertDescription>
    </Alert>
  );
};

// client/src/components/auth/RegisterForm.jsx
import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RegisterForm = () => {
  const { register } = useAuth();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (userData.password !== userData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(userData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <h2 className="text-2xl font-bold text-center">Register</h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div>
            <Input
              placeholder="Name"
              value={userData.name}
              onChange={(e) => setUserData(prev => ({
                ...prev,
                name: e.target.value
              }))}
              required
            />
          </div>
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={userData.email}
              onChange={(e) => setUserData(prev => ({
                ...prev,
                email: e.target.value
              }))}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Password"
              value={userData.password}
              onChange={(e) => setUserData(prev => ({
                ...prev,
                password: e.target.value
              }))}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Confirm Password"
              value={userData.confirmPassword}
              onChange={(e) => setUserData(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Register'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
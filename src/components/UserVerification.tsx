import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield, MapPin, Phone, User } from 'lucide-react';
import { AFRICAN_COUNTRIES, COUNTRY_PHONE_CODES } from '../types/user';
import { blink } from '../blink/client';

interface UserVerificationProps {
  onVerificationComplete: (verificationData: any) => void;
}

export function UserVerification({ onVerificationComplete }: UserVerificationProps) {
  const [step, setStep] = useState<'form' | 'verification'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    country: '',
    verificationCode: ''
  });

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await blink.auth.me();
      
      // Validate phone number format
      const countryCode = COUNTRY_PHONE_CODES[formData.country as keyof typeof COUNTRY_PHONE_CODES];
      if (!formData.phoneNumber.startsWith(countryCode)) {
        throw new Error(`Phone number must start with ${countryCode} for ${formData.country}`);
      }

      // Generate verification code (in real app, this would be sent via SMS)
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Store verification data
      await blink.db.userVerifications.create({
        id: `verification_${Date.now()}`,
        user_id: user.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phoneNumber,
        country: formData.country,
        is_verified: false,
        verification_code: verificationCode,
        created_at: new Date().toISOString()
      });

      // In a real app, send SMS here
      console.log('Verification code (demo):', verificationCode);
      alert(`Demo: Your verification code is ${verificationCode}`);
      
      setStep('verification');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await blink.auth.me();
      
      // Get the verification record
      const verifications = await blink.db.userVerifications.list({
        where: { user_id: user.id },
        orderBy: { created_at: 'desc' },
        limit: 1
      });

      if (verifications.length === 0) {
        throw new Error('No verification record found');
      }

      const verification = verifications[0];
      
      if (verification.verification_code !== formData.verificationCode) {
        throw new Error('Invalid verification code');
      }

      // Update verification status
      await blink.db.userVerifications.update(verification.id, {
        is_verified: true,
        verified_at: new Date().toISOString()
      });

      // Complete verification
      onVerificationComplete({
        firstName: verification.first_name,
        lastName: verification.last_name,
        phoneNumber: verification.phone_number,
        country: verification.country,
        isVerified: true
      });

    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'verification') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Verify Your Phone</CardTitle>
            <CardDescription>
              Enter the 6-digit code sent to {formData.phoneNumber}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={formData.verificationCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, verificationCode: e.target.value }))}
                  className="text-center text-lg tracking-widest"
                  required
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify Phone Number'
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep('form')}
              >
                Back to Form
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-6 h-6 text-orange-600" />
          </div>
          <CardTitle className="text-2xl">Verify Your Identity</CardTitle>
          <CardDescription>
            We need to verify you're from an African country to participate in our surveys
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitForm} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    className="pl-10"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    className="pl-10"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                <Select
                  value={formData.country}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, country: value, phoneNumber: '' }))}
                  required
                >
                  <SelectTrigger className="pl-10">
                    <SelectValue placeholder="Select your African country" />
                  </SelectTrigger>
                  <SelectContent>
                    {AFRICAN_COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Phone Number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  type="tel"
                  placeholder={formData.country ? `${COUNTRY_PHONE_CODES[formData.country as keyof typeof COUNTRY_PHONE_CODES]}123456789` : 'Select country first'}
                  className="pl-10"
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  disabled={!formData.country}
                  required
                />
              </div>
              {formData.country && (
                <p className="text-sm text-gray-500 mt-1">
                  Must start with {COUNTRY_PHONE_CODES[formData.country as keyof typeof COUNTRY_PHONE_CODES]}
                </p>
              )}
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700" disabled={loading || !formData.country}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Code...
                </>
              ) : (
                'Send Verification Code'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
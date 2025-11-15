import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api';
import { useTheme } from '../hooks/useTheme';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Alert, AlertDescription } from './ui/alert';
import { Field, FieldContent, FieldLabel, FieldError } from './ui/field';
import { Eye, EyeOff, Sun, Moon, ChevronDownIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar } from './ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface FormErrors {
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  dob?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
}

export default function AuthPage() {
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Set page title
  useDocumentTitle(mode === 'login' ? 'Sign In' : 'Sign Up');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState<Date | undefined>(undefined);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dobOpen, setDobOpen] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) return 'Email is required';
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return undefined;
  };

  const validateName = (name: string): string | undefined => {
    if (!name.trim()) return 'Name is required';
    if (name.trim().length < 2) return 'Name must be at least 2 characters';
    return undefined;
  };

  const validateRequired = (label: string, value: string): string | undefined => {
    if (!value || !value.toString().trim()) return `${label} is required`;
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    newErrors.email = validateEmail(email);
    if (mode === 'register') {
      newErrors.firstName = validateName(firstName);
      newErrors.lastName = validateName(lastName);
      newErrors.gender = validateRequired('Gender', gender);
      newErrors.dob = dob ? undefined : 'Date of Birth is required';
    }
    newErrors.password = validatePassword(password);
    if (mode === 'register') {
      newErrors.confirmPassword = !confirmPassword
        ? 'Confirm password is required'
        : confirmPassword !== password
          ? 'Passwords do not match'
          : undefined;
    }
    
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleInputChange = (field: keyof FormErrors, value: string) => {
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setSuccess(null);
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'register') {
        const combinedName = `${firstName.trim()} ${lastName.trim()}`.trim();
        await register(email, combinedName, password);
        setSuccess('Registration successful. Redirecting to login...');
        setTimeout(() => {
          setMode('login');
          setSuccess(null);
          setEmail('');
          setName('');
          setFirstName('');
          setLastName('');
          setGender('');
          setDob(undefined);
          setPassword('');
          setConfirmPassword('');
        }, 1000);
      } else {
        const { accessToken } = await login(email, password);
        const { setAuthToken } = await import('../api');
        setAuthToken(accessToken);
        navigate('/');
      }
    } catch (err: any) {
      setErrors({ 
        general: err?.response?.data?.message || 'An error occurred. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      {/* Dark/Light Mode Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-4 right-4 h-10 w-10 p-0"
        onClick={toggleDarkMode}
      >
        {isDarkMode ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </Button>
      
      <Card className="w-full max-w-md">
        <CardHeader className="text-start">
          <CardTitle className="text-2xl font-bold">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {mode === 'login' 
              ? 'Sign in to your account to continue' 
              : 'Enter your details to create a new account'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field>
              <FieldLabel>Email</FieldLabel>
              <FieldContent>
                <Input 
                  value={email} 
                  onChange={e => {
                    setEmail(e.target.value);
                    handleInputChange('email', e.target.value);
                  }}
                  type="email" 
                  placeholder="Enter your email"
                  className={errors.email ? 'border-destructive' : ''}
                  required 
                />
              </FieldContent>
              <FieldError>{errors.email}</FieldError>
            </Field>
            
            {mode === 'register' && (
              <>
                <Field>
                  <FieldLabel>First Name</FieldLabel>
                  <FieldContent>
                    <Input
                      value={firstName}
                      onChange={e => {
                        setFirstName(e.target.value);
                        handleInputChange('firstName', e.target.value);
                      }}
                      placeholder="Enter your first name"
                      className={errors.firstName ? 'border-destructive' : ''}
                      required
                    />
                  </FieldContent>
                  <FieldError>{errors.firstName}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Last Name</FieldLabel>
                  <FieldContent>
                    <Input
                      value={lastName}
                      onChange={e => {
                        setLastName(e.target.value);
                        handleInputChange('lastName', e.target.value);
                      }}
                      placeholder="Enter your last name"
                      className={errors.lastName ? 'border-destructive' : ''}
                      required
                    />
                  </FieldContent>
                  <FieldError>{errors.lastName}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Gender</FieldLabel>
                  <FieldContent>
                    <Select
                      value={gender}
                      onValueChange={(val) => {
                        setGender(val);
                        handleInputChange('gender', val);
                      }}
                    >
                      <SelectTrigger
                        className={`w-full ${errors.gender ? 'aria-invalid' : ''}`}
                        aria-invalid={!!errors.gender}
                      >
                        <SelectValue placeholder="Select your gender" />
                      </SelectTrigger>
                      <SelectContent align="start">
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldContent>
                  <FieldError>{errors.gender}</FieldError>
                </Field>

                <Field>
                  <FieldLabel>Date of Birth</FieldLabel>
                  <FieldContent>
                    <Popover open={dobOpen} onOpenChange={setDobOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          id="date"
                          className={cn(
                            "w-full justify-between font-normal",
                            !dob && "text-muted-foreground",
                            errors.dob ? 'border-destructive' : ''
                          )}
                        >
                          {dob ? dob.toLocaleDateString() : "Select date"}
                          <ChevronDownIcon />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="min-w-[250px] w-[280px] p-0"
                        align="start"
                      >
                        <Calendar
                          className="bg-popover rounded-md p-3 [--cell-size:2.7rem] w-full"
                          mode="single"
                          selected={dob}
                          captionLayout="dropdown"
                          fromYear={1900}
                          toYear={new Date().getFullYear()}
                          defaultMonth={dob ?? new Date(2000, 0, 1)}
                          onSelect={(date) => {
                            setDob(date || undefined);
                            handleInputChange('dob', date ? date.toISOString() : '');
                            setDobOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </FieldContent>
                  <FieldError>{errors.dob}</FieldError>
                </Field>
              </>
            )}
            
            <Field>
              <FieldLabel>Password</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <Input 
                    value={password} 
                    onChange={e => {
                      setPassword(e.target.value);
                      handleInputChange('password', e.target.value);
                    }}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className={`pr-10 ${errors.password ? 'border-destructive' : ''}`}
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </FieldContent>
              <FieldError>{errors.password}</FieldError>
            </Field>

            {mode === 'register' && (
              <Field>
                <FieldLabel>Confirm Password</FieldLabel>
                <FieldContent>
                  <Input
                    value={confirmPassword}
                    onChange={e => {
                      setConfirmPassword(e.target.value);
                      handleInputChange('confirmPassword', e.target.value);
                    }}
                    type="password"
                    placeholder="Re-enter your password"
                    className={errors.confirmPassword ? 'border-destructive' : ''}
                    required
                  />
                </FieldContent>
                <FieldError>{errors.confirmPassword}</FieldError>
              </Field>
            )}
            
            {errors.general && (
              <Alert variant="destructive">
                <AlertDescription>{errors.general}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert>
                <AlertDescription className="text-green-600">{success}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary font-medium hover:underline"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary font-medium hover:underline"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



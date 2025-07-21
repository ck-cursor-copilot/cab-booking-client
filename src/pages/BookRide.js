import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  InputAdornment,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  LocationOn,
  DirectionsCar,
  Payment,
  AccessTime,
  Person,
  Star,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';

const schema = yup.object().shape({
  pickupLocation: yup.string().required('Pickup location is required'),
  destination: yup.string().required('Destination is required'),
  cabType: yup.string().required('Please select a cab type'),
  paymentMethod: yup.string().required('Please select a payment method'),
});

const cabTypes = [
  {
    id: 'economy',
    name: 'Economy',
    description: 'Affordable rides for everyday travel',
    basePrice: 2.5,
    perKmPrice: 1.2,
    icon: '🚗',
    features: ['Air Conditioning', 'Clean Interior', 'Professional Driver'],
  },
  {
    id: 'comfort',
    name: 'Comfort',
    description: 'Spacious and comfortable rides',
    basePrice: 3.5,
    perKmPrice: 1.8,
    icon: '🚙',
    features: ['Premium Interior', 'Extra Space', 'Priority Support'],
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Luxury rides for special occasions',
    basePrice: 5.0,
    perKmPrice: 2.5,
    icon: '🚘',
    features: ['Luxury Vehicle', 'Professional Chauffeur', 'Premium Amenities'],
  },
];

const paymentMethods = [
  { id: 'cash', name: 'Cash', icon: '💵' },
  { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
  { id: 'digital', name: 'Digital Wallet', icon: '📱' },
];

const BookRide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [availableCabs, setAvailableCabs] = useState([]);
  const [selectedCabType, setSelectedCabType] = useState(null);
  const [estimatedFare, setEstimatedFare] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: yupResolver(schema),
  });

  const watchPickupLocation = watch('pickupLocation');
  const watchDestination = watch('destination');
  const watchCabType = watch('cabType');

  useEffect(() => {
    fetchAvailableCabs();
  }, []);

  useEffect(() => {
    if (watchPickupLocation && watchDestination && watchCabType) {
      calculateFare();
    }
  }, [watchPickupLocation, watchDestination, watchCabType]);

  const fetchAvailableCabs = async () => {
    try {
      const response = await api.getAvailableCabs();
      setAvailableCabs(response.data);
    } catch (error) {
      console.error('Failed to fetch available cabs:', error);
    }
  };

  const calculateFare = () => {
    if (!watchPickupLocation || !watchDestination || !watchCabType) return;

    const cabType = cabTypes.find(ct => ct.id === watchCabType);
    if (!cabType) return;

    // Simple distance calculation (in real app, use Google Maps API)
    const distance = Math.random() * 20 + 5; // 5-25 km
    const fare = cabType.basePrice + (distance * cabType.perKmPrice);
    const time = Math.round(distance * 2 + Math.random() * 10); // 2 min per km + random

    setEstimatedFare(fare);
    setEstimatedTime(time);
    setSelectedCabType(cabType);
  };

  const onSubmit = async (data) => {
    setLoading(true);
    
    try {
      const bookingData = {
        pickupLocation: data.pickupLocation,
        destination: data.destination,
        cabType: data.cabType,
        paymentMethod: data.paymentMethod,
        estimatedFare,
        estimatedTime,
        userId: user.id,
      };

      const response = await api.createBooking(bookingData);
      
      const booking = response.data;
      
      toast.success('Booking created successfully! Looking for a driver...');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to create booking';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCabTypeSelect = (cabTypeId) => {
    setValue('cabType', cabTypeId);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Book Your Ride
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Enter your pickup and destination locations to get started.
      </Typography>

      <Grid container spacing={3}>
        {/* Booking Form */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trip Details
              </Typography>
              
              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Pickup Location"
                      placeholder="Enter your pickup address"
                      {...register('pickupLocation')}
                      error={!!errors.pickupLocation}
                      helperText={errors.pickupLocation?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Destination"
                      placeholder="Where do you want to go?"
                      {...register('destination')}
                      error={!!errors.destination}
                      helperText={errors.destination?.message}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn color="action" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                      Choose Your Ride
                    </Typography>
                    <Grid container spacing={2}>
                      {cabTypes.map((cabType) => (
                        <Grid item xs={12} sm={4} key={cabType.id}>
                          <Card
                            variant={watchCabType === cabType.id ? 'elevation' : 'outlined'}
                            sx={{
                              cursor: 'pointer',
                              border: watchCabType === cabType.id ? 2 : 1,
                              borderColor: watchCabType === cabType.id ? 'primary.main' : 'divider',
                              '&:hover': {
                                borderColor: 'primary.main',
                              },
                            }}
                            onClick={() => handleCabTypeSelect(cabType.id)}
                          >
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h3" sx={{ mb: 1 }}>
                                {cabType.icon}
                              </Typography>
                              <Typography variant="h6" gutterBottom>
                                {cabType.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {cabType.description}
                              </Typography>
                              <Box sx={{ mb: 2 }}>
                                {cabType.features.map((feature, index) => (
                                  <Chip
                                    key={index}
                                    label={feature}
                                    size="small"
                                    sx={{ mr: 0.5, mb: 0.5 }}
                                  />
                                ))}
                              </Box>
                              <Typography variant="h6" color="primary">
                                ${cabType.basePrice} + ${cabType.perKmPrice}/km
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                    {errors.cabType && (
                      <Alert severity="error" sx={{ mt: 2 }}>
                        {errors.cabType.message}
                      </Alert>
                    )}
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!errors.paymentMethod}>
                      <InputLabel>Payment Method</InputLabel>
                      <Select
                        label="Payment Method"
                        {...register('paymentMethod')}
                      >
                        {paymentMethods.map((method) => (
                          <MenuItem key={method.id} value={method.id}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <span>{method.icon}</span>
                              <span>{method.name}</span>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.paymentMethod && (
                        <Typography variant="caption" color="error">
                          {errors.paymentMethod.message}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={loading}
                      sx={{ mt: 2 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Book Now'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Trip Summary */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Trip Summary
              </Typography>
              
              {selectedCabType && (
                <Box>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <span style={{ fontSize: '2rem' }}>{selectedCabType.icon}</span>
                    <Box>
                      <Typography variant="h6">{selectedCabType.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedCabType.description}
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <List dense>
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <LocationOn />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Pickup"
                        secondary={watchPickupLocation || 'Not specified'}
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'secondary.main' }}>
                          <LocationOn />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Destination"
                        secondary={watchDestination || 'Not specified'}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'success.main' }}>
                          <AccessTime />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Estimated Time"
                        secondary={`${estimatedTime} minutes`}
                      />
                    </ListItem>

                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'warning.main' }}>
                          <Payment />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary="Estimated Fare"
                        secondary={`$${estimatedFare.toFixed(2)}`}
                      />
                    </ListItem>
                  </List>

                  <Divider sx={{ my: 2 }} />

                  <Box textAlign="center">
                    <Typography variant="h5" color="primary" gutterBottom>
                      ${estimatedFare.toFixed(2)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total estimated fare
                    </Typography>
                  </Box>
                </Box>
              )}

              {!selectedCabType && (
                <Box textAlign="center" py={4}>
                  <DirectionsCar sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    Fill in your trip details to see the summary
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Available Drivers */}
          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Drivers
              </Typography>
              
              {availableCabs.length > 0 ? (
                <List dense>
                  {availableCabs.slice(0, 3).map((cab) => (
                    <ListItem key={cab.id}>
                      <ListItemAvatar>
                        <Avatar>
                          <Person />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${cab.driver?.name || 'Driver'}`}
                        secondary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                            <span>4.8</span>
                            <span>•</span>
                            <span>{cab.vehicleModel}</span>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" textAlign="center">
                  No drivers available at the moment
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BookRide; 
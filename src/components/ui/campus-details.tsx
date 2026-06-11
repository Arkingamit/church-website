"use client";

import React from 'react';
import { MapPin, Clock, Phone, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface CampusInfo {
  id: string;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  phone: string;
  email: string;
  serviceTimes: {
    day: string;
    times: string[];
  }[];
  pastor: string;
  latitude?: number;   // ✅ use number, not Int16Array
  longitude?: number;  // ✅ use number, not Int16Array
}

const campuses: CampusInfo[] = [
  {
    id: 'main',
    name: 'Central Campus',
    address: '2nd floor, Sahitya Seva Sadan...',
    city: 'Ahmedabad',
    zipCode: '380006',
    phone: '+91 9913037373',
    email: 'central@gmail.com',
    serviceTimes: [
      { day: 'Sunday', times: ['9:00 AM', '12:00 PM'] },
    ],
    latitude: 23.0238286,
    longitude: 72.5664641,
    pastor: 'Pastor Geo',
  },
  {
    id: 'north',
    name: 'North Campus',
    address: 'Motera 3rd Floor, Balaji Mall...',
    city: 'Ahmedabad',
    zipCode: '382424',
    phone: '+91 9913037373',
    email: 'north@gracecommunity.org',
    serviceTimes: [
      { day: 'Sunday', times: ['9:00 AM', '12:00 PM'] },
    ],
    latitude: 23.1018817,
    longitude: 72.5939797,
    pastor: 'Pastor Blesson',
  },
  {
    id: 'Grace West',
    name: 'Grace West',
    address: 'Alliance Francaise - French Gallery Hall...',
    city: 'Ahmedabad',
    zipCode: '380006',
    phone: '+91 9913037373',
    email: 'gracewest@gracecommunity.org',
    serviceTimes: [
      { day: 'Sunday', times: ['9:00 AM', '12:00 PM'] },
    ],
    latitude: 23.0125759,
    longitude: 72.5335937,
    pastor: 'Pastor Kenneth',
  },
];

export const CampusDetails = () => {
  const openDirections = (latitude?: number, longitude?: number) => {
    if (latitude && longitude) {
      // ✅ Use coordinates
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Campus Locations
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find a Grace Community Church campus near you...
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {campuses.map((campus) => (
            <Card key={campus.id} className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-primary">
                  {campus.name}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Led by {campus.pastor}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Address */}
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-foreground">{campus.address}</p>
                    <p className="text-muted-foreground">{campus.city}, {campus.zipCode}</p>
                  </div>
                </div>

                {/* Service Times */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">Service Times</span>
                  </div>
                  {campus.serviceTimes.map((schedule, index) => (
                    <div key={index} className="ml-7">
                      <p className="font-medium text-foreground">{schedule.day}</p>
                      <p className="text-muted-foreground">
                        {schedule.times.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Contact Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-primary" />
                    <a href={`tel:${campus.phone}`} className="text-primary hover:text-primary-glow transition-colors">
                      {campus.phone}
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-primary" />
                    <a href={`mailto:${campus.email}`} className="text-primary hover:text-primary-glow transition-colors">
                      {campus.email}
                    </a>
                  </div>
                </div>

                {/* Get Directions Button */}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => openDirections(campus.latitude, campus.longitude)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Get Directions
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

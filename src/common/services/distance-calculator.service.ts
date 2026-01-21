import { Injectable } from '@nestjs/common';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface AgentWithDistance {
  agentId: string;
  distance: number;
  coordinates: Coordinates;
}

@Injectable()
export class DistanceCalculatorService {
  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param coord1 First coordinate (lat, lng)
   * @param coord2 Second coordinate (lat, lng)
   * @returns Distance in kilometers
   */
  calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(coord2.latitude - coord1.latitude);
    const dLon = this.toRadians(coord2.longitude - coord1.longitude);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(coord1.latitude)) * 
      Math.cos(this.toRadians(coord2.latitude)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10000) / 10000; // Round to 4 decimal places (0.1m precision)
  }

  /**
   * Find the closest agent to given coordinates
   * @param businessCoordinates Business location coordinates
   * @param agentCoordinates Array of agent coordinates with IDs
   * @returns Closest agent with distance information
   */
  findClosestAgent(
    businessCoordinates: Coordinates,
    agentCoordinates: AgentWithDistance[]
  ): AgentWithDistance | null {
    if (!agentCoordinates.length) {
      return null;
    }

    const agentsWithDistances = agentCoordinates.map(agent => ({
      ...agent,
      distance: this.calculateDistance(businessCoordinates, agent.coordinates),
    }));

    // Sort by distance and return the closest
    agentsWithDistances.sort((a, b) => a.distance - b.distance);
    
    return agentsWithDistances[0];
  }

  /**
   * Find all agents within a specified radius
   * @param businessCoordinates Business location coordinates
   * @param agentCoordinates Array of agent coordinates with IDs
   * @param radiusKm Maximum radius in kilometers
   * @returns Array of agents within radius, sorted by distance
   */
  findAgentsWithinRadius(
    businessCoordinates: Coordinates,
    agentCoordinates: AgentWithDistance[],
    radiusKm: number = 50 // Default 50km radius
  ): AgentWithDistance[] {
    const agentsWithDistances = agentCoordinates
      .map(agent => ({
        ...agent,
        distance: this.calculateDistance(businessCoordinates, agent.coordinates),
      }))
      .filter(agent => agent.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return agentsWithDistances;
  }

  /**
   * Check if a location is within a city/region boundary (simplified implementation)
   * In a real application, you might use more sophisticated geo-boundaries
   * @param coordinates Location coordinates
   * @param cityCenter City center coordinates
   * @param cityRadiusKm City radius in kilometers
   * @returns Whether the location is within the city
   */
  isWithinCity(
    coordinates: Coordinates,
    cityCenter: Coordinates,
    cityRadiusKm: number = 25
  ): boolean {
    const distance = this.calculateDistance(coordinates, cityCenter);
    return distance <= cityRadiusKm;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
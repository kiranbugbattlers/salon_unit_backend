export interface Coordinates {
    latitude: number;
    longitude: number;
}
export interface AgentWithDistance {
    agentId: string;
    distance: number;
    coordinates: Coordinates;
}
export declare class DistanceCalculatorService {
    calculateDistance(coord1: Coordinates, coord2: Coordinates): number;
    findClosestAgent(businessCoordinates: Coordinates, agentCoordinates: AgentWithDistance[]): AgentWithDistance | null;
    findAgentsWithinRadius(businessCoordinates: Coordinates, agentCoordinates: AgentWithDistance[], radiusKm?: number): AgentWithDistance[];
    isWithinCity(coordinates: Coordinates, cityCenter: Coordinates, cityRadiusKm?: number): boolean;
    private toRadians;
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DistanceCalculatorService = void 0;
const common_1 = require("@nestjs/common");
let DistanceCalculatorService = class DistanceCalculatorService {
    calculateDistance(coord1, coord2) {
        const R = 6371;
        const dLat = this.toRadians(coord2.latitude - coord1.latitude);
        const dLon = this.toRadians(coord2.longitude - coord1.longitude);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(coord1.latitude)) *
                Math.cos(this.toRadians(coord2.latitude)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return Math.round(distance * 10000) / 10000;
    }
    findClosestAgent(businessCoordinates, agentCoordinates) {
        if (!agentCoordinates.length) {
            return null;
        }
        const agentsWithDistances = agentCoordinates.map(agent => ({
            ...agent,
            distance: this.calculateDistance(businessCoordinates, agent.coordinates),
        }));
        agentsWithDistances.sort((a, b) => a.distance - b.distance);
        return agentsWithDistances[0];
    }
    findAgentsWithinRadius(businessCoordinates, agentCoordinates, radiusKm = 50) {
        const agentsWithDistances = agentCoordinates
            .map(agent => ({
            ...agent,
            distance: this.calculateDistance(businessCoordinates, agent.coordinates),
        }))
            .filter(agent => agent.distance <= radiusKm)
            .sort((a, b) => a.distance - b.distance);
        return agentsWithDistances;
    }
    isWithinCity(coordinates, cityCenter, cityRadiusKm = 25) {
        const distance = this.calculateDistance(coordinates, cityCenter);
        return distance <= cityRadiusKm;
    }
    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
};
exports.DistanceCalculatorService = DistanceCalculatorService;
exports.DistanceCalculatorService = DistanceCalculatorService = __decorate([
    (0, common_1.Injectable)()
], DistanceCalculatorService);
//# sourceMappingURL=distance-calculator.service.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BusinessStatus = exports.MediaType = exports.ServiceLocationType = void 0;
var ServiceLocationType;
(function (ServiceLocationType) {
    ServiceLocationType["AT_SHOP"] = "at_shop";
    ServiceLocationType["AT_USER_LOCATION"] = "at_user_location";
    ServiceLocationType["BOTH"] = "both";
})(ServiceLocationType || (exports.ServiceLocationType = ServiceLocationType = {}));
var MediaType;
(function (MediaType) {
    MediaType["IMAGE"] = "image";
    MediaType["VIDEO"] = "video";
})(MediaType || (exports.MediaType = MediaType = {}));
var BusinessStatus;
(function (BusinessStatus) {
    BusinessStatus["DRAFT"] = "draft";
    BusinessStatus["ACTIVE"] = "active";
    BusinessStatus["INACTIVE"] = "inactive";
    BusinessStatus["SUSPENDED"] = "suspended";
})(BusinessStatus || (exports.BusinessStatus = BusinessStatus = {}));
//# sourceMappingURL=service-location-type.enum.js.map
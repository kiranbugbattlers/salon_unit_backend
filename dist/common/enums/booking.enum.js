"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceLocation = exports.BookingStatus = void 0;
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["IN_PROGRESS"] = "in-progress";
    BookingStatus["COMPLETED"] = "completed";
    BookingStatus["CANCELLED"] = "cancelled";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var ServiceLocation;
(function (ServiceLocation) {
    ServiceLocation["IN_SALON"] = "in-salon";
    ServiceLocation["AT_HOME"] = "at-home";
})(ServiceLocation || (exports.ServiceLocation = ServiceLocation = {}));
//# sourceMappingURL=booking.enum.js.map
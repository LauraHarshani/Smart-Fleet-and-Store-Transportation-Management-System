const Booking = require("../models/booking");
const Trip = require("../models/trip");
const StoreSlot = require("../models/StoreSlot");

const createError = (statusCode, message) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const cancelBooking = async (bookingId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw createError(404, "Booking not found.");
  }

  if (booking.status === "Cancelled") {
    throw createError(400, "This booking is already cancelled.");
  }

  if (booking.status === "Completed" || booking.status === "In Progress") {
    throw createError(
      400,
      "A booking that is in progress or completed cannot be cancelled."
    );
  }

  let tripResult = null;

  if (booking.trip) {
    const trip = await Trip.findById(booking.trip);

    if (trip) {
      if (trip.status === "In Progress" || trip.status === "Completed") {
        throw createError(
          400,
          "The linked trip is already in progress or completed."
        );
      }

      // Remove this booking from the trip.
      trip.bookings = trip.bookings.filter(
        (tripBookingId) =>
          tripBookingId.toString() !== booking._id.toString()
      );

      if (trip.bookings.length === 0) {
        // No bookings remain, so cancel the trip.
        trip.status = "Cancelled";
        await trip.save();

        // Cancel active reservations belonging to this trip.
        await StoreSlot.updateMany(
          {
            trip: trip._id,
            status: { $in: ["Reserved", "Confirmed", "Rescheduled"] }
          },
          {
            $set: { status: "Cancelled" }
          }
        );

        tripResult = {
          tripId: trip.id,
          status: "Cancelled",
          remainingBookings: 0,
          reservationsCancelled: true
        };
      } else {
        await trip.save();

        tripResult = {
          tripId: trip.id,
          status: trip.status,
          remainingBookings: trip.bookings.length,
          reservationsCancelled: false
        };
      }
    }
  }

  // Finally, cancel the booking.
  booking.status = "Cancelled";
  await booking.save();

  return {
    booking,
    trip: tripResult
  };
};

module.exports = { cancelBooking };

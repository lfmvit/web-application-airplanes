function Reservation(id, userId, planeType, seats) {
    this.id = id;
    this.userId = userId;
    this.planeType = planeType;
    this.seats = seats;
  

  this.addSeat = (seat) =>  {
    this.seats.push(seat);
  }

  this.removeSeat = (seatId) => {
    this.seats = this.seats.filter(seat => seat.id !== seatId);
  }
}

function Seat(id , reservationId,row,position,status) {

    this.id = id;
    this.reservationId = reservationId;
    this.row = row;
    this.position = position;
    this.status = status;
  }


export  { Reservation, Seat };
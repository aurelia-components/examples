export class Timespan {
  constructor(timespan) {
    let hours = 0;
    let minutes = 0;
    if (typeof timespan === 'string') {
      let fragments = timespan.split(':');
      if (fragments.length >= 2) {
        hours = parseInt(fragments[0], 10);
        minutes = parseInt(fragments[1], 10);

        if (hours < 0 || hours > 23) {
          hours = 0;
        }

        if (minutes < 0 || minutes > 59) {
          minutes = 0;
        }
      }
    } else if (timespan.constructor.name === 'Moment') {
      hours = timespan.hours();
      minutes = timespan.minutes();
    }

    this.hours = hours;
    this.minutes = minutes;
  }

  toString() {
    let result = '';
    if (this.hours < 10) {
      result += '0';
    }

    result += this.hours + ':';

    if (this.minutes < 10) {
      result += '0';
    }

    result += this.minutes;

    return result;
  }

  equals(other) {
    if (other === undefined || other === null) {
      return false;
    }

    return (this.hours === other.hours && this.minutes === other.minutes);
  }
}

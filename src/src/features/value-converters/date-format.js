import moment from 'moment';

export class DateFormatValueConverter {
  toView(value, format) {
    if (format) {
      return moment(value).format(format);
    }
    return value ? moment(value).format('L') : '';
  }
}

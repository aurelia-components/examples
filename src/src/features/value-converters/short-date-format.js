import moment from 'moment';

export class ShortDateFormatValueConverter {
  toView(value, format) {
    if (format) {
      return moment(value).format(format);
    }
    return value ? moment(value).format('L') : '';
  }
}

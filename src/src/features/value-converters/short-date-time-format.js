import moment from 'moment';

export class ShortDateTimeFormatValueConverter {
  toView(value, format) {
    if (format) {
      return moment(value).format(format);
    }
    return value ? moment(value).format('DD.MM.YYYY HH:mm') : '';
  }
}

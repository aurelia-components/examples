import {inject, customElement, bindable, bindingMode} from 'aurelia-framework';
import $ from 'jquery';
import 'Eonasdan/bootstrap-datetimepicker';
import moment from 'moment';
import {customElementHelper} from 'utils';

@customElement('datetimepicker')
@inject(Element)
export class Datepicker {
  @bindable({defaultBindingMode: bindingMode.twoWay}) value = null;
  @bindable options = null;
  @bindable disabled = false;
  @bindable readonly = false;

  constructor(element) {
    this.element = element;
  }

  bind() {
    let self = this;
    const defaultOpts = {
      collapse: false,
      useCurrent: false,
      calendarWeeks: true,
      locale: moment.locale(),
      sideBySide: true,
      icons: {
        time: 'fa fa-clock-o',
        date: 'fa fa-calendar',
        up: 'fa fa-chevron-up',
        down: 'fa fa-chevron-down',
        previous: 'fa fa-chevron-left',
        next: 'fa fa-chevron-right',
        today: 'fa fa-crosshairs',
        clear: 'fa fa-trash',
        close: 'fa fa-times'
      }
    };

    let div = this.element.firstElementChild;
    this.$element = $(div);

    this.options = this.options || {};
    if (this.options.format !== undefined) {
      delete this.options.format;
    }
    this.options = $.extend({}, defaultOpts, this.options);

    this.datepicker = this.$element.datetimepicker(this.options);

    this.datepicker.on('dp.change', (event) => {
      const value = event.date;
      const el = this.element;
      customElementHelper.dispatchEvent(el, 'change', {
        value: value,
        element: el
      });

      this.value = value;
    });

    this.valueChanged(this.value);
  }

  valueChanged(newValue, oldValue) {
    if (newValue === null || newValue === undefined || newValue === false || newValue.isValid() !== true) {
      let input = this.element.firstElementChild.firstElementChild;
      input.value = '';
      return;
    }

    if (newValue.isSame(oldValue) && oldValue !== undefined) {
      return;
    }

    this.$element.data('DateTimePicker').date(newValue);
  }
}

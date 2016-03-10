export class SumFormatValueConverter {
  toView(value) {
    if (value === undefined || value === null || value === '') {
      return;
    }

    return `${value.amount.toLocaleString('bg-BG', {
      style: 'currency',
      currency: value.currency
    })}`;
  }
}


//${value.currency}

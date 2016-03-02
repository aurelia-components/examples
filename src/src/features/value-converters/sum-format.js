export class SumFormatValueConverter {
  toView(value) {
    if(value === undefined || value === null || value === '')
    {
      return;
    }

    return `${value.amount.toLocaleString('bg-BG', {
      style: 'currency',
        //currency: value.currency
        //TODO remove this line when results data is fix
      currency: value.currency ? value.currency : 'BGN'
    })}`;
  }
}


//${value.currency}

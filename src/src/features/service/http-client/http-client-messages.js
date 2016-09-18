export class HttpRequestStartedMessage {
}

export class HttpRequestFinishedMessage {
}

export class HttpBadRequestMessage {
  constructor(error) {
    this.error = error;
  }
}

export class BusinessRuleValidationException {
  constructor(error) {
    this.error = error;
  }
}

export class HttpServerErrorRequestMessage {
  constructor(errors) {
    this.errors = errors;
  }
}

export class HttpSessionTimedOutMessage {
}

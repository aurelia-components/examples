export class UserLoggedInEvent {
  constructor(authToken) {
    this.authToken = authToken;
  }
}

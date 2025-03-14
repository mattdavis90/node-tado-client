export interface DeviceVerification {
  device_code: string;
  expires_in: number;
  interval: number;
  user_code: string;
  verification_uri: string;
  verification_uri_complete: string;
}

export interface DeviceToken {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: string;
  userId: string;
}

export interface Token {
  access_token: string;
  refresh_token: string;
  expiry: Date;
}

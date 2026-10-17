/** The reader's second factor, and the credential Keycloak's `delete_credential` removes to turn it off. */
export type SecuritySettings = {
  twoFactorEnabled: boolean;
  configuredFactors: string[];
  twoFactorCredentialId: string | null;
};

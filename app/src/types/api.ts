
type UUID = string;
type CUID = string;
type EthereumAddress = string;

export interface User {
  id: UUID;
  createdAt: Date;
  ethAddress: EthereumAddress;
  referalId: CUID;
}

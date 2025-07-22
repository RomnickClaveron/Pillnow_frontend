export interface ContainerData {
  id: string;
  userId: string;
  name: string;
  description?: string;
  alarms: string[];
  phoneNumber?: string;
  createdAt?: Date;
  lastUpdated?: Date;
}

export interface ContainerState {
  selectedPills: {
    [key: number]: string | null;
  };
  alarms: {
    [key: number]: Date[];
  };
}
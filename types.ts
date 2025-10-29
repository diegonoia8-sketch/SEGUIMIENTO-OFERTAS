
export interface Offer {
  id: string; // Document ID from Firestore
  proyecto: string;
  fechaRfq: string; // ISO date string
  responsable: string;
  ultAct: string; // ISO date string

  estado?: string; // Corresponds to Status['name']
  cliente?: string;
  destino?: string;
  volPico?: number;
  volTot?: number;
  sop?: string; // "AAAA"
  duracion?: string;
}

export interface FollowUp {
  id: string; // Document ID from Firestore
  offerId: string; // References Offer Document ID
  fechaAct: string; // ISO date string
  comentario: string;
}

export interface Status {
  id: string; // Document ID from Firestore
  name: string;
  color: string; // hex color code
}
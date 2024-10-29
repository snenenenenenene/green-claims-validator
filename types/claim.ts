// types/claim.ts
export interface Claim {
	id: string;
	userId: string;
	claim: string;
	createdAt: string;
	updatedAt: string;
	status: 'COMPLETED' | 'IN_PROGRESS' | 'OUTDATED';
	progress?: number;
	version?: number;
	currentVersion?: number;
  }
  
  export interface ClaimResponse {
	claims: Claim[];
  }
  
  export interface ClaimUpdateRequest {
	id: string;
	status?: string;
	progress?: number;
  }
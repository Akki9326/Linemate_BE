export interface Config {
	from?: string;
	waba_id?: string;
	'access-token'?: string;
	provider?: string;
	domain?: string;
	sender?: string;
	apikey?: string;
}

// Define the interface for the payload object
export interface CommunicationPayload {
	integration_id: string;
	config: Config;
	custom_name: string;
	edited_enc_keys: string[];
	workSpaceId: string;
}

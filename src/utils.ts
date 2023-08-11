import { SchemaEncoder } from '@ethereum-attestation-service/eas-sdk';

export function encodeAttestationData(
  data: Record<string, any>,
  types: { name: string; type: string }[]
) {
  const signature = types.map(({ type, name }) => `${type} ${name}`).join(', ');
  const schemaEncoder = new SchemaEncoder(signature);

  const dataToEncode = types.map((type) => ({
    ...type,
    value: data[type.name] || undefined,
  }));
  return schemaEncoder.encodeData(dataToEncode);
}

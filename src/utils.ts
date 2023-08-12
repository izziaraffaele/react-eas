import {
  SchemaEncoder,
  SchemaValue,
} from '@ethereum-attestation-service/eas-sdk';

export function encodeAttestationData(
  data: Record<string, SchemaValue>,
  types: { name: string; type: string }[]
) {
  const signature = types.map(({ type, name }) => `${type} ${name}`).join(', ');
  const schemaEncoder = new SchemaEncoder(signature);

  const dataToEncode = types.map((type) => ({
    ...type,
    value: data[type.name],
  }));

  return schemaEncoder.encodeData(dataToEncode);
}

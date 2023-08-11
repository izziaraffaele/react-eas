import {
  SchemaEncoder,
  SchemaItem,
} from '@ethereum-attestation-service/eas-sdk';
import { encodeAttestationData } from '../../src/utils';

jest.mock('@ethereum-attestation-service/eas-sdk', () => ({
  ...jest.requireActual('@ethereum-attestation-service/eas-sdk'),
  SchemaEncoder: jest.fn().mockImplementation(() => ({
    encodeData: jest.fn().mockReturnValue('mockEncodedData'),
  })),
}));

describe('utils', () => {
  describe('encodeAttestationData', () => {
    const testData: Record<string, any> = {};
    const testSchema = [
      { name: 'field1', type: 'string' },
      { name: 'field2', type: 'string' },
    ];

    const matchSignature = 'string field1, string field2';

    const runTest = () => encodeAttestationData(testData, testSchema);

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('forms the correct signature from types', () => {
      runTest();
      expect(SchemaEncoder).toHaveBeenCalledWith(matchSignature);
    });

    it('maps input data correctly for encoding', () => {
      testData.field1 = 'value1';
      testData.field2 = 'value2';

      const encodedValue = runTest();

      const encoder = new SchemaEncoder(matchSignature);
      const expectedEncodedValue = encoder.encodeData(
        testSchema.map((v) => ({ ...v, value: testData[v.name] }))
      );

      expect(encodedValue).toEqual(expectedEncodedValue);
    });
  });
});

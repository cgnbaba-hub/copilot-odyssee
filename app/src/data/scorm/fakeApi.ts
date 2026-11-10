import { Scorm12Api } from './ScormApi';

export type FakeApi = Scorm12Api & { calls: string[]; values: { [element: string]: string } };

/** Test helper: an LMS API that keeps values in an object and records every call. */
export function fakeApi(values: { [element: string]: string } = {}): FakeApi {
  const calls: string[] = [];
  return {
    calls,
    values,
    LMSInitialize: () => {
      calls.push('init');
      return 'true';
    },
    LMSFinish: () => {
      calls.push('finish');
      return 'true';
    },
    LMSGetValue: (element: string) => values[element] || '',
    LMSSetValue: (element: string, value: string) => {
      calls.push(`set ${element}`);
      values[element] = value;
      return 'true';
    },
    LMSCommit: () => {
      calls.push('commit');
      return 'true';
    }
  };
}

import type { Faker } from '@faker-js/faker' with { 'resolution-mode': 'import' };

let fakerPromise: Promise<Faker> | undefined;

const getFaker = async (): Promise<Faker> => {
  fakerPromise ??= import('@faker-js/faker').then((m) => m.faker);
  return fakerPromise;
};

export default getFaker;

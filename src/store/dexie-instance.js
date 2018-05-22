import Dexie from 'dexie';

const db = new Dexie('bf-mt');

const defaultSchema = '&server,data,updateTime';
db.version(1).stores({
  units: defaultSchema,
  items: defaultSchema,
  bursts: defaultSchema,
  extraSkiils: defaultSchema,
  leaderSkills: defaultSchema,
  settings: '&user,data',
});

export default db;

// frontend/src/db/index.js
import Dexie from 'dexie'

export const db = new Dexie('SFMS_Kenya_DB')

// Define tables and indexed keys for fast offline lookups
db.version(1).stores({
  farms: 'id, farm_name, location, farm_type, created_at, _synced',
  crops: 'id, farm, crop_name, status, next_spray_date, created_at, _synced',
  sprays: 'id, crop, spray_date, created_at, _synced',
  harvests: 'id, crop, harvest_date, quality_grade, created_at, _synced',
  animals: 'id, farm, animal_tag, animal_type, status, created_at, _synced',
  health: 'id, animal, record_type, date_given, next_due_date, created_at, _synced',
  soil_logs: 'id, farm, test_date, created_at, _synced',
  tasks: 'id, farm, title, status, due_date, created_at, _synced',
  financials: 'id, farm, type, category, date, created_at, _synced',
  community_posts: 'id, post_type, county, created_at, _synced',
  notifications: 'id, type, due_date, status, created_at, _synced',
  sync_queue: '++id, endpoint, method, createdAt, attempts',
})

export default db

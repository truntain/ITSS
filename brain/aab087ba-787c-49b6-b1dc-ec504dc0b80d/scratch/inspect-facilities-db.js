const { Client } = require('c:/Users/USER/Desktop/HUST/ITSS/backend/node_modules/pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123456',
  database: 'Gympro',
});

async function main() {
  try {
    await client.connect();
    console.log('Connected to PG successfully.');
    
    const resFacilities = await client.query(`SELECT * FROM public.facilities;`);
    console.log('Facilities in database:', resFacilities.rows);

    const resEquipment = await client.query(`SELECT * FROM public.equipment;`);
    console.log('Equipment in database:', resEquipment.rows);

    const resReports = await client.query(`SELECT * FROM public.equipment_reports;`);
    console.log('Reports in database:', resReports.rows);
    
  } catch (err) {
    console.error('Error executing query:', err);
  } finally {
    await client.end();
  }
}

main();

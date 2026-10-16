






export function buildUpdate(data, columnMap) {
  const sets = [];
  const values = [];
  for (const [key, column] of Object.entries(columnMap)) {
    if (data[key] !== undefined) {
      values.push(data[key]);
      sets.push(`${column} = $${values.length}`);
    }
  }
  return { sets, values };
}

 
export function escapeLike(value) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}
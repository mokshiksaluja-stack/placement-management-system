function Table({ columns, data, rowActions, emptyMessage = "No data found in database yet." }) {
  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column.key}>{column.label}</th>
            ))}
            {rowActions ? <th>Actions</th> : null}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row._id || `${row.companyName}-${row.role}`}>
              {columns.map((column) => (
                <td key={`${row._id || row.companyName}-${column.key}`}>{row[column.key]}</td>
              ))}
              {rowActions ? <td>{rowActions(row)}</td> : null}
            </tr>
          ))}
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + (rowActions ? 1 : 0)}>{emptyMessage}</td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
